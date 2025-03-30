
export default async function handler(req, res) {
  const { topic, type, level } = req.body;

  const tokenLimits = {
    "5": 1200,
    "5*": 1250,
    "5**": 1350
  };

  const wordTarget = {
    "5": "900 words",
    "5*": "1000 words",
    "5**": "1150 words"
  };

  const max_tokens = tokenLimits[level] || 1000;
  const prompt = `You are an HKDSE English Paper 2 examiner.

Task:
Write a ${type} on the topic: "${topic}" that would be awarded Level ${level} in the HKDSE exam.

Instructions:
- Use a realistic HKDSE student voice. Do not mention anything like “I am a Level ${level} student.”
- Follow the correct format and tone for a ${type}
- Ensure content, language and organisation reflect the level ${level} standard
- Aim for approximately ${wordTarget[level]} within token limits
- End with: Word count: ___ words`;

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

    // Clean output & compute word count
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
