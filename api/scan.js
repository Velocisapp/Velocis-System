export default async function handler(req, res) {
  try {
    const { image } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // THE POWER MOVE: Switching to gemini-1.5-pro-latest
    // This model is more stable and better at reading complex boarding passes.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: "OCR this boarding pass image. Extract the passenger name, origin city, and destination city. Return the data ONLY in this JSON format: { \"name\": \"\", \"origin\": \"\", \"destination\": \"\" }" },
          { inline_data: { mime_type: "image/jpeg", data: image } }
        ]}]
      })
    });

    const data = await response.json();
    
    // Detailed error catching for the Pro link
    if (data.error) {
        return res.status(200).json({ error: "PRO_LINK_FAIL", raw: data.error.message });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const start = aiText.indexOf('{');
    const end = aiText.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      res.status(200).json(JSON.parse(aiText.substring(start, end + 1)));
    } else {
      res.status(200).json({ error: "DATA_FORMAT_ERR", raw: aiText });
    }
  } catch (error) {
    res.status(200).json({ error: "SYSTEM_CRASH", raw: error.message });
  }
}
