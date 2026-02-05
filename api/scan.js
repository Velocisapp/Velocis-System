export default async function handler(req, res) {
  try {
    // Universal Body Loader (Fixes the "undefined" crash)
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { image, prompt } = body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "API Key Missing from Vercel Settings" });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: prompt + " Respond ONLY with raw JSON. No markdown." }, 
          { inline_data: { mime_type: "image/jpeg", data: image } }
        ]}]
      })
    });

    const data = await response.json();
    
    // Safety check for Google's response
    if (!data.candidates || !data.candidates[0]) {
        return res.status(500).json({ error: "Google AI Rejected Request", details: data });
    }

    const aiText = data.candidates[0].content.parts[0].text || "";
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      res.status(200).json(JSON.parse(jsonMatch[0]));
    } else {
      res.status(500).json({ error: "Data Format Error", raw: aiText });
    }

  } catch (error) {
    res.status(500).json({ error: "Neural Link Crash", details: error.message });
  }
}
