import { createVertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { image } = req.body;
    
    // THE REPAIR: Fixes the key formatting for Vercel
    const rawKey = process.env.GOOGLE_PRIVATE_KEY || "";
    const formattedKey = rawKey.replace(/\\n/g, '\n');

   // 3. Connect to the High-Priority Vertex lane
    const vertex = createVertex({
      project: 'gen-lang-client-0363261183',
      location: 'us-central1', 
      googleAuthOptions: {
        credentials: {
          // Use underscores (_) here to match Google's strict requirements
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: formattedKey,
        },
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
    // This will help us catch any final typos
    res.status(200).json({ error: "FINAL_SYNC_FAIL", raw: error.message });
  }
}
