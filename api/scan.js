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
            { text: "TECHNICAL TASK: You are a secure IATA BCBP parser. Decode the raw data encoded within the Aztec/QR code pixels in this image. DO NOT read surrounding text. Extract ONLY the following fields from the code's data: 1. Passenger Name, 2. Origin IATA Code, 3. Destination IATA Code. Return ONLY JSON: {\"name\": \"...\", \"origin\": \"...\", \"destination\": \"...\"}. If the code is unreadable, return: {\"name\": \"DECODE_ERROR\", \"origin\": \"Check_Blur\", \"destination\": \"N/A\"}" },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        }],
        // We set these to the absolute minimum to stop the "Privacy Blocks"
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ],
        generationConfig: { 
          responseMimeType: "application/json",
          temperature: 0.0 // 0.0 makes the AI act like a machine, not a writer
        }
      })
    });

    const data = await response.json();

    if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      res.status(200).json(JSON.parse(text));
    } else {
      // This catches the "Privacy Block" and gives you a hint
      res.status(200).json({ 
        name: "GOOGLE_PII_SHIELD", 
        origin: "Try_Closer_Crop", 
        destination: "Restricted" 
      });
    }

  } catch (error) {
    res.status(200).json({ error: "AI_SCAN_FAIL", details: error.message });
  }
}
