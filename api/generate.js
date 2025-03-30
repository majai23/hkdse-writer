
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
    "5": `Write like a realistic Level 5 HKDSE student... Target ${min}–${max} words.`,
    "5*": `Write like a confident Level 5* student... Target ${min}–${max} words.`,
    "5**": `Write like a top Level 5** HKDSE candidate... Target ${min}–${max} words.`
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

    writing = writing.replace(/Word count:\s*\d+\s*words?/i, "").trim();

    const cleanText = writing
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\[\]"']/g, "")
      .replace(/\s{2,}/g, " ");
    const wordCount = cleanText.split(/\s+/).filter(Boolean).length;

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

    let warning = "";
    if (wordCount < min) {
      warning = `\n\n⚠️ Warning: Only ${wordCount} words. This is below the required minimum for Level ${level} (${min}–${max}).`;
    }

    writing += `\n\nWord count: ${wordCount} words${warning}`;

    const feedbackPrompt = `You are a DSE English Paper 2 examiner.

The following writing was generated to simulate a Level ${level} student's performance. Justify why it matches the band in the fixed format below. Then suggest improvements and revise it using better vocabulary.

---
Content:
[2–3 sentences about relevance, clarity, ideas, support]

Language:
[2–3 sentences about grammar, phrasing, vocabulary]

Organisation:
[2–3 sentences about paragraphing, coherence, transitions]

Vocabulary Upgrade:
- List 5 simple or vague phrases from the writing.
- Suggest stronger, more precise vocabulary alternatives.
- Briefly explain why they are better.

Revised Version with Vocabulary Upgraded:
- Rewrite the original passage using upgraded vocabulary where appropriate while keeping structure and ideas intact.

Original Writing:
${writing}`;

    const feedbackRes = await fetch(openaiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are an HKDSE examiner and writing coach." },
          { role: "user", content: feedbackPrompt }
        ],
        temperature: 0.6,
        max_tokens: 900
      })
    });

    const feedbackData = await feedbackRes.json();
    const comment = feedbackData.choices?.[0]?.message?.content || "⚠️ No feedback returned. Please try again.";

    res.status(200).json({ writing, comment });
  } catch (err) {
    console.error("FULL API ERROR:", JSON.stringify(err, null, 2));
    res.status(500).json({
      error: "Failed to generate writing or feedback.",
      details: err.message || err,
    });
  }
};
