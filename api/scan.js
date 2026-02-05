export default async function handler(req, res) {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { image } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    // 2026 UPDATE: Using Gemini 2.0 Flash (Stable)
    // The v1 endpoint is now required for these newer models
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: "Extract the name, airline, gate, origin, and destination from this boarding pass. Format as raw JSON only." }, 
          { inline_data: { mime_type: "image/jpeg", data: image } }
        ]}]
      })
    });

    const data = await response.json();
    
    if (data.error) {
        // This will now show the REAL error in your debug box (e.g., "Invalid Key" or "Model retired")
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
