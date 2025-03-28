export default async function handler(req, res) {
  const { topic, type, level } = req.body;

  const prompt = `You are an HKDSE English Paper 2 examiner. Write a ${type} on the topic: "${topic}". The response should reflect the qualities of a Level ${level} candidate according to the HKDSE English writing rubrics.

Instructions:
- Use a clear and appropriate structure for the text type
- Maintain a relevant, focused, and well-developed response
- Use vocabulary and sentence structures suitable for a Level ${level} performance
- Demonstrate language accuracy with appropriate tone and style

Make sure the writing is realistic and reflective of actual student responses at this level.`;

  const openaiUrl = "https://dsewriterai.openai.azure.com/openai/deployments/gpt35-dse/chat/completions?api-version=2025-01-01-preview";

  const headers = {
    "Content-Type": "application/json",
    "api-key": process.env.AZURE_OPENAI_KEY
  };

  try {
    const writingRes = await fetch(openaiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are an HKDSE English writing examiner." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    const writingData = await writingRes.json();
    const writing = writingData.choices?.[0]?.message?.content || "";

    const feedbackPrompt = `You are an HKDSE English Paper 2 examiner. Evaluate the following student writing using the official Paper 2 rubrics. Give specific comments on:
1. Content
2. Language
3. Organisation
Then estimate the band level (5 / 5* / 5**).

Writing:
${writing}`;

    const feedbackRes = await fetch(openaiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are an HKDSE examiner." },
          { role: "user", content: feedbackPrompt }
        ],
        temperature: 0.5,
        max_tokens: 500
      })
    });

    const feedbackData = await feedbackRes.json();
    const comment = feedbackData.choices?.[0]?.message?.content || "";

    res.status(200).json({ writing, comment });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to generate writing or feedback." });
  }
}
