import { createVertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { image } = req.body;
    
    // THE REPAIR: Cleans up the large private key block
    const formattedKey = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, '\n');

    // Setup Vertex using the most compatible Vercel structure
    const vertex = createVertex({
      project: 'gen-lang-client-0363261183',
      location: 'us-central1',
      googleCredentials: {
        clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
        privateKey: formattedKey,
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

    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    res.status(200).json(JSON.parse(text.substring(start, end + 1)));

  } catch (error) {
    // This tells us exactly which specific field is failing the handshake
    res.status(200).json({ 
      error: "AUTH_VERIFY_FAIL", 
      details: error.message,
      check: "Ensure GOOGLE_CLIENT_EMAIL is set in Vercel" 
    });
  }
}
