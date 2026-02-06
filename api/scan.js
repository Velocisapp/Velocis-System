import { createVertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { image } = req.body;

    // 1. THE MASTER KEY: Delete the text inside the backticks and paste your key there
    const MANUAL_KEY = -----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCxc92NDIAGRKvC\nc4fsXwcM++PB1hIpc4N26QUTRPtqZfdbfOzxyDTw6vKCnyURLKgQnpVpf1ZWqXy9\n5ny4qvtzBN8vO79JAM7NwVtQQoEohidjuKvPSwUNc/SRv7x+FmU+Sd1p1QtjsbUA\np3RGcRC5yWVRu1VdP5if8k6Rw9CH3KOqxDaKoZDnWbOOhfxEuZ2B/hp8gRjKbScq\nWYbaT0kQ0t2XC7K+YxBs6p8GXehcqTA6RQer5WULorCL/HT6WeC8XTXnrR93g/Vx\nq8wuFolYf9zk6iRGlYMBl9KpboY4GFEvkpqVRs03OfolS9TjycqiYcTrhbflF+OD\n1hGm4inFAgMBAAECggEABeMcbU7GG48hLKcVEhY3/2oG7RobSaVDrgj+ilxeQ/Ik\nkfQzzzSvbvO4fnVlrytuWvjL569aD695TDqOljjT9UWq2uAOUU91zPU2gJPoQY4r\n1d7dUlgAj6jyavhzujIngzjDn/x5r4HIicBEdwbOwX8pPZwrsZeHynypNyRKMYul\n6sVfYKpdRacYbIMmrH+p5PriqAbgy9HQacUk0ZKt27gnXSllp7SS9e/vF1al6tvz\nqk2sm3Jy8NEl230gdIFx/CgBxSqQc9kavt53PHK9RLcPBGVk4n3LPZdTg1jMsYnq\nbqoxOcx7r2c/r80zQB6GR/rveqJmcoK51OABL2EJSQKBgQDrmzWYhJaO7HOwOBiz\nU6r96cfGeKlM8LSD62xKKbauvFT4iIDyH3Be4L1VIunVNKGIBB6fl2kBRiaMOBxb\nJ3UzKpBtPnsH0rEjSaMvTw4MFBQDqhMDFWncEwceZvRrlnH3KveCURRbk9Z79Una\nItttPSZfigefFy8vrgpFoR2STQKBgQDA0AffsIi0U88h95tFRiUJT0wQnkHX9GBz\nfdpbxw48JgqOkVoO78AxNS2b7CNctvRQq3+iyhiO1WYpnCQphtgFmVYb2sFIImNt\nG4682SYifmZns+OqX+wh7TuYEdAUhyUiK2MXj52PtIcg7h13UPSs/QFLllBfwRWN\nHZvAUigBWQKBgB2ztXAC1xAxkuwWRlblJ1tXS44jzAQdHES9OyumUpd4uqWSX98m\nQ35Sisve2Oe9+Ncy3cF0zxIQC/AFat26/bVzmj2LcOstjpNKRz5Bkx3Gsjc8C6WJ\n34yVAYK9q/acQsXMLuPI4O4ilxmNdMABQPRmjx3gQtG1lIdIQ5c/loDJAoGABGR4\n2XK3GoySOm7enaxkaZrh27sPOvE5RUhHsjGNtHcVZHwRNifmE/jnKhcuEw2j8TaG\n+Nlrx806v5XsCPomb7I3kPjh0FfgNfsbvFeiE8UXZiNl+1qmEXvLEMLPH7iYcvfU\nERRXfY+aSHjEORSiDlLRNbyd5iCK8iULiE0W1jkCgYAQQHf/Q/3bYUeec+W5AbkE\nCd6LYaHn1qJivrGUEglH6E+OsQ49YzhxIVf1pAcTAjjCpGUdpzkJUCP9lwKj0fnq\nX2hqr50qUTzdIxwPYM1tm3mxC596zLW7BZ2XF9W058FsYbBfryTbwoYc/XjZ9XNw\nfDBE8JHBOMVpEfva5MO9Rw==\n-----END PRIVATE KEY-----\n

    const vertex = createVertex({
      project: 'gen-lang-client-0363261183',
      location: 'us-central1',
      googleCredentials: {
        clientEmail: 'velocis-scanner@gen-lang-client-0363261183.iam.gserviceaccount.com',
        privateKey: MANUAL_KEY.replace(/\\n/g, '\n'),
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
      error: "MASTER_KEY_FAIL", 
      details: error.message 
    });
  }
}
