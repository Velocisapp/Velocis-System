import { createVertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { image } = req.body;

    // 1. This grabs your existing Vercel variable
    const rawKey = process.env.GOOGLE_PRIVATE_KEY || "";
    
    // 2. This is the "Magic Fix" that turns text back into a real Google Key
    const formattedKey = rawKey.replace(/\\n/g, '\n').trim();

    const vertex = createVertex({
      project: 'gen-lang-client-0363261183',
      location: 'us-central1',
      googleCredentials: {
        clientEmail: 'velocis-scanner@gen-lang-client-0363261183.iam.gserviceaccount.com',
        privateKey: formattedKey.endsWith('\n') ? formattedKey : formattedKey + '\n',
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
    res.status(200).json({ 
      error: "AUTH_FAIL", 
      details: error.message 
    });
  }
}
