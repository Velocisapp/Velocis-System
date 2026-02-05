export default async function handler(req, res) {
  try {
    const { image } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // EMERGENCY PATH: Using the most basic 1.0 vision model
    // This model is often the 'default' and avoids the versioning errors we've seen.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: "Extract JSON: { \"name\": \"\", \"origin\": \"\", \"destination\": \"\" }" },
          { inline_data: { mime_type: "image/jpeg", data: image } }
        ]}]
      })
    });

    const data = await response.json();
    
    if (data.error) {
        return res.status(200).json({ 
            error: "API_REJECTED", 
            message: data.error.message,
            tip: "If you see 'Model Not Found', your API key might be restricted to 1.0 models only."
        });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const start = aiText.indexOf('{');
    const end = aiText.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      res.status(200).json(JSON.parse(aiText.substring(start, end + 1)));
    } else {
      res.status(200).json({ error: "READ_ERROR", raw: aiText });
    }
  } catch (error) {
    res.status(200).json({ error: "SYSTEM_CRASH", raw: error.message });
  }
}
