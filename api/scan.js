import { createVertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { image } = req.body;
    
    // 1. THE REPAIR: Fixes the line breaks in the large private key block
    const formattedKey = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, '\n');

    // 2. Setup Vertex using the "Enterprise Handshake" structure
    const vertex = createVertex({
      project: 'gen-lang-client-0363261183',
      location: 'us-central1',
      // We use googleAuthOptions here to force Vercel to use your specific keys
      googleAuthOptions: {
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: formattedKey,
        },
      },
    });

    // 3. Run the AI Scan
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

    // 4. Success! Clean the JSON and send it back to the scanner
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    res.status(200).json(JSON.parse(text.substring(start, end + 1)));

  } catch (error) {
    // This will tell us if there is a typo in the Environment Variables
    res.status(200).json({ 
      error: "AUTH_VERIFY_FAIL", 
      details: error.message 
    });
  }
}
