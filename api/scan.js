export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { image } = req.body;
    const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;
    const base64Data = image.split(",")[1];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "DECODE CHALLENGE: Look at the barcode/QR code in this image. Decode the raw data string (IATA BCBP format). Then, extract: 1. Passenger Name, 2. Origin, 3. Destination. Return ONLY JSON: {\"name\": \"...\", \"origin\": \"...\", \"destination\": \"...\"}. If you can't read it, explain why." },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await response.json();
    const extractedText = data.candidates[0].content.parts[0].text;
    res.status(200).json(JSON.parse(extractedText));

  } catch (error) {
    res.status(200).json({ error: "AI_SCAN_FAIL", details: error.message });
  }
}
