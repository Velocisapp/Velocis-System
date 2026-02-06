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
            { text: "EXTRACT BOARDING PASS DATA. You MUST return valid JSON. Fields: name, origin, destination. If you cannot find a field, put 'UNKNOWN'. Format: { \"name\": \"...\", \"origin\": \"...\", \"destination\": \"...\" }" },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const extractedText = data.candidates[0].content.parts[0].text;
      res.status(200).json(JSON.parse(extractedText));
    } else {
      // If Google filters the image for some reason, we catch it here
      res.status(200).json({ 
        name: "SCAN ERROR", 
        origin: "Check Image Clarity", 
        destination: "Try Again" 
      });
    }

  } catch (error) {
    res.status(200).json({ error: "SCAN_FAIL", details: error.message });
  }
}
