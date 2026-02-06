export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { image } = req.body;
    const base64Data = image.split(",")[1];

    // We use a professional Barcode API that doesn't have "AI Privacy Blocks"
    const response = await fetch(`https://api.qrserver.com/v1/read-qr-code/`, {
      method: 'POST',
      body: new URLSearchParams({
        'fileencoded': base64Data
      })
    });

    const data = await response.json();
    
    // Check if the decoder found a symbol in the pixels
    if (data && data[0] && data[0].symbol[0] && data[0].symbol[0].data) {
      const rawString = data[0].symbol[0].data;

      // Airline codes usually look like: M1USER/NAME EABC123 FRA SIN...
      // We send the raw string back so you can see it actually worked!
      res.status(200).json({ 
        name: "DECODED", 
        origin: rawString.substring(0, 30), // Shows the first part of the flight data
        destination: "RAW_DATA_OK" 
      });
    } else {
      res.status(200).json({ 
        name: "NO_CODE_FOUND", 
        origin: "Center_the_code", 
        destination: "Try_Closer" 
      });
    }

  } catch (error) {
    res.status(200).json({ error: "SCAN_FAIL", details: error.message });
  }
}
