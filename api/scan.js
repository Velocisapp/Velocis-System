import Jimp from 'jimp';
import jsQR from 'jsqr';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { image } = req.body;
    const base64Data = image.split(",")[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // 1. Read the image pixels
    const img = await Jimp.read(buffer);
    const { data, width, height } = img.bitmap;

    // 2. Scan the pixels for a QR code
    const code = jsQR(data, width, height);

    if (code) {
      // Boarding pass QR codes usually look like: M1USER/NAME...
      // We send THIS string to the AI to "translate" it into a name/city
      res.status(200).json({ 
        raw_data: code.data,
        message: "Code Decoded Successfully" 
      });
    } else {
      res.status(200).json({ error: "NO_CODE_FOUND", details: "No QR code detected in image" });
    }

  } catch (error) {
    res.status(200).json({ error: "DECODE_FAIL", details: error.message });
  }
}
