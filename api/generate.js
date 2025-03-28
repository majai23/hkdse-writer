export default async function handler(req, res) {
  const { topic, type, level } = req.body;

  let prompt = "";

if (level === "5") {
  prompt = `You are simulating a Level 5 HKDSE English Paper 2 student.

Task:
Write a ${type} on the topic: "${topic}" in the style of a solid Level 5 candidate.

Requirements:
- Follow the format and tone of the text type (e.g. letter, blog, proposal)
- Present clear ideas but allow for occasional lapses in development or coherence
- Use appropriate but limited vocabulary and sentence variety
- Include some minor errors or awkward phrasing that are realistic for Level 5
- Try to build a persuasive or informative tone, but avoid being too perfect or native-like
- Word count: around 600–750 words

Your goal is to reflect the competence of a strong student who meets Level 5 performance in clarity, structure, and language.`;
}

else if (level === "5*") {
  prompt = `You are simulating a Level 5* HKDSE English Paper 2 student.

Task:
Write a ${type} on the topic: "${topic}" in the style of a strong Level 5* candidate.

Requirements:
- Use the correct format and style for the text type
- Present ideas clearly and logically with well-structured paragraphs
- Use a range of vocabulary and sentence types, but not native-speaker level
- Maintain formal tone and appropriate register throughout
- Some minor grammatical errors or phrasing may appear (to feel natural)
- Include rhetorical questions, transitions, and topic sentences
- Word count: around 650–800 words

Your response should reflect a highly competent but realistic HKDSE student.`;
}

else if (level === "5**") {
  prompt = `You are simulating a Level 5** HKDSE English Paper 2 student.

Task:
Write a ${type} on the topic: "${topic}" in the style of a top-performing Level 5** candidate.

Requirements:
- Follow the correct format and tone for the text type
- Present mature and well-developed arguments or ideas
- Use advanced but realistic student-level vocabulary and sentence structures
- Include rhetorical techniques: repetition, emotive language, parallel structure, etc.
- Avoid sounding like a native speaker — keep it local and authentic
- Structure should be smooth with clear progression of ideas
- Word count: 700–850 words

Your goal is to produce a realistic, polished DSE-style writing that would be awarded Level 5** in a real exam.`;
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

    const feedbackPrompt = `You are an HKDSE English Paper 2 examiner. Evaluate the following student writing using the official Paper 2 rubrics. Give specific comments on:
1. Content
2. Language
3. Organisation
Then estimate the band level (5 / 5* / 5**).

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
