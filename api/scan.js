export default async function handler(req, res) {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { image, rawBarcode } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Direct instructions for the AI
    let prompt = "OCR this boarding pass. Extract: name, airline, gate, origin, destination. Return ONLY raw JSON.";
    
    // If the barcode engine caught something, prioritize translating that
    if (rawBarcode) {
      prompt = `A barcode was detected with this raw data: "${rawBarcode}". Translate this into a clean JSON object with name, airline, gate, origin, and destination.`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: prompt },
          ...(image ? [{ inline_data: { mime_type: "image/jpeg", data: image } }] : [])
        ]}]
      })
    });

    const data = await response.json();
    
    if (data.error) {
        return res.status(200).json({ error: "Google API Error", raw: data.error.message });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const start = aiText.indexOf('{');
    const end = aiText.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      res.status(200).json(JSON.parse(aiText.substring(start, end + 1)));
    } else {
      res.status(200).json({ name: "SCANNING...", error: "Retrying" });
    }

  } catch (error) {
    res.status(200).json({ error: "System Error", raw: error.message });
  }
}
