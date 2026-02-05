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
          { text: "Act as a flight logistics officer. Extract: 1. Full Passenger Name 2. Airline Name 3. Flight Number 4. Boarding Gate (if not found, use 'SEE MONITOR') 5. Seat Number 6. Departure City 7. Arrival City. If you see 'ZONA DE EMBARQUE', that is the gate area. Respond ONLY with a raw JSON object." }, 
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
    
    // Advanced Cleaning to handle backticks or conversational text
    aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
    const start = aiText.indexOf('{');
    const end = aiText.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      res.status(200).json(JSON.parse(aiText.substring(start, end + 1)));
    } else {
      res.status(500).json({ error: "Intelligence Obscured" });
    }
  } catch (error) {
    res.status(500).json({ error: "System Desync" });
  }
}
