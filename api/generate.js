
export default async function handler(req, res) {
  const { topic, type, level } = req.body;

  const tokenLimits = {
    "5": 1000,   // approx 750 words
    "5*": 1050,  // approx 800 words
    "5**": 1150  // approx 850 words
  };

  const wordTarget = {
    "5": "750 words",
    "5*": "800 words",
    "5**": "850 words"
  };

  const max_tokens = tokenLimits[level] || 1000;
  const prompt = `You are simulating a Level ${level} HKDSE English Paper 2 student.

Task:
Write a ${type} on the topic: "${topic}" in the style of a Level ${level} HKDSE candidate.

Requirements:
- Structure and tone should fit the text type
- Match the expected language level, vocabulary, and coherence of a Level ${level} student
- Your response should aim for approximately ${wordTarget[level]} (within token limit)
- End your writing with: "Word count: ___ words"`;

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
        max_tokens
      })
    });

    const writingData = await writingRes.json();
    let fullText = writingData.choices?.[0]?.message?.content || "";

    // Remove token-estimated word count footer
    const contentOnly = fullText.replace(/Word count:\s*\d+\s*words?/i, "").trim();
    const stripped = contentOnly.replace(/[.,!?;:"'()\[\]{}<>\/\-]/g, " ");
    const cleanWords = stripped.split(/\s+/).filter(Boolean);
    const actualWordCount = cleanWords.length;

    const finalText = contentOnly + `\n\nWord count: ${actualWordCount} words`;

    res.status(200).json({ writing: finalText });
  } catch (err) {
    console.error("Token-based error:", err);
    res.status(500).json({ error: "Failed to generate writing." });
  }
}
