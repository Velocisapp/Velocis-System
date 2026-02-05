export default async function handler(req, res) {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { image, rawBarcode } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    let prompt = "OCR this boarding pass. Extract: name, airline, gate, origin, destination. Return ONLY raw JSON.";
    
    if (rawBarcode) {
      prompt = `Translate this raw boarding pass barcode data into JSON: "${rawBarcode}". Format: { "name": "", "airline": "", "gate": "", "origin": "", "destination": "" }`;
    }

    // UPDATED: Using v1beta and gemini-1.5-flash-latest for maximum compatibility
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: prompt },
          ...(image ? [{ inline_data: { mime_type: "image/jpeg", data: image } }] : [])
        ]}],
        generationConfig: { temperature: 0.1 }
      })
    });

    const data = await response.json();
    
    if (data.error) {
        return res.status(200).json({ error: "API_ERROR", raw: data.error.message });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const start = aiText.indexOf('{');
    const end = aiText.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      res.status(200).json(JSON.parse(aiText.substring(start, end + 1)));
    } else {
      res.status(200).json({ name: "---", error: "FORMAT_ERR" });
    }

  } catch (error) {
    res.status(200).json({ error: "CRASH", raw: error.message });
  }
}
