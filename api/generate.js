export default async function handler(req, res) {
  const { topic, type, level } = req.body;

  let prompt = "";

if (level === "5") {
  prompt = `You are an HKDSE English Paper 2 examiner. Write a ${type} on the topic: "${topic}". This writing should reflect a Level 5 performance based on HKDSE rubrics.

Instructions:
- Use appropriate structure for the text type
- Express clear ideas but allow for some minor weaknesses
- Use a moderately varied vocabulary and sentence structure
- Some minor errors in grammar or tone are acceptable
- Maintain a relevant and mostly focused response
`;
}

else if (level === "5*") {
  prompt = `You are an HKDSE English Paper 2 examiner. Write a ${type} on the topic: "${topic}". This writing should reflect a Level 5* performance based on HKDSE rubrics.

Instructions:
- Use a clear and logical structure appropriate for the text type
- Present ideas with clarity and development
- Use a wide range of vocabulary and sentence types
- Language should be mostly accurate with a suitable tone
- Response should be well-organized and mostly error-free
`;
}

else if (level === "5**") {
  prompt = `You are an HKDSE English Paper 2 examiner. Write a ${type} on the topic: "${topic}". This writing should reflect a top-level 5** performance based on HKDSE rubrics.

Instructions:
- Use an advanced structure with smooth transitions
- Express complex, insightful ideas with clarity and impact
- Use sophisticated vocabulary and precise language
- Be almost entirely error-free with excellent tone control
- Make the writing stand out with originality and flair
`;
}
;

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
