
export default async function handler(req, res) {
  const { topic, type, level } = req.body;

  let prompt = `You are simulating a Level ${level} HKDSE English Paper 2 student.

Task:
Write a ${type} on the topic: "${topic}" in the style of a Level ${level} candidate.

Important:
- The structure and tone must match the ${type} text type format exactly.
- Use phrases and features that are typical of a ${type}. Do not use formats from other genres.
- Use the style and features commonly seen in DSE Paper 2 ${type}s.
`;

  if (level === "5") {
    prompt += `
Performance characteristics:
- Follow the correct ${type} structure
- Use clear but not sophisticated vocabulary or grammar
- Slightly inconsistent ideas or tone allowed
- Language score should reflect Level 5
- Word count: 600–750
- End with: Word count: ___ words
`;
  } else if (level === "5*") {
    prompt += `
Performance characteristics:
- Strong structure, coherence and tone suitable for ${type}
- Vocabulary and grammar are controlled and effective
- Few minor errors acceptable
- Reflects realistic DSE 5* student
- Word count: 650–800
- End with: Word count: ___ words
`;
  } else if (level === "5**") {
    prompt += `
Performance characteristics:
- Excellent structure, very fluent ${type} language use
- Sophisticated phrasing, rhetorical techniques and flow
- Almost error-free
- Clearly demonstrates a Level 5** DSE student
- Word count: 700–850
- End with: Word count: ___ words
`;
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
    const writing = writingData.choices?.[0]?.message?.content || "";

    const feedbackPrompt = `You are a DSE English Paper 2 examiner. The following writing was written to simulate a Level ${level} student.

Do NOT re-grade it. Instead, write a detail examiner-style comment explaining why this writing matches Level ${level}, using 2-3 paragraphs and providing concrete examples extracted from the passage for each criterion:
- Content
- Language
- Organisation

Be honest but stay within the expected level. Provide possible marks if a real examiner marked the generated work using the following format:
   C   L   O
1st marker 6 6 6
2nd marker 6 6 6

The 1st marker is always a stricter one while the 2nd marker is always more leniet.


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
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to generate writing or feedback." });
  }
}
