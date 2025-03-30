
export default async function handler(req, res) {
  const { topic, type, level } = req.body;

  const tokenLimits = {
    "5": 1600,
    "5*": 1800,
    "5**": 2000
  };

  const wordLimits = {
    "5": { min: 480, max: 520 },
    "5*": { min: 580, max: 620 },
    "5**": { min: 730, max: 770 }
  };

  const max_tokens = tokenLimits[level] || 1600;
  const minWords = wordLimits[level].min;
  const maxWords = wordLimits[level].max;

  const styleGuidelines = {
    "5": `Write clearly and directly, using proper format and simple to intermediate vocabulary. The tone should be exam-appropriate, with safe sentence structures. Provide at least two concrete real-life examples that help explain your ideas. Examples can be basic or familiar to teenagers.`,
    "5*": `Write fluently with clear structure and more varied vocabulary. Express emotion or persuasion naturally, using rhetorical questions or comparisons. Provide at least two thoughtful real-life examples or situations that support your points clearly and persuasively.`,
    "5**": `Write with a mature tone, sophisticated structure, and precise vocabulary. Use rhetorical devices, transitions, and complex arguments. Provide three insightful real-life examples, such as from current events, societal trends, or real youth experiences. Make sure each example supports a clear, deep idea. Avoid sounding robotic or overly casual.`
  };

  const baseInstruction = `
You are an HKDSE English Paper 2 examiner.

Task:
Write a ${type} on the topic: "${topic}" that would be awarded Level ${level} in the HKDSE exam.

Instructions:
${styleGuidelines[level]}

IMPORTANT:
- You MUST write between ${minWords} and ${maxWords} words.
- You MUST count your words accurately (not tokens).
- Do NOT count paragraph spacing or blank lines as words.
- Do NOT say what level the writer is.
- End with: Word count: ___ words
`;

  const openaiUrl = "https://dsewriterai.openai.azure.com/openai/deployments/gpt35-dse/chat/completions?api-version=2025-01-01-preview";
  const headers = {
    "Content-Type": "application/json",
    "api-key": process.env.AZURE_OPENAI_KEY
  };

  async function fetchGPT(messages) {
    const response = await fetch(openaiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages,
        temperature: 0.7,
        max_tokens
      })
    });
    const json = await response.json();
    return json.choices?.[0]?.message?.content || "";
  }

  function countWords(text) {
    const stripped = text
      .replace(/Word count:\s*\d+\s*words?/i, "")
      .replace(/[.,!?;:"'()\[\]{}<>\/\-]/g, " ")
      .replace(/\n+/g, " ");
    const words = stripped.split(/\s+/).filter(Boolean);
    return { wordCount: words.length, cleaned: stripped.trim() };
  }

  try {
    // Step 1: First attempt
    const messages = [
      { role: "system", content: "You are an HKDSE English writing examiner." },
      { role: "user", content: baseInstruction }
    ];

    let output = await fetchGPT(messages);
    let { wordCount, cleaned } = countWords(output);

    // Step 2: If too short, retry with a full revision request
    if (wordCount < minWords) {
      const retryMessages = [
        { role: "system", content: "You are an HKDSE English writing examiner." },
        {
          role: "user",
          content: `${baseInstruction}

Your previous answer was only ${wordCount} words, which is too short. Please revise and expand it so the word count is between ${minWords} and ${maxWords} words. Keep the structure and topic. Expand the original ideas. Do not change the tone.

Original text:
${cleaned}`
        }
      ];
      output = await fetchGPT(retryMessages);
      const revised = countWords(output);
      wordCount = revised.wordCount;
      cleaned = revised.cleaned;
    }

    const finalText = cleaned + `\n\nWord count: ${wordCount} words`;
    res.status(200).json({ writing: finalText });
  } catch (err) {
    console.error("Multi-turn strict fallback error:", err);
    res.status(500).json({ error: "Failed to generate writing." });
  }
}
