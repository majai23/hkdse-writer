
export default async function handler(req, res) {
  const { topic, type, level } = req.body;

  const prompt = `You are an HKDSE English writing examiner. Write a Level ${level} ${type} on the topic: "${topic}". Use rich vocabulary, clear structure, and vivid examples.`;

  const openaiUrl = "https://dsewriterai.openai.azure.com/openai/deployments/gpt35-dse/chat/completions?api-version=2025-01-01-preview";

  const headers = {
    "Content-Type": "application/json",
    "api-key": process.env.AZURE_OPENAI_KEY
  };

  try {
    // First API call: Generate the writing
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

    // Second API call: Generate examiner feedback
    const feedbackPrompt = `You are an HKDSE English Paper 2 examiner. Evaluate the following student writing using the official Paper 2 rubrics. Give specific comments on:
1. Content
2. Language
3. Organisation
Then estimate the band level (5 / 5* / 5**).

Writing:
` + writing;

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
