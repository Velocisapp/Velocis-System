export default async function handler(req, res) {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { image, rawBarcode } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Build the prompt based on if we have a barcode or just an image
    let prompt = "Extract passenger name, airline, gate, origin, and destination from this boarding pass. Format as raw JSON: { \"name\": \"\", \"airline\": \"\", \"gate\": \"\", \"origin\": \"\", \"destination\": \"\" }. If info is missing, use '---'.";
    
    if (rawBarcode) {
      prompt = `Translate this raw boarding pass barcode data into JSON: "${rawBarcode}". Format: { "name": "", "airline": "", "gate": "", "origin": "", "destination": "" }`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: prompt },
          ...(image ? [{ inline_data: { mime_type: "image/jpeg", data: image } }] : [])
        ]}],
        generationConfig: { temperature: 0.1, topP: 0.95 }
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
      res.status(200).json({ name: "---", error: "FORMAT_ERR", raw: aiText });
    }

  } catch (error) {
    res.status(200).json({ error: "CRASH", raw: error.message });
  }
}
