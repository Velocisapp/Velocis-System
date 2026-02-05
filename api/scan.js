export default async function handler(req, res) {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { image } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    // FIX: Using gemini-1.5-flash-8b on v1beta. This is the "high-availability" model path.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: "OCR this boarding pass. Extract: name, airline, gate, origin, destination. Format as raw JSON only." }, 
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
    
    // Check for Google API errors (like the 404 we've been seeing)
    if (data.error) {
        return res.status(200).json({ error: "Google API Error", raw: data.error.message });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const start = aiText.indexOf('{');
    const end = aiText.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      res.status(200).json(JSON.parse(aiText.substring(start, end + 1)));
    } else {
      res.status(200).json({ name: "FORMAT ERROR", raw: aiText });
    }

  } catch (error) {
    res.status(200).json({ error: "Server Crash", raw: error.message });
  }
}
