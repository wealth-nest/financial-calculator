import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Lumpsum API server running on http://localhost:${PORT}`);
});
