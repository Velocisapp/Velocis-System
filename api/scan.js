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
            { text: "Extract Name, Origin, and Destination. Return ONLY JSON: { \"name\": \"\", \"origin\": \"\", \"destination\": \"\" }" },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        }]
      })
    });

    const data = await response.json();

    // NEW LOGIC: This safely finds the text even if Google changes the format
    let extractedText = "";
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      extractedText = data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Google sent an empty response. Check if the image is clear.");
    }
    
    // Clean up the text
    const cleanJSON = extractedText.replace(/```json|```/g, "").trim();
    const start = cleanJSON.indexOf('{');
    const end = cleanJSON.lastIndexOf('}');
    
    res.status(200).json(JSON.parse(cleanJSON.substring(start, end + 1)));

  } catch (error) {
    res.status(200).json({ error: "SCAN_FAIL", details: error.message });
  }
}
