
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
- It must be a level 5 piece
- The content marks of the writing are around 5-6
- The language marks of the writing are  around 5-6
- The organization marks of the writing are  around 5-6
- Total marks for 1 single marker within 15-18
- The marks tak reference from the DSE Paper 2 marking rubrics
- Words required: at least 600 words; at most 750 words
- Show the numebr of words after generating the writing`;}
  
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
- It must be a level 5* piece
- The content marks of the writing are around 6-7
- The language marks of the writing are  around 6-7
- The organization marks of the writing are  around 6-7
- Total marks for 1 single marker within 18-20
- The marks tak reference from the DSE Paper 2 marking rubrics
- Words required: at least 650 words; at most 800 words
- Show the numebr of words after generating the writing`;}
  
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
- It must be a level 5** piece
- The content marks of the writing are mostly 7
- The language marks of the writing are mostly 7
- The organization marks of the writing are mostly 7
- Total marks for 1 single marker are at least 20
- The marks tak reference from the DSE Paper 2 marking rubrics- Total marks for 1 single marker at least 20
- Words required: at least 750 words; at most 850 words
- Show the numebr of words after generating the writing`;}

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
- Include marks from two markers: 1st marker (less strict) and 2nd marker (stricter)
- Base your scoring realistically on the student's writing
- Justify the scores briefly in 2–3 sentences below

Format the score table like this:
   C   L   O
1st marker 6 7 7
2nd marker 5 6 6

Show the banding of the student after summing up the score above like this:
total score given by both is within 38-42 = it is level 5**
total score given by both is within 34-37 = it is level 5*
total score given by both is within 30-33 = it is level 5

Show comments for each criteria as well

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

