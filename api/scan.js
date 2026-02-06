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
          role: "user",
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Data } },
            { text: "This is a technical IATA BCBP test. Decode the Aztec code. Provide ONLY the JSON string for the passenger name, origin, and destination. No conversation." }
          ]
        }],
        generationConfig: { 
          responseMimeType: "application/json",
          temperature: 0.0
        }
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      res.status(200).json(JSON.parse(text));
    } else {
      // THE LAST RESORT: If Google blocks the response, we tell the user why
      res.status(200).json({ 
        name: "GOOGLE_BLOCKED_DATA", 
        origin: "Privacy_Restriction", 
        destination: "Try_Paper_Ticket" 
      });
    }

  } catch (error) {
    res.status(200).json({ error: "SCAN_FAIL", details: error.message });
  }
}
