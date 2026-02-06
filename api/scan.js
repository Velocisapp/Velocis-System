import Jimp from 'jimp';
import * as ZXing from '@zxing/library';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { image } = req.body;
    const buffer = Buffer.from(image.split(",")[1], 'base64');

    // 1. Process image for clarity
    const img = await Jimp.read(buffer);
    const { data, width, height } = img.bitmap;

    // 2. Set up the Universal Reader using the ZXing bundle
    const hints = new Map();
    const formats = [
      ZXing.BarcodeFormat.AZTEC, 
      ZXing.BarcodeFormat.QR_CODE, 
      ZXing.BarcodeFormat.PDF_417, 
      ZXing.BarcodeFormat.DATA_MATRIX
    ];
    hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, formats);
    hints.set(ZXing.DecodeHintType.TRY_HARDER, true);

    const reader = new ZXing.MultiFormatReader();
    reader.setHints(hints);

    // 3. Convert image to a format the decoder understands
    const len = width * height;
    const luminances = new Uint8ClampedArray(len);
    for (let i = 0; i < len; i++) {
      luminances[i] = ((data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2]) / 3) & 0xFF;
    }
    
    const source = new ZXing.RGBLuminanceSource(luminances, width, height);
    const bitmap = new ZXing.BinaryBitmap(new ZXing.HybridBinarizer(source));

    // 4. Decode the code
    const result = reader.decode(bitmap);

    if (result) {
      res.status(200).json({ 
        name: "DECODED", 
        origin: result.getText(), 
        destination: "TYPE: " + result.getBarcodeFormat() 
      });
    }

  } catch (error) {
    // This catches both "No Code Found" and server errors
    res.status(200).json({ 
      error: "SCAN_FAIL", 
      details: error.message 
    });
  }
}
