
export default async function handler(req, res) {
  const { writing, level } = req.body;

  const max_tokens = {
    "5": 1000,
    "5*": 1200,
    "5**": 1400
  }[level] || 1000;

  const prompt = `
You are an HKDSE English Paper 2 examiner.

You are given a piece of student writing. Your task is to write detailed examiner feedback for it.

Instructions:
- Assess the writing according to three criteria: Content, Language, and Organization.
- For each category, write 2-4 sentences.
- Quote phrases or lines directly from the student’s writing to explain your comments.
- Be specific and educational. Mention both strengths and minor areas for improvement.
- End the feedback without assigning a numerical score or grade.

Student writing:
${writing}
`;

  const openaiUrl = "https://dsewriterai.openai.azure.com/openai/deployments/gpt35-dse/chat/completions?api-version=2025-01-01-preview";
  const headers = {
    "Content-Type": "application/json",
    "api-key": process.env.AZURE_OPENAI_KEY
  };

  try {
    const response = await fetch(openaiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a professional HKDSE English examiner." },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens
      })
    });

    const data = await response.json();
    const feedback = data.choices?.[0]?.message?.content || "";
    res.status(200).json({ feedback });

  } catch (err) {
    console.error("Feedback generation error:", err);
    res.status(500).json({ error: "Failed to generate feedback." });
  }
}
