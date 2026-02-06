import Jimp from 'jimp';
import { MultiFormatReader, BarcodeFormat, DecodeHintType, RGBLuminanceSource, BinaryBitmap, HybridBinarizer } from '@zxing/library';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { image } = req.body;
    const buffer = Buffer.from(image.split(",")[1], 'base64');

    // 1. Process image for "Airline Grade" clarity
    const img = await Jimp.read(buffer);
    const { data, width, height } = img.bitmap;

    // 2. Set up the Universal Reader
    const hints = new Map();
    const formats = [
      BarcodeFormat.AZTEC, 
      BarcodeFormat.QR_CODE, 
      BarcodeFormat.PDF_417, 
      BarcodeFormat.DATA_MATRIX
    ];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    hints.set(DecodeHintType.TRY_HARDER, true);

    const reader = new MultiFormatReader();
    reader.setHints(hints);

    // 3. Convert image to a format the decoder understands
    const len = width * height;
    const luminances = new Uint8ClampedArray(len);
    for (let i = 0; i < len; i++) {
      luminances[i] = ((data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2]) / 3) & 0xFF;
    }
    
    const source = new RGBLuminanceSource(luminances, width, height);
    const bitmap = new BinaryBitmap(new HybridBinarizer(source));

    // 4. Decode any barcode found
    const result = reader.decode(bitmap);

    if (result) {
      // Return the raw airline string (M1NAME/FIRST...)
      res.status(200).json({ 
        name: "DECODED", 
        origin: result.getText(), 
        destination: "FORMAT: " + result.getBarcodeFormat() 
      });
    }

  } catch (error) {
    res.status(200).json({ 
      name: "NO CODE FOUND", 
      origin: "Ensure code is centered", 
      destination: "Try Again" 
    });
  }
}
