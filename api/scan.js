export default async function handler(req, res) {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { image, prompt } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: prompt + " Respond ONLY with raw JSON." }, 
          { inline_data: { mime_type: "image/jpeg", data: image } }
        ]}],
        // THIS IS THE FIX: Disable the safety filters that are causing the rejection
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      })
    });

    const data = await response.json();
    
    if (data.promptFeedback && data.promptFeedback.blockReason) {
        return res.status(500).json({ error: "Google Safety Block", details: data.promptFeedback.blockReason });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      res.status(200).json(JSON.parse(jsonMatch[0]));
    } else {
      res.status(500).json({ error: "AI Format Error", raw: aiText });
    }

  } catch (error) {
    res.status(500).json({ error: "Neural Link Crash", details: error.message });
  }
}
