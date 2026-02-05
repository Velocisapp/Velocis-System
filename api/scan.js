export default async function handler(req, res) {
  try {
    const { image } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // FORCING THE STABLE PRODUCTION HIGHWAY (v1)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: "Extract Name, Origin, and Destination from this boarding pass. Return ONLY JSON: { \"name\": \"\", \"origin\": \"\", \"destination\": \"\" }" },
          { inline_data: { mime_type: "image/jpeg", data: image } }
        ]}]
      })
    });

    const data = await response.json();
    
    // If this still says 'Not Found', we need to check the API Key itself in Google AI Studio
    if (data.error) return res.status(200).json({ error: "PRODUCTION_FAIL", raw: data.error.message });

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const start = aiText.indexOf('{');
    const end = aiText.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      res.status(200).json(JSON.parse(aiText.substring(start, end + 1)));
    } else {
      res.status(200).json({ error: "READ_ERROR", raw: aiText });
    }
  } catch (error) {
    res.status(200).json({ error: "CRASH", raw: error.message });
  }
}
