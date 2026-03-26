let cache = { data: null, timestamp: 0 };
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const now = Date.now();
  if (cache.data && now - cache.timestamp < CACHE_DURATION) {
    return res.json(cache.data);
  }

  try {
    const response = await fetch('https://api.mfapi.in/mf');
    if (!response.ok) throw new Error('Failed to fetch from AMFI API');
    const data = await response.json();
    cache = { data, timestamp: now };
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch mutual funds' });
  }
}
