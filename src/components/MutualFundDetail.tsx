import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Info, Layers, Search, X, Plus, GitCompareArrows } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchAllMutualFunds, fetchSchemeDetail } from '../services/mutualFundService';
import { MutualFundScheme, SchemeDetail, SchemeNav } from '../types/mutualFund';
import {
  getAmcInfo, getNavBeforeDate, getYearsAgoDate,
  calcReturn, calcCAGR, filterNavByYears, findBenchmarkScheme, parseNavDate,
} from '../utils/fundHelpers';

interface MutualFundDetailProps {
  schemeCode: number;
  schemeName: string;
  onBack: () => void;
}

type Timeframe = '1Y' | '3Y' | '5Y' | '7Y' | '10Y' | 'MAX';
const TIMEFRAMES: { key: Timeframe; label: string; years: number | null }[] = [
  { key: '1Y', label: '1Y', years: 1 },
  { key: '3Y', label: '3Y', years: 3 },
  { key: '5Y', label: '5Y', years: 5 },
  { key: '7Y', label: '7Y', years: 7 },
  { key: '10Y', label: '10Y', years: 10 },
  { key: 'MAX', label: 'Max', years: null },
];

const COMPARE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

interface CompareEntry {
  label: string;
  schemeCode: number;
  navData: SchemeNav[];
  isBenchmark: boolean;
}

export default function MutualFundDetail({ schemeCode, schemeName, onBack }: MutualFundDetailProps) {
  const [detail, setDetail] = useState<SchemeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('1Y');

  // Embedded calculator state
  const [calcMode, setCalcMode] = useState<'sip' | 'lumpsum'>('sip');
  const [calcAmount, setCalcAmount] = useState('5000');
  const [calcYears, setCalcYears] = useState('5');

  // Compare state
  const [compareFunds, setCompareFunds] = useState<CompareEntry[]>([]);
  const [compareLoading, setCompareLoading] = useState(false);
  const [allSchemes, setAllSchemes] = useState<MutualFundScheme[]>([]);
  const [compareSearch, setCompareSearch] = useState('');
  const [showCompareSearch, setShowCompareSearch] = useState(false);
  const [compareTimeframe, setCompareTimeframe] = useState<Timeframe>('1Y');

  // Load main fund detail
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchSchemeDetail(schemeCode);
        setDetail(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [schemeCode]);

  // Load all schemes for benchmark + comparison search
  useEffect(() => {
    fetchAllMutualFunds().then(setAllSchemes).catch(() => {});
  }, []);

  // Auto-load benchmark once we have detail + scheme list
  useEffect(() => {
    if (!detail || allSchemes.length === 0 || compareFunds.length > 0) return;

    const benchmark = findBenchmarkScheme(detail.meta.scheme_category, allSchemes);
    if (!benchmark || benchmark.scheme.schemeCode === schemeCode) return;

    setCompareLoading(true);
    fetchSchemeDetail(benchmark.scheme.schemeCode)
      .then((bDetail) => {
        setCompareFunds([{
          label: benchmark.benchmarkName,
          schemeCode: benchmark.scheme.schemeCode,
          navData: bDetail.data,
          isBenchmark: true,
        }]);
      })
      .catch(() => {})
      .finally(() => setCompareLoading(false));
  }, [detail, allSchemes, schemeCode]);

  // Derived values
  const navData = detail?.data || [];
  const meta = detail?.meta;
  const latestNav = navData.length > 0 ? parseFloat(navData[0].nav) : 0;
  const previousNav = navData.length > 1 ? parseFloat(navData[1].nav) : 0;
  const dayChange = latestNav - previousNav;
  const dayChangePercent = previousNav > 0 ? (dayChange / previousNav) * 100 : 0;

  const inceptionDate = navData.length > 0 ? navData[navData.length - 1].date : null;

  // Period returns
  const returns = useMemo(() => {
    if (!navData.length) return {};
    const periods = [
      { key: '1Y', years: 1 }, { key: '3Y', years: 3 }, { key: '5Y', years: 5 },
      { key: '7Y', years: 7 }, { key: '10Y', years: 10 },
    ];
    const result: Record<string, { absolute: number; cagr: number } | null> = {};
    for (const p of periods) {
      const pastEntry = getNavBeforeDate(navData, getYearsAgoDate(p.years));
      if (pastEntry) {
        result[p.key] = {
          absolute: calcReturn(latestNav, pastEntry.nav),
          cagr: p.years > 1 ? calcCAGR(latestNav, pastEntry.nav, p.years) : calcReturn(latestNav, pastEntry.nav),
        };
      } else {
        result[p.key] = null;
      }
    }
    return result;
  }, [navData, latestNav]);

  // Chart data for NAV history
  const chartData = useMemo(() => {
    const tf = TIMEFRAMES.find((t) => t.key === timeframe);
    return filterNavByYears(navData, tf?.years ?? null);
  }, [navData, timeframe]);

  // Comparison chart data (normalized base 100)
  const compareChartData = useMemo(() => {
    if (navData.length === 0) return [];

    const tf = TIMEFRAMES.find((t) => t.key === compareTimeframe);
    const years = tf?.years ?? null;

    const allSeries = [
      { label: 'This Fund', navs: filterNavByYears(navData, years) },
      ...compareFunds.map((f) => ({
        label: f.label,
        navs: filterNavByYears(f.navData, years),
      })),
    ];

    // Collect all dates
    const dateSet = new Set<string>();
    allSeries.forEach((s) => s.navs.forEach((n) => dateSet.add(n.date)));
    const allDates = Array.from(dateSet).sort((a, b) => {
      const da = parseNavDate(a).getTime();
      const db = parseNavDate(b).getTime();
      return da - db;
    });

    // Build lookup maps + base values
    const maps = allSeries.map((s) => {
      const m = new Map<string, number>();
      s.navs.forEach((n) => m.set(n.date, n.nav));
      return m;
    });
    const bases = maps.map((m) => {
      for (const d of allDates) {
        const v = m.get(d);
        if (v) return v;
      }
      return 1;
    });

    return allDates.map((date) => {
      const point: Record<string, string | number> = { date };
      allSeries.forEach((s, i) => {
        const v = maps[i].get(date);
        if (v) point[s.label] = Math.round((v / bases[i]) * 10000) / 100;
      });
      return point;
    });
  }, [navData, compareFunds, compareTimeframe]);

  // Calculator
  const defaultCagr = returns['3Y']?.cagr ?? returns['1Y']?.absolute ?? 12;

  const calcResult = useMemo(() => {
    const amount = parseFloat(calcAmount) || 0;
    const years = parseFloat(calcYears) || 0;
    const rate = defaultCagr;
    if (amount <= 0 || years <= 0) return null;

    if (calcMode === 'lumpsum') {
      const maturity = amount * Math.pow(1 + rate / 100, years);
      return { invested: amount, maturity: Math.round(maturity), returns: Math.round(maturity - amount) };
    } else {
      const monthlyRate = rate / 12 / 100;
      const months = years * 12;
      let value = 0;
      for (let i = 0; i < months; i++) {
        value = (value + amount) * (1 + monthlyRate);
      }
      const invested = amount * months;
      return { invested, maturity: Math.round(value), returns: Math.round(value - invested) };
    }
  }, [calcMode, calcAmount, calcYears, defaultCagr]);

  // Compare search results
  const compareSearchResults = useMemo(() => {
    if (!compareSearch.trim()) return [];
    const q = compareSearch.toLowerCase();
    const usedCodes = new Set([schemeCode, ...compareFunds.map((f) => f.schemeCode)]);
    return allSchemes
      .filter((s) => !usedCodes.has(s.schemeCode) && (s.schemeName.toLowerCase().includes(q) || s.schemeCode.toString().includes(q)))
      .slice(0, 8);
  }, [compareSearch, allSchemes, compareFunds, schemeCode]);

  const addCompareFund = async (scheme: MutualFundScheme) => {
    if (compareFunds.length >= 4) return;
    setCompareSearch('');
    setShowCompareSearch(false);

    try {
      const d = await fetchSchemeDetail(scheme.schemeCode);
      setCompareFunds((prev) => [...prev, {
        label: scheme.schemeName,
        schemeCode: scheme.schemeCode,
        navData: d.data,
        isBenchmark: false,
      }]);
    } catch { /* skip */ }
  };

  const removeCompareFund = (code: number) => {
    setCompareFunds((prev) => prev.filter((f) => f.schemeCode !== code));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !detail || !meta) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'No data available'}</p>
        <button onClick={onBack} className="text-indigo-600 hover:underline">Go back</button>
      </div>
    );
  }

  const amc = getAmcInfo(schemeName);

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to list
      </button>

      {/* ---- Header ---- */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: amc.color }}
          >
            {amc.short}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{meta.scheme_name}</h2>
            <p className="text-gray-500">{meta.fund_house}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">{meta.scheme_category}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{meta.scheme_type}</span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Latest NAV</p>
            <p className="font-bold text-gray-900 text-xl">₹{latestNav.toFixed(4)}</p>
            <p className="text-xs text-gray-400">{navData[0]?.date}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Day Change</p>
            <div className="flex items-center gap-1">
              {dayChange >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
              <p className={`font-bold text-xl ${dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dayChangePercent >= 0 ? '+' : ''}{dayChangePercent.toFixed(2)}%
              </p>
            </div>
            <p className={`text-xs ${dayChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {dayChange >= 0 ? '+' : ''}₹{dayChange.toFixed(4)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Scheme Code</p>
            <p className="font-bold text-gray-900 text-xl">{meta.scheme_code}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Inception Date</p>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <p className="font-semibold text-gray-900 text-sm">{inceptionDate || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Period Returns */}
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Returns</h3>
        <div className="grid grid-cols-5 gap-3 mb-8">
          {(['1Y', '3Y', '5Y', '7Y', '10Y'] as const).map((key) => {
            const r = returns[key];
            return (
              <div key={key} className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">{key}</p>
                {r ? (
                  <>
                    <p className={`font-bold text-sm ${r.cagr >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {r.cagr >= 0 ? '+' : ''}{r.cagr.toFixed(2)}%
                    </p>
                    <p className="text-[10px] text-gray-400">{key === '1Y' ? 'absolute' : 'CAGR'}</p>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">N/A</p>
                )}
              </div>
            );
          })}
        </div>

        {/* NAV Chart */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">NAV History</h3>
          <div className="flex gap-1">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.key}
                onClick={() => setTimeframe(tf.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  timeframe === tf.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 11 }} interval={Math.max(1, Math.floor(chartData.length / 6))} />
              <YAxis stroke="#666" domain={['auto', 'auto']} tickFormatter={(value) => `₹${value.toFixed(0)}`} />
              <Tooltip
                formatter={(value: number | undefined) => [`₹${(value ?? 0).toFixed(4)}`, 'NAV']}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="nav" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---- Compare with Benchmark & Other Funds ---- */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <GitCompareArrows className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Compare Performance</h3>
        </div>

        {/* Chips for compared funds */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-1.5 border border-indigo-200">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COMPARE_COLORS[0] }} />
            <span className="text-sm font-medium text-indigo-800">This Fund</span>
          </div>

          {compareFunds.map((f, i) => (
            <div
              key={f.schemeCode}
              className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200"
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COMPARE_COLORS[(i + 1) % COMPARE_COLORS.length] }} />
              <span className="text-sm font-medium text-gray-800 max-w-[180px] truncate">
                {f.label}
                {f.isBenchmark && <span className="ml-1 text-[10px] text-amber-600 font-normal">(Benchmark)</span>}
              </span>
              <button onClick={() => removeCompareFund(f.schemeCode)} className="text-gray-400 hover:text-red-500">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {compareLoading && (
            <div className="flex items-center gap-2 px-3 py-1.5">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
              <span className="text-xs text-gray-500">Loading benchmark...</span>
            </div>
          )}

          {compareFunds.length < 4 && (
            <button
              onClick={() => setShowCompareSearch(true)}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 border-2 border-dashed border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors text-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Fund
            </button>
          )}
        </div>

        {/* Compare search */}
        {showCompareSearch && (
          <div className="mb-4 bg-gray-50 rounded-xl p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={compareSearch}
                onChange={(e) => setCompareSearch(e.target.value)}
                placeholder="Search fund to compare..."
                className="w-full pl-9 pr-9 py-2.5 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
                autoFocus
              />
              <button
                onClick={() => { setShowCompareSearch(false); setCompareSearch(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {compareSearchResults.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                {compareSearchResults.map((s) => {
                  const a = getAmcInfo(s.schemeName);
                  return (
                    <button
                      key={s.schemeCode}
                      onClick={() => addCompareFund(s)}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-50 text-sm"
                    >
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                        style={{ backgroundColor: a.color }}
                      >
                        {a.short}
                      </div>
                      <span className="truncate text-gray-800">{s.schemeName}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Comparison Chart */}
        {compareChartData.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">Normalized performance (Base 100)</p>
              <div className="flex gap-1">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf.key}
                    onClick={() => setCompareTimeframe(tf.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      compareTimeframe === tf.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={compareChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 10 }} interval={Math.max(1, Math.floor(compareChartData.length / 6))} />
                  <YAxis stroke="#666" tickFormatter={(v) => `${v}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="This Fund" stroke={COMPARE_COLORS[0]} strokeWidth={2} dot={false} connectNulls />
                  {compareFunds.map((f, i) => (
                    <Line
                      key={f.schemeCode}
                      type="monotone"
                      dataKey={f.label}
                      stroke={COMPARE_COLORS[(i + 1) % COMPARE_COLORS.length]}
                      strokeWidth={f.isBenchmark ? 2 : 1.5}
                      strokeDasharray={f.isBenchmark ? '6 3' : undefined}
                      dot={false}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      {/* ---- Fund Information ---- */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Info className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Fund Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <InfoRow label="Fund House" value={meta.fund_house} />
          <InfoRow label="Category" value={meta.scheme_category} />
          <InfoRow label="Scheme Type" value={meta.scheme_type} />
          <InfoRow label="Inception Date" value={inceptionDate || 'N/A'} />
          <InfoRow label="Fund Manager" value="—" note="Not available via free API" />
          <InfoRow label="Expense Ratio" value="—" note="Not available via free API" />
          <InfoRow label="Exit Load" value="—" note="Not available via free API" />
          <InfoRow label="AUM" value="—" note="Not available via free API" />
        </div>
      </div>

      {/* ---- Portfolio Holdings ---- */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Portfolio Holdings</h3>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-gray-500 text-sm">Portfolio holdings data is not available via the free AMFI API.</p>
          <p className="text-gray-400 text-xs mt-1">Check the AMC website or factsheet for detailed holdings.</p>
        </div>
      </div>

      {/* ---- Embedded Calculator ---- */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Investment Calculator</h3>
        <p className="text-sm text-gray-500 mb-6">
          Based on {returns['3Y'] ? '3Y CAGR' : returns['1Y'] ? '1Y return' : 'default'} of{' '}
          <span className="font-semibold text-indigo-600">{defaultCagr.toFixed(2)}%</span>
        </p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setCalcMode('sip')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              calcMode === 'sip' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            SIP
          </button>
          <button
            onClick={() => setCalcMode('lumpsum')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              calcMode === 'lumpsum' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Lumpsum
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {calcMode === 'sip' ? 'Monthly Investment (₹)' : 'Investment Amount (₹)'}
            </label>
            <input
              type="number"
              value={calcAmount}
              onChange={(e) => setCalcAmount(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (Years)</label>
            <input
              type="number"
              value={calcYears}
              onChange={(e) => setCalcYears(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
              min="1"
            />
          </div>
        </div>

        {calcResult && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Invested</p>
              <p className="font-bold text-gray-900 text-lg">₹{calcResult.invested.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Maturity Value</p>
              <p className="font-bold text-green-700 text-lg">₹{calcResult.maturity.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Est. Returns</p>
              <p className="font-bold text-emerald-700 text-lg">₹{calcResult.returns.toLocaleString('en-IN')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex justify-between items-baseline py-2 border-b border-gray-100">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="text-right">
        <span className="text-sm font-semibold text-gray-900">{value}</span>
        {note && <p className="text-[10px] text-gray-400">{note}</p>}
      </div>
    </div>
  );
}
