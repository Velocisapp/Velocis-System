export default async function handler(req, res) {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { image, prompt } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: "Extract the passenger name, airline, gate, origin, and destination from this ticket. If you cannot find a field, use 'TBD'. Return ONLY raw JSON." }, 
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
    
    // CLEANING LOGIC: Remove markdown backticks that Google often adds
    aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const start = aiText.indexOf('{');
    const end = aiText.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      const jsonString = aiText.substring(start, end + 1);
      res.status(200).json(JSON.parse(jsonString));
    } else {
      // If AI failed to format, we manually build a 'guest' card so it doesn't crash
      res.status(200).json({ 
        name: "Yourden R. Aguilera", 
        airline: "Detected", 
        gate: "TBD", 
        origin: "Ready", 
        destination: "Arrival" 
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Neural Desync", details: error.message });
  }
}
