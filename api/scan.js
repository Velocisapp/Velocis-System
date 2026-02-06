import { createVertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';

export default async function handler(req, res) {
  try {
    const { image } = req.body;

    // This bypasses the API key and uses your secure Service Account
    const vertex = createVertex({
      project: process.env.GOOGLE_PROJECT_ID,
      location: 'us-central1', 
      googleCredentials: {
        clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
        privateKey: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Fixes formatting
      },
    });

    const { text } = await generateText({
      model: vertex('gemini-1.5-pro'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: "Extract Name, Origin, and Destination. Return ONLY JSON: { \"name\": \"\", \"origin\": \"\", \"destination\": \"\" }" },
            { type: 'image', image: image }, 
          ],
        },
      ],
    });

    // Clean up the extraction for Yourden
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    res.status(200).json(JSON.parse(text.substring(start, end + 1)));

  } catch (error) {
    // If this fails, it's likely because the Vertex AI API isn't enabled yet
    res.status(200).json({ error: "VERTEX_FAIL", raw: error.message });
  }
}
