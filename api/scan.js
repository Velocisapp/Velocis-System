export default async function handler(req, res) {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { image } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: "OCR this boarding pass. Extract the passenger name, flight number, airline, gate, origin, and destination. If a field is missing, use 'SEE MONITOR'. Return ONLY a raw JSON object." }, 
          { inline_data: { mime_type: "image/jpeg", data: image } }
        ]}],
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      })
    });

    const data = await response.json();
    let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // This cleans out markdown and conversation to ensure only the JSON remains
    aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
    const start = aiText.indexOf('{');
    const end = aiText.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      res.status(200).json(JSON.parse(aiText.substring(start, end + 1)));
    } else {
      res.status(500).json({ error: "Mission Data Obscured", raw: aiText });
    }
  } catch (error) {
    res.status(500).json({ error: "System Desync", details: error.message });
  }
}
