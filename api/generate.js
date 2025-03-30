
export default async function handler(req, res) {
  const { topic, type, level } = req.body;

  const tokenLimits = {
    "5": 1000,   // approx 750 words
    "5*": 1050,  // approx 800 words
    "5**": 1150  // approx 850 words
  };

  const max_tokens = tokenLimits[level] || 1000;

  const prompts = {
    "5": `You are simulating a Level 5 HKDSE English Paper 2 student.

Task:
Write a ${type} on the topic: "${topic}" in the style of a solid Level 5 candidate.

Requirements:
- Clear, appropriate ideas with some development
- Reasonable structure and coherence, but not perfect
- Some minor errors or awkward phrasing allowed
- Use intermediate-level vocabulary
- Target: ~750 words (~1000 tokens)
- End with: Word count: ___ words`,

    "5*": `You are simulating a Level 5* HKDSE English Paper 2 student.

Task:
Write a ${type} on the topic: "${topic}" in the style of a confident Level 5* candidate.

Requirements:
- Structured, well-developed, fluent
- Some sophistication in vocabulary and phrasing
- Minor errors allowed
- Target: ~800 words (~1050 tokens)
- End with: Word count: ___ words`,

    "5**": `You are simulating a Level 5** HKDSE English Paper 2 student.

Task:
Write a ${type} on the topic: "${topic}" in the style of a top Level 5** candidate.

Requirements:
- Mature, well-organized, fluent and accurate
- Sophisticated vocabulary and rhetorical techniques
- Target: ~850 words (~1150 tokens)
- End with: Word count: ___ words`
  };

  const openaiUrl = "https://dsewriterai.openai.azure.com/openai/deployments/gpt35-dse/chat/completions?api-version=2025-01-01-preview";
  const headers = {
    "Content-Type": "application/json",
    "api-key": process.env.AZURE_OPENAI_KEY
  };

  const prompt = prompts[level] || prompts["5"];

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
        max_tokens
      })
    });

    const writingData = await writingRes.json();
    const fullText = writingData.choices?.[0]?.message?.content || "";

    res.status(200).json({ writing: fullText });
  } catch (err) {
    console.error("Token-limit Error:", err);
    res.status(500).json({ error: "Failed to generate writing with token control." });
  }
}
