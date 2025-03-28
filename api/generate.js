export default async function handler(req, res) {
  const { topic, type, level, prompt } = req.body;

  let prompt = "";

if (level === "5") {
  prompt = `You are simulating a Level 5 HKDSE English Paper 2 student.
Task: Write a ${type} on the topic: "${topic}" in the style of a solid Level 5 candidate.
Requirements: [...]`;
} else if (level === "5*") {
  prompt = `You are simulating a Level 5* HKDSE English Paper 2 student.
Task: Write a ${type} on the topic: "${topic}" in the style of a strong Level 5* candidate.
Requirements: [...]`;
} else if (level === "5**") {
  prompt = `You are simulating a Level 5** HKDSE English Paper 2 student.
Task: Write a ${type} on the topic: "${topic}" in the style of a top-performing Level 5** candidate.
Requirements: [...]`;
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
        max_tokens: 800
      })
    });

    const writingData = await writingRes.json();
    const writing = writingData.choices?.[0]?.message?.content || "";

   const feedbackPrompt = `You are an HKDSE English Paper 2 examiner. Assess the following writing as if it were submitted by a Level ${level} candidate.

Provide scores and brief comments under the DSE criteria:
- C = Content
- L = Language
- O = Organisation

Instructions:
- Give marks from 1 to 7 for each category
- Include marks from two markers: 1st marker and 2nd marker
- Base your scoring realistically on the student's writing
- Justify the scores briefly in 2–3 sentences below

Format the score table like this:
   C   L   O
1st marker 6 7 7
2nd marker 5 6 6

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
