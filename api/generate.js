export default async function handler(req, res) {
  const { topic, type, level } = req.body;

  let wordLimit = "700–850";
  let minWords = 700;
  let maxWords = 850;

  if (level === "5") {
    wordLimit = "600–750";
    minWords = 600;
    maxWords = 750;
  }
  if (level === "5*") {
    wordLimit = "650–800";
    minWords = 650;
    maxWords = 800;
  }

  let prompt = \`You are simulating a Level \${level} HKDSE English Paper 2 student.

Task:
Write a \${type} on the topic: "\${topic}" in the style of a Level \${level} candidate.

Important:
- The structure and tone must match the \${type} text type exactly.
- Use features and format typical of that text type — do not mix with others.
- Do NOT begin with greetings unless it's appropriate for that text type.
- The writing must be between \${wordLimit} words (excluding punctuation). If you exceed the limit, truncate at the last full sentence. Do NOT write fewer than the lower limit.

Performance expectations:\`;

  if (level === "5") {
    prompt += \`
- Format and tone: mostly appropriate but some inconsistency allowed
- Vocabulary: appropriate but limited; some awkward phrasing is acceptable
- Grammar: mostly accurate with some basic errors
- Organisation: clear structure with uneven development allowed
- Style: simple and realistic
- Word count: 600–750 (excluding punctuation)
- End with: Word count: ___ words\`;
  } else if (level === "5*") {
    prompt += \`
- Format and tone: consistent and appropriate to the text type
- Vocabulary: moderately rich, correct word choice
- Grammar: largely accurate with minor lapses
- Organisation: clear and logical structure
- Style: competent and fluent
- Word count: 650–800 (excluding punctuation)
- End with: Word count: ___ words\`;
  } else if (level === "5**") {
    prompt += \`
- Format and tone: accurate and effective for the text type
- Vocabulary: wide and sophisticated, with rhetorical techniques
- Grammar: highly accurate, almost no errors
- Organisation: smooth, coherent and well-developed
- Style: confident, varied, mature
- Word count: 700–850 (excluding punctuation)
- End with: Word count: ___ words\`;
  }

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
        max_tokens: 1000
      })
    });

    const writingData = await writingRes.json();
    let writing = writingData.choices?.[0]?.message?.content || "";

    // Remove any AI-estimated word count first
    writing = writing.replace(/Word count:\s*\d+\s*words?/i, "").trim();

    // Count words excluding punctuation
    const cleanText = writing.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\[\]"']/g, "").replace(/\s{2,}/g, " ");
    const wordCount = cleanText.split(/\s+/).filter(Boolean).length;

    // Append correct word count
    writing += `\n\nWord count: \${wordCount} words`;

    const feedbackPrompt = \`You are a DSE English Paper 2 examiner.

The following writing was generated to simulate a Level \${level} student's performance. Your task is NOT to give a score, but to justify why the writing matches this level in a fixed format.

Provide comments in this format:
---
Content:
[4-5 sentences about the content with concrete examples]

Language:
[4–5 sentences about vocabulary, grammar, phrasing with concrete examples]

Organisation:
[4–5 sentences about structure and coherence with concrete examples]
---

Stay within the chosen band and provide possible marks as if a real examiner marked the generated work using the following format:
   C   L   O
1st marker 6 6 6
2nd marker 6 6 6

The 1st marker is always a stricter one while the 2nd marker is always more leniet.

Writing:
\${writing}\`;

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
