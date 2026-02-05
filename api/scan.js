export default async function handler(req, res) {
  try {
    const { image, prompt } = JSON.parse(req.body);
    const apiKey = process.env.GEMINI_API_KEY;

    // Check 1: Is the key even there?
    if (!apiKey) return res.status(500).json({ error: "API Key Missing from Vercel" });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: image } }] }]
      })
    });

    const data = await response.json();
    
    // Check 2: What did Google say?
    if (data.error) {
       return res.status(500).json({ error: `Google Error: ${data.error.message}` });
    }

    const aiText = data.candidates[0].content.parts[0].text;
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (error) {
    // This is what you are seeing now. Let's make it tell us the truth:
    res.status(500).json({ error: "AI Engine Crash", details: error.message });
  }
}
