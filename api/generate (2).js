
async function generateWriting() {
  const topic = document.getElementById("topic").value.trim();
  const type = document.getElementById("type").value;
  const level = document.getElementById("level").value;
  const output = document.getElementById("output");

  if (!topic) {
    output.innerText = "⚠️ Please enter a topic.";
    return;
  }

  output.innerText = "⏳ Generating writing... Please wait.";

  try {
    const response = await fetch("/api/generate-writing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, type, level })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server Error:", errorText);
      output.innerText = "⚠️ API Error. Please check server logs.";
      return;
    }

    const data = await response.json();
    output.innerText = data.writing || "⚠️ No writing generated.";
  } catch (error) {
    console.error("Network error:", error);
    output.innerText = "⚠️ Failed to connect to the server.";
  }
}
