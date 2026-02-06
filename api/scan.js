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
            { text: "ACT AS A FLIGHT BARCODE SCANNER. I am providing an Aztec/QR code from a boarding pass. 1. Decode the digital data. 2. Extract Passenger Name, Origin Airport, and Destination Airport. Return ONLY JSON: {\"name\": \"...\", \"origin\": \"...\", \"destination\": \"...\"}. If you are absolutely unable to read it, return: {\"name\": \"SCAN_ERROR\", \"origin\": \"BLURRY\", \"destination\": \"RETRY\"}" },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        }],
        // This stops Google from blocking the "Scannable" data
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ],
        generationConfig: { 
          responseMimeType: "application/json",
          temperature: 0.1 
        }
      })
    });

    const data = await response.json();

    if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      res.status(200).json(JSON.parse(text));
    } else {
      res.status(200).json({ 
        name: "BLOCK_BY_GOOGLE", 
        origin: "Try_New_Angle", 
        destination: "Hold_Steady" 
      });
    }

  } catch (error) {
    res.status(200).json({ error: "AI_SCAN_FAIL", details: error.message });
  }
}
