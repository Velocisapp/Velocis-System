import { createVertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';

export default async function handler(req, res) {
  // 1. Basic Security Check
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { image } = req.body;
    
    // 2. THE REPAIR KIT: Fixes 'private_key' and handles the Project ID name change
    const rawKey = process.env.GOOGLE_PRIVATE_KEY || "";
    const formattedKey = rawKey.replace(/\\n/g, '\n');
    
    // This looks for EVERY possible name for your Project ID to prevent errors
    const projectId = process.env.GOOGLE_VERTEX_PROJECT || 
                      process.env.GOOGLE_PROJECT_ID || 
                      'gen-lang-client-0363261183';

// 3. Connect to the High-Priority Vertex lane
    const vertex = createVertex({
      project: projectId,
      location: 'us-central1', 
      // Changed from 'googleCredentials' to 'googleAuthOptions' for full Vercel compatibility
      googleAuthOptions: {
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: formattedKey,
        },
      },
    });

    // 4. Run the scan using the Pro model
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

    // 5. Success! Clean the JSON and send it back to stop the spinner
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    const result = JSON.parse(text.substring(start, end + 1));
    
    res.status(200).json(result);

  } catch (error) {
    // If it fails, this message will tell you exactly which variable is wrong
    res.status(200).json({ error: "VERTEX_SCAN_FAIL", raw: error.message });
  }
}
