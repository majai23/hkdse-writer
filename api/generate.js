
module.exports = async function handler(req, res) {
  const { topic, type, level } = req.body;

  const openaiUrl =
    "https://dsewriterai.openai.azure.com/openai/deployments/gpt35-dse/chat/completions?api-version=2025-01-01-preview";

  const headers = {
    "Content-Type": "application/json",
    "api-key": process.env.AZURE_OPENAI_KEY,
  };

  const limits = {
    "5": { min: 600, max: 750 },
    "5*": { min: 650, max: 800 },
    "5**": { min: 700, max: 850 },
  };
  const { min, max } = limits[level];

  const styles = {
    "5": `Write like a realistic Level 5 HKDSE student. The tone should be natural and a little casual, like Chris Wong's article on shrinking families. Include relatable personal touches, rhetorical questions, or storytelling. Some awkward phrasing is fine. Make your grammar mostly accurate but not perfect. Vocabulary should be simple to intermediate. Structure should have clear points but some uneven development is acceptable. Target ${min}–${max} words.`,
    "5*": `Write like a confident Level 5* student. Use a formal tone and structured paragraphs like the school bus letter to the Bus Operators Association. Use extended arguments and support each with elaboration and examples. Your grammar should be largely accurate, and vocabulary moderately rich. Slight errors in expression are okay. Aim for fluency and coherence. Target ${min}–${max} words.`,
    "5**": `Write like a top Level 5** HKDSE candidate. Your language should be fluent, mature, and academically persuasive — like the real sports vs virtual sports essay. Use rhetorical techniques (e.g., parallelism, repetition), topic sentences, and transition words. Vocabulary should be advanced but appropriate. Structure must be coherent and logical with well-developed paragraphs. Target ${min}–${max} words. Avoid native-speaker perfection — simulate local excellence.`
  };

  const writingPrompt = `You are an HKDSE English Paper 2 student.

Task:
Write a ${type} on the topic: "${topic}".

${styles[level]}

End your writing with:
Word count: ___ words
`;

  try {
    const writingRes = await fetch(openaiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are an HKDSE English writing examiner helping students simulate realistic writing at a target level.",
          },
          { role: "user", content: writingPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const writingData = await writingRes.json();
    let writing = writingData.choices?.[0]?.message?.content || "";

    // Remove estimated word count if present
    writing = writing.replace(/Word count:\s*\d+\s*words?/i, "").trim();

    // Count words excluding punctuation
    const cleaned = writing
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\[\]"']/g, "")
      .replace(/\s{2,}/g, " ");
    const wordCount = cleaned.split(/\s+/).filter(Boolean).length;

    // Truncate if too long (after last full stop within limit)
    if (wordCount > max) {
      const sentences = writing.split(/(?<=[.?!])\s+/);
      let truncated = "";
      let count = 0;
      for (const sentence of sentences) {
        const words = sentence
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\[\]"']/g, "")
          .split(/\s+/)
          .filter(Boolean).length;
        if (count + words > max) break;
        truncated += sentence + " ";
        count += words;
      }
      writing = truncated.trim();
      writing += `\n\n⚠️ Truncated to ${count} words to fit the ${min}-${max} range.`;
    }

    // Warning if too short
    let warning = "";
    if (wordCount < min) {
      warning = `\n\n⚠️ Warning: Only ${wordCount} words. This is below the required minimum for Level ${level} (${min}–${max}).`;
    }

    writing += `\n\nWord count: ${wordCount} words${warning}`;

    const feedbackPrompt = `You are a DSE English Paper 2 examiner.

The following writing was generated to simulate a Level ${level} student's performance. Justify why it matches the band in the fixed format below.

---
Content:
[2–3 sentences about relevance, clarity, ideas, support]

Language:
[2–3 sentences about grammar, phrasing, vocabulary]

Organisation:
[2–3 sentences about paragraphing, coherence, transitions]
---

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
    console.error("FULL API ERROR:", JSON.stringify(err, null, 2));
    res.status(500).json({
      error: "Failed to generate writing or feedback.",
      details: err.message || err,
    });
  }
};
