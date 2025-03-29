
module.exports = async function handler(req, res) {
  const { topic, type, level } = req.body;

  let wordLimit = "700–850";
  let minWords = 700;
  let maxWords = 850;

  if (level === "5") {
    wordLimit = "600–750";
    minWords = 600;
    maxWords = 750;
  } else if (level === "5*") {
    wordLimit = "650–800";
    minWords = 650;
    maxWords = 800;
  }

  const openaiUrl =
    "https://dsewriterai.openai.azure.com/openai/deployments/gpt35-dse/chat/completions?api-version=2025-01-01-preview";

  const headers = {
    "Content-Type": "application/json",
    "api-key": process.env.AZURE_OPENAI_KEY,
  };

  async function generateWritingPrompt() {
    let prompt = `You are simulating a Level ${level} HKDSE English Paper 2 student.

Task:
Write a ${type} on the topic: "${topic}" in the style of a Level ${level} candidate.

Important:
- The structure and tone must match the ${type} format exactly.
- Use features typical of that genre — do not mix with others.
- Do NOT begin with greetings unless appropriate.
- The writing must be between ${wordLimit} words (excluding punctuation). If you exceed the limit, truncate at the last full sentence. Do NOT write fewer than the lower limit.

Performance expectations:`;

    if (level === "5") {
      prompt += `
- Mostly appropriate format with some inconsistency allowed
- Vocabulary is appropriate but limited
- Minor grammar errors acceptable
- Clear structure, possibly uneven development
- Word count: 600–750 (excluding punctuation)`;
    } else if (level === "5*") {
      prompt += `
- Consistent format and logical structure
- Moderately rich vocabulary
- Largely accurate grammar
- Style is competent and fluent
- Word count: 650–800 (excluding punctuation)`;
    } else if (level === "5**") {
      prompt += `
- Strong command of format and structure
- Sophisticated, varied vocabulary
- Highly accurate grammar
- Style is confident, mature and fluent
- Word count: 700–850 (excluding punctuation)`;
    }

    return prompt;
  }

  async function getWriting() {
    const writingPrompt = await generateWritingPrompt();

    const writingRes = await fetch(openaiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are an HKDSE English writing examiner.",
          },
          { role: "user", content: writingPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const writingData = await writingRes.json();
    let writing = writingData.choices?.[0]?.message?.content || "";

    // Remove old word count
    writing = writing.replace(/Word count:\s*\d+\s*words?/gi, "").trim();

    // Count words (excluding punctuation)
    const cleaned = writing
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\[\]"']/g, "")
      .replace(/\s{2,}/g, " ");
    const wordCount = cleaned.split(/\s+/).filter(Boolean).length;

    writing += `\n\nWord count: ${wordCount} words`;

    return { writing, wordCount };
  }

  try {
    let { writing, wordCount } = await getWriting();

    // Enforce min word count. If too short, regenerate once.
    if (wordCount < minWords) {
      console.log("⚠️ First writing too short (" + wordCount + " words), retrying...");
      const secondAttempt = await getWriting();
      writing = secondAttempt.writing;
      wordCount = secondAttempt.wordCount;
    }

    const feedbackPrompt = `You are a DSE English Paper 2 examiner.

The following writing was generated to simulate a Level ${level} student's performance. Your task is NOT to give a score, but to justify why the writing matches this level in a fixed format.

Provide comments in this format:
---
Content:
[4-5 sentences about the content with concrete examples]

Language:
[4–5 sentences about vocabulary, grammar, phrasing with concrete examples]

Organisation:
[4–5 sentences about structure and coherence with concrete examples]
---

Do not comment on score. Do not mention other levels. Stay within the chosen band.

Writing:
${writing}`;

    const feedbackRes = await fetch(openaiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are an HKDSE examiner." },
          { role: "user", content: feedbackPrompt },
        ],
        temperature: 0.5,
        max_tokens: 500,
      }),
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
