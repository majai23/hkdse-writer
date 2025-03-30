
async function generateWriting() {
  const topic = document.getElementById("topic").value.trim();
  const type = document.getElementById("type").value;
  const level = document.getElementById("level").value;

  const writingBox = document.getElementById("writing");
  const feedbackBox = document.getElementById("feedback");

  writingBox.innerText = "⏳ Generating writing...";
  feedbackBox.innerText = "";

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, type, level })
    });

    if (!response.ok) {
      const err = await response.text();
      writingBox.innerText = "⚠️ API Error. Please check server logs.";
      console.error("Server error:", err);
      return;
    }

    const data = await response.json();
    writingBox.innerText = data.writing || "⚠️ No writing returned.";
    feedbackBox.innerText = data.comment || "⚠️ No feedback returned.";
  } catch (err) {
    writingBox.innerText = "⚠️ Network error.";
    console.error("Network issue:", err);
  }
}
