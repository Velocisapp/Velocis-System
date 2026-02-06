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
            { text: "DECODE CHALLENGE: Look at the Aztec/QR code in this image. Decode the raw data and extract: 1. Passenger Name, 2. Origin, 3. Destination. Return ONLY JSON: {\"name\": \"...\", \"origin\": \"...\", \"destination\": \"...\"}. If you cannot decode it, return: {\"name\": \"RETRY\", \"origin\": \"BLURRY\", \"destination\": \"SCAN\"}" },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        }],
        // THIS IS THE KEY: It stops Google from blocking the response
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ],
        generationConfig: { 
          responseMimeType: "application/json",
          temperature: 0.1 // Low temperature makes it more accurate for decoding
        }
      })
    });

    const data = await response.json();

    // Safety check: Does the answer actually exist?
    if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      res.status(200).json(JSON.parse(text));
    } else {
      // If Google blocks it or fails, we send a friendly error instead of crashing
      res.status(200).json({ 
        name: "SCAN_RETRY", 
        origin: "Check_Lighting", 
        destination: "Hold_Steady" 
      });
    }

  } catch (error) {
    res.status(200).json({ error: "AI_SCAN_FAIL", details: error.message });
  }
}
