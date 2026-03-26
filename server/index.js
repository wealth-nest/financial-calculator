import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { parseCASText } from './casParser.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- File upload config ---
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// --- Lead Capture ---

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LEADS_FILE = path.join(__dirname, 'leads.json');

function readLeads() {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

function writeLeads(leads) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

app.post('/api/leads', (req, res) => {
  const { name, email, phone, interest } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone number are required' });
  }

  const lead = {
    id: Date.now().toString(),
    name: name.trim(),
    email: (email || '').trim(),
    phone: phone.trim(),
    interest: interest || '',
    createdAt: new Date().toISOString(),
  };

  const leads = readLeads();
  leads.push(lead);
  writeLeads(leads);

  console.log(`New lead: ${lead.name} - ${lead.phone}`);
  res.status(201).json({ message: 'Lead captured successfully', lead });
});

app.get('/api/leads', (req, res) => {
  const leads = readLeads();
  res.json(leads);
});

app.post('/api/calculate-lumpsum', (req, res) => {
  const { investmentAmount, annualReturnRate, years } = req.body;

  if (!investmentAmount || annualReturnRate === undefined || !years) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  if (investmentAmount <= 0 || annualReturnRate < 0 || years <= 0) {
    return res.status(400).json({ error: 'Invalid parameter values' });
  }

  const maturityValue =
    Math.round(investmentAmount * Math.pow(1 + annualReturnRate / 100, years) * 100) / 100;
  const estimatedReturns = Math.round((maturityValue - investmentAmount) * 100) / 100;

  res.json({
    investedAmount: investmentAmount,
    maturityValue,
    estimatedReturns,
  });
});

// Cache mutual fund list in memory (refreshes every 24 hours)
let mfCache = { data: null, timestamp: 0 };
const CACHE_DURATION = 24 * 60 * 60 * 1000;

app.get('/api/mutual-funds', async (req, res) => {
  try {
    const now = Date.now();
    if (mfCache.data && now - mfCache.timestamp < CACHE_DURATION) {
      return res.json(mfCache.data);
    }

    const response = await fetch('https://api.mfapi.in/mf');
    if (!response.ok) {
      throw new Error('Failed to fetch from AMFI API');
    }

    const data = await response.json();
    mfCache = { data, timestamp: now };
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch mutual funds' });
  }
});

app.get('/api/mutual-funds/:schemeCode', async (req, res) => {
  try {
    const { schemeCode } = req.params;
    const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
    if (!response.ok) {
      throw new Error('Failed to fetch scheme details');
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch scheme details' });
  }
});

// --- CAS PDF Upload & Parse ---
app.post('/api/parse-cas', upload.single('casFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const password = req.body.password || undefined;

    let fullText = '';
    try {
      const options = { data: req.file.buffer };
      if (password) {
        options.password = password;
      }
      const parser = new PDFParse(options);
      await parser.load();
      const numPages = parser.doc.numPages;
      const pageTexts = [];
      for (let i = 1; i <= numPages; i++) {
        const pageText = await parser.getPageText(i);
        pageTexts.push(pageText);
      }
      fullText = pageTexts.join('\n');
    } catch (pdfError) {
      if (pdfError.message && pdfError.message.includes('password')) {
        return res.status(400).json({
          error: 'This PDF is password-protected. Please provide the password (usually PAN + DOB in DDMMYYYY format).',
          needsPassword: true,
        });
      }
      throw pdfError;
    }

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
        rawTextPreview: pdfData.text.slice(0, 500),
      });
    }

    console.log(`CAS parsed: ${result.holdings.length} holdings found for ${result.investorName || 'unknown investor'}`);
    res.json(result);
  } catch (error) {
    console.error('CAS parse error:', error);
    res.status(500).json({ error: error.message || 'Failed to parse CAS PDF' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
