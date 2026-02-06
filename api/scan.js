export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { image } = req.body;
    const base64Data = image.split(",")[1];

    // This is a direct pixel-to-text decoder. NO AI FILTERS.
    const response = await fetch(`https://api.qrserver.com/v1/read-qr-code/`, {
      method: 'POST',
      body: new URLSearchParams({ 'fileencoded': base64Data })
    });

    const data = await response.json();
    
    // If a code is found in the pixels
    if (data && data[0] && data[0].symbol[0] && data[0].symbol[0].data) {
      const rawString = data[0].symbol[0].data;

      // We send the raw string back. This bypasses all "Privacy Blocks."
      res.status(200).json({ 
        name: "DATA_FOUND", 
        origin: rawString.substring(0, 30), // This shows the raw airline data
        destination: "DECODED_OK" 
      });
    } else {
      res.status(200).json({ 
        name: "SCAN_RETRY", 
        origin: "Center_the_Code", 
        destination: "Check_Lighting" 
      });
    }

  } catch (error) {
    // This ensures that even if it fails, it returns valid JSON so the app doesn't crash
    res.status(200).json({ 
      name: "SYSTEM_ERROR", 
      origin: "Server_Hiccup", 
      destination: "Try_Again" 
    });
  }
}
