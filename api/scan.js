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
    const aiText = data.candidates[0].content.parts[0].text;
    const cleanJson = aiText.replace(/```json|```/g, "").trim();
    res.status(200).json(JSON.parse(cleanJson));
  } catch (error) {
    res.status(500).json({ error: "Neural Link Processing Failed" });
  }
}