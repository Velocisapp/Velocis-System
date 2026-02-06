import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { image } = req.body;
    
    // This tells Vercel to look for the AI Studio key
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const imageParts = [{
      inlineData: {
        data: image.split(",")[1],
        mimeType: "image/jpeg"
      }
    }];

    const result = await model.generateContent([
      "Extract Name, Origin, and Destination. Return ONLY JSON: { \"name\": \"\", \"origin\": \"\", \"destination\": \"\" }",
      ...imageParts
    ]);

    const response = await result.response;
    const text = response.text();
    
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    res.status(200).json(JSON.parse(text.substring(start, end + 1)));

  } catch (error) {
    // If it fails, it will tell us why (likely a missing model or key)
    res.status(200).json({ error: "SCAN_FAIL", details: error.message });
  }
}
