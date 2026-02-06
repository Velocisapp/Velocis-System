export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { image } = req.body;
    const base64Data = image.split(",")[1];

    // This engine translates pixels directly to text. 
    // It is immune to Google's "Privacy Blocks."
    const response = await fetch(`https://api.qrserver.com/v1/read-qr-code/`, {
      method: 'POST',
      body: new URLSearchParams({ 'fileencoded': base64Data })
    });

    const data = await response.json();
    
    // Check if the decoder found the data in the Aztec code
    if (data && data[0] && data[0].symbol[0] && data[0].symbol[0].data) {
      const rawString = data[0].symbol[0].data;

      // SUCCESS: Returning the raw airline string (e.g., M1USER/NAME...)
      res.status(200).json({ 
        name: "INTEL_FOUND", 
        origin: rawString.substring(0, 30), 
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
    res.status(200).json({ 
      name: "SYSTEM_ERROR", 
      origin: "External_Link_Fail", 
      destination: "Try_Again" 
    });
  }
}
