
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
- Format paragraphs clearly with line breaks.
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

  function countWordsWithParagraphs(text) {
    const cleanedText = text.replace(/Word count:\s*\d+\s*words?/i, "").trim();
    const stripped = cleanedText
      .replace(/[.,!?;:"'()\[\]{}<>\/\-]/g, " ")
      .replace(/\s+/g, " ");
    const words = stripped.trim().split(" ").filter(Boolean);
    return { wordCount: words.length, cleanedText };
  }

  try {
    const messages = [
      { role: "system", content: "You are an HKDSE English writing examiner." },
      { role: "user", content: baseInstruction }
    ];

    let responseText = await fetchGPT(messages);
    let { wordCount, cleanedText } = countWordsWithParagraphs(responseText);

    // Retry if word count too low or "Word count: ___ words" not included
    const needsRetry = wordCount < minWords || !/Word count:\s*\d+\s*words?/i.test(responseText);

    if (needsRetry) {
      const retryMessages = [
        { role: "system", content: "You are an HKDSE English writing examiner." },
        {
          role: "user",
          content: `${baseInstruction}

Your previous answer was only ${wordCount} words or did not include a proper word count. Please revise and expand it to meet the ${minWords}–${maxWords} word requirement, keeping paragraph formatting and tone the same.

Original answer:
${cleanedText}`
        }
      ];
      responseText = await fetchGPT(retryMessages);
      const revised = countWordsWithParagraphs(responseText);
      wordCount = revised.wordCount;
      cleanedText = revised.cleanedText;
    }

    const finalText = cleanedText + `\n\nWord count: ${wordCount} words`;
    res.status(200).json({ writing: finalText });
  } catch (err) {
    console.error("Bulletproof fallback error:", err);
    res.status(500).json({ error: "Failed to generate writing." });
  }
}
