export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { image } = req.body;
    const base64Data = image.split(",")[1];

    // This is a professional decoding engine with ZERO privacy filters.
    // It works exactly like a hardware scanner at the airport gate.
    const response = await fetch(`https://api.qrserver.com/v1/read-qr-code/`, {
      method: 'POST',
      body: new URLSearchParams({ 'fileencoded': base64Data })
    });

    const data = await response.json();
    const result = data[0].symbol[0];

    if (result.data) {
      // The AI "Brain" can still help here by formatting the raw text!
      const rawData = result.data;
      
      res.status(200).json({ 
        name: "DECODED_SUCCESS", 
        origin: rawData.substring(0, 30), 
        destination: "MISSION_ACCOMPLISHED" 
      });
    } else {
      res.status(200).json({ 
        name: "SCAN_RETRY", 
        origin: "Center_the_Code", 
        destination: "Check_Lighting" 
      });
    }

  } catch (error) {
    res.status(200).json({ error: "SCAN_FAIL", details: error.message });
  }
}
