export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { image } = req.body;
    const base64Data = image.split(",")[1];

    // 1. TRY THE AI FIRST (The "Brain")
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GOOGLE_AI_STUDIO_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Decode this barcode pattern and return ONLY JSON: {\"name\": \"...\", \"origin\": \"...\", \"destination\": \"...\"}" }, { inlineData: { mimeType: "image/jpeg", data: base64Data } }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const aiData = await aiResponse.json();

    if (aiData.candidates && aiData.candidates[0].content) {
      // If AI works, return the clean JSON
      return res.status(200).json(JSON.parse(aiData.candidates[0].content.parts[0].text));
    }

    // 2. FALLBACK: If AI is blocked, use the Mechanical Decoder
    const decodeRes = await fetch(`https://api.qrserver.com/v1/read-qr-code/`, {
      method: 'POST',
      body: new URLSearchParams({ 'fileencoded': base64Data })
    });
    const decodeData = await decodeRes.json();
    
    if (decodeData[0].symbol[0].data) {
      return res.status(200).json({ 
        name: "RAW_INTEL", 
        origin: decodeData[0].symbol[0].data.substring(0, 20), 
        destination: "DECODED_BY_MECHANIC" 
      });
    }

  } catch (error) {
    res.status(200).json({ name: "SYSTEM_COOLDOWN", origin: "Wait_4_Hours", destination: "Vercel_Limit" });
  }
}
