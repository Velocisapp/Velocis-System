export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { image } = req.body;
    const base64Data = image.split(",")[1];

    // This is a direct pixel-decoder. It has NO filters and NO privacy shields.
    const response = await fetch(`https://api.qrserver.com/v1/read-qr-code/`, {
      method: 'POST',
      body: new URLSearchParams({ 'fileencoded': base64Data })
    });

    const data = await response.json();
    
    if (data && data[0] && data[0].symbol[0] && data[0].symbol[0].data) {
      const rawString = data[0].symbol[0].data;

      // MISSION SUCCESS: We send the raw flight data back to the app.
      res.status(200).json({ 
        name: "INTEL_FOUND", 
        origin: rawString.substring(0, 25), 
        destination: "DECODED_OK" 
      });
    } else {
      res.status(200).json({ 
        name: "SCAN_RETRY", 
        origin: "Center_the_Code", 
        destination: "Adjust_Lighting" 
      });
    }

  } catch (error) {
    res.status(200).json({ 
      name: "CONNECTION_ERROR", 
      origin: "Server_Busy", 
      destination: "Try_Again" 
    });
  }
}
