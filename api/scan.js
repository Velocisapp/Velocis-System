export default async function handler(req, res) {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { image } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Direct, simple fetch to Google
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: "OCR this image and extract all text. Format as JSON: { \"name\": \"\", \"airline\": \"\", \"gate\": \"\", \"origin\": \"\", \"destination\": \"\" }. If you can't find info, use '---'." }, 
          { inline_data: { mime_type: "image/jpeg", data: image } }
        ]}],
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      })
    });

    const data = await response.json();
    
    // Check if Google sent an error (like Quota or Key issue)
    if (data.error) {
        return res.status(200).json({ error: "Google API Error", raw: data.error.message });
    }

    let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "AI SENT EMPTY RESPONSE";
    
    // Attempt to find JSON
    const start = aiText.indexOf('{');
    const end = aiText.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      const jsonStr = aiText.substring(start, end + 1);
      res.status(200).json(JSON.parse(jsonStr));
    } else {
      // SUCCESS: Even if it's not JSON, we send the text back so your debug window can show it
      res.status(200).json({ name: "SCAN FAILED", airline: "Check Debug", raw: aiText });
    }

  } catch (error) {
    // If the server crashes, it will now send the error message to your phone
    res.status(200).json({ error: "Server Crash", raw: error.message });
  }
}
