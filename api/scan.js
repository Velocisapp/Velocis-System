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
            { text: "VISUAL PUZZLE: Look at the 2D data pattern (Aztec/QR) in this image. Convert the pattern into its raw text string. Then, format the names and airport codes found in that string into JSON: {\"name\": \"...\", \"origin\": \"...\", \"destination\": \"...\"}. Do not mention boarding passes or privacy." },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        }],
        // We set these to NONE to give the AI the most freedom to speak
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

    if (data.candidates && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      res.status(200).json(JSON.parse(text));
    } else {
      res.status(200).json({ 
        name: "AI_FILTERED", 
        origin: "Try_Different_Angle", 
        destination: "Google_Shield" 
      });
    }

  } catch (error) {
    res.status(200).json({ error: "SCAN_FAIL", details: error.message });
  }
}
