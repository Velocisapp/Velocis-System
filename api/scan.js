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
          { text: "Read every word on this ticket carefully. Find the passenger name, flight number, airline, gate, and destination. Even if it's blurry, provide your absolute best guess. Respond ONLY with raw JSON: { \"name\": \"\", \"airline\": \"\", \"gate\": \"\", \"origin\": \"\", \"destination\": \"\" }" }, 
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
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    const start = aiText.indexOf('{');
    const end = aiText.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      res.status(200).json(JSON.parse(aiText.substring(start, end + 1)));
    } else {
      // THIS LOGS THE ERROR SO YOU CAN SEE IT ON YOUR IMAC
      console.log("AI COULD NOT READ IMAGE. RAW RESPONSE:", aiText);
      res.status(500).json({ error: "Mission Data Obscured", raw: aiText });
    }
  } catch (error) {
    res.status(500).json({ error: "Neural Desync", details: error.message });
  }
}
