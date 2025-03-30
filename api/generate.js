
export default async function handler(req, res) {
  const { topic, type, level } = req.body;

  const limits = {
    "5": { min: 600, max: 750 },
    "5*": { min: 650, max: 800 },
    "5**": { min: 750, max: 850 }
  };

  const wordRange = limits[level];
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
- Avoid native-speaker perfection
- Show word count at the end of the piece (e.g., Word count: 678 words)`;
  } else if (level === "5*") {
    prompt = `You are simulating a Level 5* HKDSE English Paper 2 student.

Task:
Write a ${type} on the topic: "${topic}" in the style of a strong Level 5* candidate.

Requirements:
- Use proper format, structure, and tone
- Present logical, well-developed ideas
- Use a wider range of vocabulary and sentence structures than Level 5
- Some minor grammatical errors are fine, but avoid awkward phrasing
- Aim for fluency, cohesion, and formal tone
- Show word count at the end of the piece (e.g., Word count: 745 words)`;
  } else {
    prompt = `You are simulating a Level 5** HKDSE English Paper 2 student.

Task:
Write a ${type} on the topic: "${topic}" in the style of a top-performing Level 5** candidate.

Requirements:
- Follow advanced structure and mature tone
- Present rich ideas with sophisticated vocabulary
- Use rhetorical devices and strong transitions
- Maintain coherence and cohesion throughout
- Avoid native-like perfection but demonstrate excellence
- Show word count at the end of the piece (e.g., Word count: 812 words)`;
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
    const fullText = writingData.choices?.[0]?.message?.content || "";

    // Remove punctuation and calculate real word count
    const contentOnly = fullText.replace(/Word count:.*/i, "").trim();
    const stripped = contentOnly.replace(/[.,!?;:"'()\[\]{}<>\/\-]+/g, "");
    const words = stripped.split(/\s+/).filter(Boolean);
    const realCount = words.length;

    if (realCount < wordRange.min || realCount > wordRange.max) {
      return res.status(400).json({
        error: `AI output had ${realCount} words (excluding punctuation), which is outside the target range (${wordRange.min}–${wordRange.max}). Please try again.`
      });
    }

    const finalText = contentOnly.trim() + `\n\nWord count: ${realCount} words`;

    res.status(200).json({ writing: finalText });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to generate writing." });
  }
}
