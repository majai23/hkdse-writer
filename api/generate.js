
export default async function handler(req, res) {
  const { topic, type, level } = req.body;

  const tokenLimits = {
    "5": 1300,
    "5*": 1350,
    "5**": 1450  // Increased for more space for 5**
  };

  const wordLimits = {
    "5": { min: 650, max: 800 },
    "5*": { min: 700, max: 850 },
    "5**": { min: 750, max: 900 }
  };

  const max_tokens = tokenLimits[level] || 1300;
  const minWords = wordLimits[level].min;
  const maxWords = wordLimits[level].max;

  const styleGuidelines = {
    "5": `Write like a capable HKDSE candidate. Use clear paragraphing, appropriate format, and intermediate vocabulary. Allow for minor awkward phrasing or repetition. Do not try to sound native or perfect. Maintain a polite, exam-appropriate tone.`,
    "5*": `Use stronger vocabulary and more varied sentence structures. Maintain clarity, and add emotional engagement or persuasive techniques like rhetorical questions and comparisons. Minor grammar issues are acceptable.`,
    "5**": `Write with sophistication, cohesion, and mature tone. Use rhetorical devices, complex structures, and academic transitions. Vocabulary should be precise and rich. Do not sound overly casual or self-referential. Mimic real top-scoring HKDSE scripts.`
  };

  const prompt = `You are an HKDSE English Paper 2 examiner.

Task:
Write a ${type} on the topic: "${topic}" that would be awarded Level ${level} in the HKDSE exam.

Instructions:
${styleGuidelines[level]}

IMPORTANT:
- You MUST write between ${minWords} and ${maxWords} words.
- You MUST count your words accurately (not tokens).
- Do NOT count paragraph spacing or blank lines as words.
- If the writing is outside the word range, revise and rewrite it before ending.
- Do NOT say what level the writer is.
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

    // Remove original word count
    const contentOnly = fullText.replace(/Word count:\s*\d+\s*words?/i, "").trim();

    // Clean for accurate word count:
    // - remove punctuation
    // - replace paragraph breaks/newlines with space
    const stripped = contentOnly
      .replace(/[.,!?;:"'()\[\]{}<>\/\-]/g, " ")
      .replace(/\n+/g, " "); // collapse paragraph breaks

    const cleanWords = stripped.split(/\s+/).filter(Boolean);
    const actualWordCount = cleanWords.length;

    const finalText = contentOnly + `\n\nWord count: ${actualWordCount} words`;

    res.status(200).json({ writing: finalText });
  } catch (err) {
    console.error("Token-adjusted error:", err);
    res.status(500).json({ error: "Failed to generate writing." });
  }
}
