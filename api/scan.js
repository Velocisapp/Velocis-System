import { createVertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';

export default async function handler(req, res) {
  // 1. Check if we actually got an image
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { image } = req.body;
    
    // 2. THE REPAIR: Fixes the 'private_key' formatting for Vercel
    const rawKey = process.env.GOOGLE_PRIVATE_KEY || "";
    const formattedKey = rawKey.replace(/\\n/g, '\n');

    // 3. Connect to the High-Priority Vertex lane
    const vertex = createVertex({
      project: process.env.GOOGLE_PROJECT_ID,
      location: 'us-central1', 
      googleCredentials: {
        clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
        privateKey: formattedKey,
      },
    });

    // 4. Run the scan
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

    // 5. Send data back to stop the "LINKING..." spinner
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    const result = JSON.parse(text.substring(start, end + 1));
    
    res.status(200).json(result);

  } catch (error) {
    // This tells us EXACTLY why it stayed on "LINKING..."
    res.status(200).json({ error: "LINK_ERROR", raw: error.message });
  }
}
