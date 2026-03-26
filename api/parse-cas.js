import { IncomingForm } from 'formidable';
import { readFileSync } from 'fs';
import pdfParse from 'pdf-parse';
import { parseCASText } from '../server/casParser.js';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm({ maxFileSize: 20 * 1024 * 1024 });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Failed to parse form' });
    }

    const file = Array.isArray(files.casFile) ? files.casFile[0] : files.casFile;
    if (!file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    try {
      const buffer = readFileSync(file.filepath);
      const options = { version: 'v1.10.100' };
      const password = Array.isArray(fields.password) ? fields.password[0] : fields.password;
      if (password) options.password = password;

      let pdfData;
      try {
        pdfData = await pdfParse(buffer, options);
      } catch (pdfError) {
        if (pdfError.message && pdfError.message.includes('password')) {
          return res.status(400).json({
            error: 'This PDF is password-protected. Please provide the password (usually PAN + DOB in DDMMYYYY format).',
            needsPassword: true,
          });
        }
        throw pdfError;
      }

      const fullText = pdfData.text;
      if (!fullText || fullText.trim().length < 50) {
        return res.status(400).json({
          error: 'Could not extract text from this PDF. It may be a scanned document or an unsupported format.',
        });
      }

      const result = parseCASText(fullText);

      if (result.holdings.length === 0) {
        return res.status(200).json({
          ...result,
          warning: 'No mutual fund holdings could be detected in this document. Please verify this is a CAMS/KFintech CAS statement.',
        });
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message || 'Failed to parse CAS PDF' });
    }
  });
}
