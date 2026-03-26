export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}
