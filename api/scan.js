export default async function handler(req, res) {
  try {
    const { image, rawBarcode } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    let prompt = "Extract passenger name, airline, flight, gate, origin, destination from this boarding pass. Return ONLY raw JSON.";
    if (rawBarcode) { prompt = `Translate this raw boarding pass data into JSON: "${rawBarcode}"`; }

    // PRODUCTION STABLE ENDPOINT (Required for 2026 Verified Accounts)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, ...(image ? [{ inline_data: { mime_type: "image/jpeg", data: image } }] : [])] }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(200).json({ error: "API_FAIL", raw: data.error.message });

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const start = aiText.indexOf('{');
    const end = aiText.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      res.status(200).json(JSON.parse(aiText.substring(start, end + 1)));
    } else {
      res.status(200).json({ name: "SCAN ERROR", error: "BAD_FORMAT" });
    }
  } catch (error) { res.status(200).json({ error: "CRASH" }); }
}
