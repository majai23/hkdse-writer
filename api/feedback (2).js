
module.exports = async function handler(req, res) {
  const { writing } = req.body;

  const openaiUrl =
    "https://dsewriterai.openai.azure.com/openai/deployments/gpt35-dse/chat/completions?api-version=2025-01-01-preview";

  const headers = {
    "Content-Type": "application/json",
    "api-key": process.env.AZURE_OPENAI_KEY,
  };

  const feedbackPrompt = `You are a DSE English Paper 2 examiner.

The following writing was generated to simulate a specific HKDSE band level. Do not score it, but justify its level by analyzing three aspects below.

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

  try {
    const feedbackRes = await fetch(openaiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a professional DSE English examiner." },
          { role: "user", content: feedbackPrompt }
        ],
        temperature: 0.6,
        max_tokens: 700
      })
    });

    const feedbackData = await feedbackRes.json();
    const comment = feedbackData.choices?.[0]?.message?.content || "⚠️ No feedback returned.";

    res.status(200).json({ comment });
  } catch (err) {
    console.error("FEEDBACK ERROR:", JSON.stringify(err, null, 2));
    res.status(500).json({
      error: "Failed to generate feedback.",
      details: err.message || err,
    });
  }
};
