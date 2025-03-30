
export default async function handler(req, res) {
  const { writing, level } = req.body;

  const max_tokens = {
    "5": 1000,
    "5*": 1200,
    "5**": 1400
  }[level] || 1000;

  const prompt = `
You are an experienced HKDSE English Paper 2 examiner.

Your task is to evaluate a student's writing based on three categories:
1. Content
2. Language
3. Organization

For each category:
- Write 2 to 4 sentences
- Quote specific phrases or lines from the student's writing to support your comments
- Explain both strengths and minor weaknesses
- Do not assign a score or say what level it is

Here is the student writing:
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
          { role: "system", content: "You are a professional HKDSE English writing examiner." },
          { role: "user", content: prompt }
        ],
        temperature: 0.4,
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
