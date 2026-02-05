export default async function handler(req, res) {
  try {
    const { image, prompt } = JSON.parse(req.body);
    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: image } }] }]
      })
    });

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0].content) {
       return res.status(500).json({ error: "AI could not read the ticket" });
    }

    let aiText = data.candidates[0].content.parts[0].text;
    
    // Safety Net: Find the JSON inside the text no matter what
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      res.status(200).json(JSON.parse(jsonMatch[0]));
    } else {
      res.status(500).json({ error: "Invalid AI Format" });
    }
  } catch (error) {
    res.status(500).json({ error: "Neural Link Processing Failed" });
  }
}
