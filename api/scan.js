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
            { text: "DO NOT DECODE BARCODES. Instead, look at the HUMAN-READABLE TEXT printed on this boarding pass. Extract: 1. Passenger Name, 2. Origin City, 3. Destination City. Return ONLY JSON: {\"name\": \"...\", \"origin\": \"...\", \"destination\": \"...\"}. If no text is visible, say: {\"name\": \"TEXT_NOT_FOUND\", \"origin\": \"USE_PAPER_TICKET\", \"destination\": \"N/A\"}" },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        }],
        // We keep these to ensure the highest possible success rate
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await response.json();

    if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      res.status(200).json(JSON.parse(text));
    } else {
      res.status(200).json({ 
        name: "PRIVACY_BLOCK", 
        origin: "Try_Paper_Ticket", 
        destination: "Google_Restricted" 
      });
    }

  } catch (error) {
    res.status(200).json({ error: "AI_SCAN_FAIL", details: error.message });
  }
}
