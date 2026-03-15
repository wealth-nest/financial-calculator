import { SchemeNav, MutualFundScheme } from '../types/mutualFund';

// --- AMC Info ---

interface AmcInfo {
  short: string;
  color: string;
}

const AMC_MAP: { prefix: string; short: string; color: string }[] = [
  { prefix: 'Aditya Birla Sun Life', short: 'ABSL', color: '#e8363c' },
  { prefix: 'Axis', short: 'AXIS', color: '#97144d' },
  { prefix: 'Bandhan', short: 'BDH', color: '#ec1c24' },
  { prefix: 'Bank of India', short: 'BOI', color: '#f37021' },
  { prefix: 'Baroda BNP', short: 'BNP', color: '#00a651' },
  { prefix: 'Canara Robeco', short: 'CR', color: '#1d4e9e' },
  { prefix: 'DSP', short: 'DSP', color: '#003366' },
  { prefix: 'Edelweiss', short: 'EDEL', color: '#00539b' },
  { prefix: 'Franklin', short: 'FT', color: '#004685' },
  { prefix: 'Groww', short: 'GRW', color: '#5367ff' },
  { prefix: 'HDFC', short: 'HDFC', color: '#004b87' },
  { prefix: 'HSBC', short: 'HSBC', color: '#db0011' },
  { prefix: 'ICICI Prudential', short: 'ICICI', color: '#f37021' },
  { prefix: 'Invesco', short: 'INV', color: '#003da5' },
  { prefix: 'ITI', short: 'ITI', color: '#0066b3' },
  { prefix: 'JM Financial', short: 'JM', color: '#1a3c6e' },
  { prefix: 'Kotak', short: 'KTK', color: '#ed1c24' },
  { prefix: 'LIC', short: 'LIC', color: '#0033a0' },
  { prefix: 'Mahindra', short: 'MAH', color: '#e8192c' },
  { prefix: 'Mirae Asset', short: 'MA', color: '#0055a5' },
  { prefix: 'Motilal Oswal', short: 'MO', color: '#003d6b' },
  { prefix: 'Navi', short: 'NAVI', color: '#6c63ff' },
  { prefix: 'Nippon India', short: 'NI', color: '#ee3124' },
  { prefix: 'PGIM', short: 'PGIM', color: '#003da5' },
  { prefix: 'PPFAS', short: 'PPFAS', color: '#0a3d62' },
  { prefix: 'Quant', short: 'QNT', color: '#1a1a2e' },
  { prefix: 'Quantum', short: 'QTM', color: '#1a3c6e' },
  { prefix: 'SBI', short: 'SBI', color: '#0f4da0' },
  { prefix: 'Shriram', short: 'SHR', color: '#c41230' },
  { prefix: 'Sundaram', short: 'SUN', color: '#006400' },
  { prefix: 'Tata', short: 'TATA', color: '#486baf' },
  { prefix: 'Taurus', short: 'TAU', color: '#6b2d8b' },
  { prefix: 'Trust', short: 'TR', color: '#2c3e50' },
  { prefix: 'Union', short: 'UNI', color: '#0033a0' },
  { prefix: 'UTI', short: 'UTI', color: '#0066b3' },
  { prefix: 'WhiteOak', short: 'WO', color: '#2d5016' },
  { prefix: 'Zerodha', short: 'ZRD', color: '#387ed1' },
  { prefix: 'Parag Parikh', short: 'PPFAS', color: '#0a3d62' },
  { prefix: 'Samco', short: 'SAM', color: '#0077c8' },
  { prefix: 'Helios', short: 'HEL', color: '#d4a843' },
  { prefix: '360 ONE', short: '360', color: '#1a1a2e' },
  { prefix: 'IIFL', short: 'IIFL', color: '#0077c8' },
  { prefix: 'Bajaj Finserv', short: 'BAJ', color: '#003399' },
  { prefix: 'Old Bridge', short: 'OB', color: '#8b4513' },
  { prefix: 'NJ', short: 'NJ', color: '#00467f' },
  { prefix: 'Templeton', short: 'FT', color: '#004685' },
  { prefix: 'Grindlays', short: 'GRD', color: '#555555' },
  { prefix: 'Alliance', short: 'ALI', color: '#666666' },
  { prefix: 'Birla', short: 'ABSL', color: '#e8363c' },
];

export function getAmcInfo(schemeName: string): AmcInfo {
  const nameLower = schemeName.toLowerCase();
  for (const amc of AMC_MAP) {
    if (nameLower.startsWith(amc.prefix.toLowerCase())) {
      return { short: amc.short, color: amc.color };
    }
  }
  const firstWord = schemeName.split(' ')[0] || '?';
  return { short: firstWord.slice(0, 3).toUpperCase(), color: '#6b7280' };
}

// --- Category Inference ---

const CATEGORIES = [
  { key: 'ELSS', label: 'ELSS', keywords: ['elss', 'tax sav'] },
  { key: 'Index / ETF', label: 'Index / ETF', keywords: ['index', ' etf', 'nifty', 'sensex', 'nasdaq', 'exchange traded', 'fund of fund'] },
  { key: 'Liquid', label: 'Liquid', keywords: ['liquid', 'money market', 'overnight'] },
  { key: 'Hybrid', label: 'Hybrid', keywords: ['hybrid', 'balanced', 'arbitrage', 'equity saving', 'multi asset', 'dynamic asset'] },
  { key: 'Debt', label: 'Debt', keywords: ['gilt', 'bond', 'credit risk', 'banking and psu', 'banking & psu', 'corporate bond', 'short duration', 'medium duration', 'long duration', 'ultra short', 'low duration', 'floater', 'dynamic bond', 'constant maturity', 'fixed maturity', 'debt', 'income fund', 'interval fund'] },
  { key: 'Equity', label: 'Equity', keywords: ['large cap', 'mid cap', 'small cap', 'multi cap', 'flexi cap', 'large & mid', 'focused fund', 'dividend yield', 'value fund', 'contra', 'sectoral', 'thematic', 'equity', 'opportunity'] },
] as const;

export type CategoryKey = 'All' | typeof CATEGORIES[number]['key'] | 'Other';

export const CATEGORY_LIST: { key: CategoryKey; label: string }[] = [
  { key: 'All', label: 'All' },
  ...CATEGORIES.map((c) => ({ key: c.key as CategoryKey, label: c.label })),
  { key: 'Other', label: 'Other' },
];

export function inferCategory(schemeName: string): CategoryKey {
  const name = schemeName.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.keywords.some((kw) => name.includes(kw))) {
      return cat.key as CategoryKey;
    }
  }
  return 'Other';
}

// --- Benchmark Mapping ---

// Maps category keywords to benchmark index fund search terms
// We search the AMFI scheme list for these terms to find the best proxy
const BENCHMARK_RULES: { keywords: string[]; searchTerms: string[]; benchmarkName: string }[] = [
  {
    keywords: ['large cap fund'],
    searchTerms: ['uti nifty 50 index fund', 'direct', 'growth'],
    benchmarkName: 'Nifty 50 (UTI Index)',
  },
  {
    keywords: ['mid cap fund'],
    searchTerms: ['motilal oswal nifty midcap 150 index fund', 'direct', 'growth'],
    benchmarkName: 'Nifty Midcap 150',
  },
  {
    keywords: ['small cap fund'],
    searchTerms: ['motilal oswal nifty smallcap 250 index fund', 'direct', 'growth'],
    benchmarkName: 'Nifty Smallcap 250',
  },
  {
    keywords: ['large & mid cap', 'large and mid cap'],
    searchTerms: ['mirae asset nifty largemidcap 250', 'direct', 'growth'],
    benchmarkName: 'Nifty LargeMidcap 250',
  },
  {
    keywords: ['flexi cap', 'multi cap', 'focused fund', 'value fund', 'contra', 'dividend yield', 'elss'],
    searchTerms: ['uti nifty 500 index fund', 'direct', 'growth'],
    benchmarkName: 'Nifty 500 (UTI Index)',
  },
  {
    keywords: ['hybrid', 'balanced', 'equity saving', 'multi asset', 'dynamic asset'],
    searchTerms: ['uti nifty 50 index fund', 'direct', 'growth'],
    benchmarkName: 'Nifty 50 (UTI Index)',
  },
  {
    keywords: ['sectoral', 'thematic', 'pharma', 'technology', 'infrastructure', 'consumption', 'banking'],
    searchTerms: ['uti nifty 50 index fund', 'direct', 'growth'],
    benchmarkName: 'Nifty 50 (UTI Index)',
  },
  {
    keywords: ['gilt', 'bond', 'debt', 'income', 'credit', 'corporate', 'banking and psu', 'banking & psu', 'short duration', 'medium duration', 'long duration', 'ultra short', 'low duration', 'floater', 'dynamic bond'],
    searchTerms: ['uti nifty 50 index fund', 'direct', 'growth'],
    benchmarkName: 'Nifty 50 (UTI Index)',
  },
];

// Fallback benchmark
const FALLBACK_BENCHMARK = {
  searchTerms: ['uti nifty 50 index fund', 'direct', 'growth'],
  benchmarkName: 'Nifty 50 (UTI Index)',
};

export function findBenchmarkScheme(
  category: string,
  allSchemes: MutualFundScheme[]
): { scheme: MutualFundScheme; benchmarkName: string } | null {
  const catLower = category.toLowerCase();

  let rule = BENCHMARK_RULES.find((r) => r.keywords.some((kw) => catLower.includes(kw)));
  if (!rule) {
    rule = { keywords: [], ...FALLBACK_BENCHMARK };
  }

  // Find matching scheme — all search terms must be present in the name
  const match = allSchemes.find((s) => {
    const name = s.schemeName.toLowerCase();
    return rule!.searchTerms.every((term) => name.includes(term));
  });

  if (match) {
    return { scheme: match, benchmarkName: rule.benchmarkName };
  }
  return null;
}

// --- NAV Date Helpers ---

export function parseNavDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

export function getNavBeforeDate(navData: SchemeNav[], targetDate: Date): { nav: number; date: string } | null {
  for (const item of navData) {
    const d = parseNavDate(item.date);
    if (d <= targetDate) {
      return { nav: parseFloat(item.nav), date: item.date };
    }
  }
  return null;
}

export function getYearsAgoDate(years: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d;
}

export function calcReturn(currentNav: number, pastNav: number): number {
  if (pastNav <= 0) return 0;
  return ((currentNav - pastNav) / pastNav) * 100;
}

export function calcCAGR(currentNav: number, pastNav: number, years: number): number {
  if (pastNav <= 0 || years <= 0) return 0;
  return (Math.pow(currentNav / pastNav, 1 / years) - 1) * 100;
}

export function filterNavByYears(navData: SchemeNav[], years: number | null): { date: string; nav: number }[] {
  if (!navData.length) return [];

  let filtered = navData;
  if (years !== null) {
    const cutoff = getYearsAgoDate(years);
    filtered = navData.filter((item) => parseNavDate(item.date) >= cutoff);
  }

  return filtered
    .slice()
    .reverse()
    .map((item) => ({ date: item.date, nav: parseFloat(item.nav) }));
}
