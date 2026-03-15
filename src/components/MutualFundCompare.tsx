import { useState, useEffect, useMemo } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchAllMutualFunds, fetchSchemeDetail } from '../services/mutualFundService';
import { MutualFundScheme, SchemeDetail } from '../types/mutualFund';
import { getAmcInfo, getNavBeforeDate, getYearsAgoDate, calcReturn, calcCAGR, filterNavByYears } from '../utils/fundHelpers';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

type Timeframe = '1Y' | '3Y' | '5Y' | '7Y' | '10Y' | 'MAX';
const TIMEFRAMES: { key: Timeframe; label: string; years: number | null }[] = [
  { key: '1Y', label: '1Y', years: 1 },
  { key: '3Y', label: '3Y', years: 3 },
  { key: '5Y', label: '5Y', years: 5 },
  { key: '7Y', label: '7Y', years: 7 },
  { key: '10Y', label: '10Y', years: 10 },
  { key: 'MAX', label: 'Max', years: null },
];

interface FundEntry {
  scheme: MutualFundScheme;
  detail: SchemeDetail | null;
  loading: boolean;
}

export default function MutualFundCompare() {
  const [allSchemes, setAllSchemes] = useState<MutualFundScheme[]>([]);
  const [schemesLoading, setSchemesLoading] = useState(true);
  const [funds, setFunds] = useState<FundEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>('1Y');

  useEffect(() => {
    fetchAllMutualFunds()
      .then(setAllSchemes)
      .finally(() => setSchemesLoading(false));
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const selectedCodes = new Set(funds.map((f) => f.scheme.schemeCode));
    return allSchemes
      .filter(
        (s) =>
          !selectedCodes.has(s.schemeCode) &&
          (s.schemeName.toLowerCase().includes(q) || s.schemeCode.toString().includes(q))
      )
      .slice(0, 10);
  }, [searchQuery, allSchemes, funds]);

  const addFund = async (scheme: MutualFundScheme) => {
    if (funds.length >= 5) return;
    setSearchQuery('');
    setShowSearch(false);

    const entry: FundEntry = { scheme, detail: null, loading: true };
    setFunds((prev) => [...prev, entry]);

    try {
      const detail = await fetchSchemeDetail(scheme.schemeCode);
      setFunds((prev) =>
        prev.map((f) => (f.scheme.schemeCode === scheme.schemeCode ? { ...f, detail, loading: false } : f))
      );
    } catch {
      setFunds((prev) =>
        prev.map((f) => (f.scheme.schemeCode === scheme.schemeCode ? { ...f, loading: false } : f))
      );
    }
  };

  const removeFund = (code: number) => {
    setFunds((prev) => prev.filter((f) => f.scheme.schemeCode !== code));
  };

  // Build normalized chart data (base 100)
  const chartData = useMemo(() => {
    const loadedFunds = funds.filter((f) => f.detail && f.detail.data.length > 0);
    if (loadedFunds.length === 0) return [];

    const tf = TIMEFRAMES.find((t) => t.key === timeframe);
    const fundNavs = loadedFunds.map((f) => filterNavByYears(f.detail!.data, tf?.years ?? null));

    // Collect all unique dates
    const dateSet = new Set<string>();
    fundNavs.forEach((navs) => navs.forEach((n) => dateSet.add(n.date)));
    const allDates = Array.from(dateSet).sort((a, b) => {
      const [da, ma, ya] = a.split('-').map(Number);
      const [db, mb, yb] = b.split('-').map(Number);
      return (ya * 10000 + ma * 100 + da) - (yb * 10000 + mb * 100 + db);
    });

    // Build lookup maps
    const navMaps = fundNavs.map((navs) => {
      const map = new Map<string, number>();
      navs.forEach((n) => map.set(n.date, n.nav));
      return map;
    });

    // Base values for normalization
    const baseValues = navMaps.map((map) => {
      for (const date of allDates) {
        const val = map.get(date);
        if (val) return val;
      }
      return 1;
    });

    return allDates.map((date) => {
      const point: Record<string, string | number> = { date };
      loadedFunds.forEach((f, i) => {
        const nav = navMaps[i].get(date);
        if (nav) {
          point[f.scheme.schemeName] = Math.round((nav / baseValues[i]) * 10000) / 100;
        }
      });
      return point;
    });
  }, [funds, timeframe]);

  // Returns comparison table data
  interface ReturnRow {
    name: string;
    code: number;
    nav: number;
    category: string;
    return1Y: number | null;
    return3Y: number | null;
    return5Y: number | null;
    return7Y: number | null;
    return10Y: number | null;
  }

  const returnsData: ReturnRow[] = useMemo(() => {
    return funds
      .filter((f) => f.detail && f.detail.data.length > 0)
      .map((f) => {
        const navData = f.detail!.data;
        const latestNav = parseFloat(navData[0].nav);

        const get = (years: number) => {
          const past = getNavBeforeDate(navData, getYearsAgoDate(years));
          if (!past) return null;
          return years > 1 ? calcCAGR(latestNav, past.nav, years) : calcReturn(latestNav, past.nav);
        };

        return {
          name: f.scheme.schemeName,
          code: f.scheme.schemeCode,
          nav: latestNav,
          category: f.detail!.meta.scheme_category,
          return1Y: get(1),
          return3Y: get(3),
          return5Y: get(5),
          return7Y: get(7),
          return10Y: get(10),
        };
      });
  }, [funds]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Compare Mutual Funds</h1>
          <p className="text-gray-600 text-lg">Select up to 5 funds to compare side by side</p>
        </div>

        {/* Selected Funds */}
        <div className="flex flex-wrap gap-3 mb-6">
          {funds.map((f, i) => {
            const amc = getAmcInfo(f.scheme.schemeName);
            return (
              <div
                key={f.scheme.schemeCode}
                className="flex items-center gap-2 bg-white rounded-lg shadow-md px-3 py-2 border-l-4"
                style={{ borderLeftColor: COLORS[i] }}
              >
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{ backgroundColor: amc.color }}
                >
                  {amc.short}
                </div>
                <span className="text-sm font-medium text-gray-800 max-w-[200px] truncate">
                  {f.scheme.schemeName}
                </span>
                {f.loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />}
                <button
                  onClick={() => removeFund(f.scheme.schemeCode)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {funds.length < 5 && (
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 bg-white rounded-lg shadow-md px-4 py-2 border-2 border-dashed border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Fund ({5 - funds.length} remaining)
            </button>
          )}
        </div>

        {/* Search Dropdown */}
        {showSearch && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mutual fund by name or code..."
                className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                autoFocus
              />
              <button
                onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {schemesLoading && <p className="text-sm text-gray-500 mt-3">Loading schemes...</p>}

            {searchResults.length > 0 && (
              <div className="mt-3 max-h-64 overflow-y-auto space-y-1">
                {searchResults.map((scheme) => {
                  const amc = getAmcInfo(scheme.schemeName);
                  return (
                    <button
                      key={scheme.schemeCode}
                      onClick={() => addFund(scheme)}
                      className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ backgroundColor: amc.color }}
                      >
                        {amc.short}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{scheme.schemeName}</p>
                        <p className="text-xs text-gray-500">Code: {scheme.schemeCode}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {searchQuery.trim() && searchResults.length === 0 && !schemesLoading && (
              <p className="text-sm text-gray-500 mt-3">No matching funds found.</p>
            )}
          </div>
        )}

        {/* Comparison Content */}
        {funds.length >= 2 && returnsData.length >= 2 && (
          <>
            {/* NAV Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Normalized NAV (Base 100)</h3>
                <div className="flex gap-1">
                  {TIMEFRAMES.map((tf) => (
                    <button
                      key={tf.key}
                      onClick={() => setTimeframe(tf.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        timeframe === tf.key
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="date"
                      stroke="#666"
                      tick={{ fontSize: 10 }}
                      interval={Math.max(1, Math.floor(chartData.length / 6))}
                    />
                    <YAxis stroke="#666" tickFormatter={(v) => `${v}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }} />
                    <Legend />
                    {funds
                      .filter((f) => f.detail)
                      .map((f, i) => (
                        <Line
                          key={f.scheme.schemeCode}
                          type="monotone"
                          dataKey={f.scheme.schemeName}
                          stroke={COLORS[i]}
                          strokeWidth={2}
                          dot={false}
                          connectNulls
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Returns Comparison Table */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Returns Comparison</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Fund</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">NAV</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">1Y</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">3Y CAGR</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">5Y CAGR</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">7Y CAGR</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">10Y CAGR</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnsData.map((row) => (
                      <tr key={row.code} className="border-t border-gray-100">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[funds.findIndex((f) => f.scheme.schemeCode === row.code)] }} />
                            <span className="font-medium text-gray-900 max-w-[250px] truncate block">{row.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">₹{row.nav.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">
                          {row.return1Y !== null ? (
                            <span className={`font-semibold ${row.return1Y >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {row.return1Y >= 0 ? '+' : ''}{row.return1Y.toFixed(2)}%
                            </span>
                          ) : <span className="text-gray-400">N/A</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {row.return3Y !== null ? (
                            <span className={`font-semibold ${row.return3Y >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {row.return3Y >= 0 ? '+' : ''}{row.return3Y.toFixed(2)}%
                            </span>
                          ) : <span className="text-gray-400">N/A</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {row.return5Y !== null ? (
                            <span className={`font-semibold ${row.return5Y >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {row.return5Y >= 0 ? '+' : ''}{row.return5Y.toFixed(2)}%
                            </span>
                          ) : <span className="text-gray-400">N/A</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {row.return7Y !== null ? (
                            <span className={`font-semibold ${row.return7Y >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {row.return7Y >= 0 ? '+' : ''}{row.return7Y.toFixed(2)}%
                            </span>
                          ) : <span className="text-gray-400">N/A</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {row.return10Y !== null ? (
                            <span className={`font-semibold ${row.return10Y >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {row.return10Y >= 0 ? '+' : ''}{row.return10Y.toFixed(2)}%
                            </span>
                          ) : <span className="text-gray-400">N/A</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{row.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {funds.length < 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <p className="text-gray-500 text-lg">Add at least 2 mutual funds to start comparing</p>
            <p className="text-gray-400 text-sm mt-2">
              Click "Add Fund" above to search and select funds
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
