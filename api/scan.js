import { createVertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { image } = req.body;
    
    // 1. REPAIR: Cleans up the private key
    const rawKey = process.env.GOOGLE_PRIVATE_KEY || "";
    const formattedKey = rawKey.replace(/\\n/g, '\n');

    // 2. SAFETY FALLBACK: Use the variable OR the hardcoded email
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || 'velocis-scanner@gen-lang-client-0363261183.iam.gserviceaccount.com';

    // 3. Setup Vertex with the guaranteed email
    const vertex = createVertex({
      project: 'gen-lang-client-0363261183',
      location: 'us-central1',
      googleCredentials: {
        clientEmail: clientEmail,
        privateKey: formattedKey,
      },
    });

    // 4. Run the Scan
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
    // This will now tell us if the KEY is the last remaining problem
    res.status(200).json({ 
      error: "AUTH_VERIFY_FAIL", 
      details: error.message,
      email_used: process.env.GOOGLE_CLIENT_EMAIL ? "Vercel_Var" : "Hardcoded_Backup"
    });
  }
}
