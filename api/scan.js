export default async function handler(req, res) {
  try {
    const { image } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // 2026 PRODUCTION PATH: Switching to 2.5 Flash-Lite to bypass the "Limit 0" 
    // bug affecting 2.0 models on new billing accounts.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: "Extract: passenger name, airline, flight, gate, origin, destination. Return ONLY raw JSON." }, 
          { inline_data: { mime_type: "image/jpeg", data: image } }
        ]}]
      })
    });

    const data = await response.json();
    
    if (data.error) {
        // This will now show the REAL error (e.g., if you still need to click "Finish Setup")
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
