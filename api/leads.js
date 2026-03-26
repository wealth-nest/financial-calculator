export default function handler(req, res) {
  if (req.method === 'POST') {
    const { name, phone } = req.body || {};
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone number are required' });
    }
    return res.status(201).json({ message: 'Lead captured successfully' });
  }
  if (req.method === 'GET') {
    return res.json([]);
  }
  res.status(405).json({ error: 'Method not allowed' });
}
