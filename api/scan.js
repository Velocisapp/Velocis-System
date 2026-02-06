export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { image } = req.body;
    const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;
    const base64Data = image.split(",")[1];

    // This talks directly to Google without needing any special libraries
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Extract Name, Origin, and Destination from this boarding pass. Return ONLY JSON: { \"name\": \"\", \"origin\": \"\", \"destination\": \"\" }" },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        }]
      })
    });

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    res.status(200).json(JSON.parse(text.substring(start, end + 1)));

  } catch (error) {
    res.status(200).json({ error: "SCAN_FAIL", details: error.message });
  }
}
