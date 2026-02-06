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
            { text: "OCR TASK: Ignore all QR codes and barcodes. Extract the passenger NAME, the ORIGIN city, and the DESTINATION city from the text printed on this boarding pass. Return ONLY a JSON object. If you cannot find a value, use 'N/A'. Format: {\"name\": \"...\", \"origin\": \"...\", \"destination\": \"...\"}" },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        }],
        // THIS IS THE FIX: It tells Google not to block the response
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await response.json();

    // Check if Google sent back a valid answer
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const extractedText = data.candidates[0].content.parts[0].text;
      res.status(200).json(JSON.parse(extractedText));
    } else {
      // If it still fails, we show what Google actually said (Safety Block or Error)
      const reason = data.promptFeedback ? data.promptFeedback.blockReason : "Unknown Block";
      res.status(200).json({ name: "BLOCK_ERROR", origin: reason, destination: "Try different angle" });
    }

  } catch (error) {
    res.status(200).json({ error: "SCAN_FAIL", details: error.message });
  }
}
