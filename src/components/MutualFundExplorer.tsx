import { useState, useEffect, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchAllMutualFunds } from '../services/mutualFundService';
import { MutualFundScheme } from '../types/mutualFund';
import { getAmcInfo, inferCategory, CATEGORY_LIST, CategoryKey } from '../utils/fundHelpers';
import MutualFundDetail from './MutualFundDetail';

const PAGE_SIZE = 20;

const FUND_HOUSES = [
  'All Fund Houses',
  'SBI', 'HDFC', 'ICICI Prudential', 'Aditya Birla Sun Life', 'Axis',
  'Kotak', 'Nippon India', 'UTI', 'DSP', 'Tata', 'Mirae Asset',
  'Motilal Oswal', 'Bandhan', 'Canara Robeco', 'Franklin Templeton',
  'PGIM India', 'Edelweiss', 'Invesco India', 'Sundaram', 'Quant',
  'PPFAS', 'HSBC', 'Bajaj Finserv', 'Groww', 'Navi', 'Samco',
];

export default function MutualFundExplorer() {
  const [schemes, setSchemes] = useState<MutualFundScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [fundHouse, setFundHouse] = useState('All Fund Houses');
  const [category, setCategory] = useState<CategoryKey>('All');
  const [page, setPage] = useState(1);
  const [selectedScheme, setSelectedScheme] = useState<MutualFundScheme | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAllMutualFunds();
        setSchemes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mutual funds');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = schemes;

    if (fundHouse !== 'All Fund Houses') {
      result = result.filter((s) =>
        s.schemeName.toLowerCase().includes(fundHouse.toLowerCase())
      );
    }

    if (category !== 'All') {
      result = result.filter((s) => inferCategory(s.schemeName) === category);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.schemeName.toLowerCase().includes(q) ||
          s.schemeCode.toString().includes(q)
      );
    }

    return result;
  }, [schemes, search, fundHouse, category]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, fundHouse, category]);

  if (selectedScheme) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <MutualFundDetail
            schemeCode={selectedScheme.schemeCode}
            schemeName={selectedScheme.schemeName}
            onBack={() => setSelectedScheme(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mutual Funds in India</h1>
          <p className="text-gray-600 text-lg">
            Browse {schemes.length.toLocaleString('en-IN')} schemes sourced from AMFI
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {CATEGORY_LIST.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === cat.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search + Fund House Filter */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by scheme name or code..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            <select
              value={fundHouse}
              onChange={(e) => setFundHouse(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors bg-white"
            >
              {FUND_HOUSES.map((fh) => (
                <option key={fh} value={fh}>{fh}</option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading mutual funds from AMFI...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}. Make sure the backend server is running (<code>npm run server</code>).
          </div>
        )}

        {!loading && !error && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Showing {paginated.length} of {filtered.length.toLocaleString('en-IN')} schemes
            </p>

            <div className="space-y-3">
              {paginated.map((scheme) => {
                const amc = getAmcInfo(scheme.schemeName);
                const cat = inferCategory(scheme.schemeName);
                return (
                  <button
                    key={scheme.schemeCode}
                    onClick={() => setSelectedScheme(scheme)}
                    className="w-full text-left bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100 hover:border-indigo-200"
                  >
                    <div className="flex items-center gap-4">
                      {/* AMC Avatar */}
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: amc.color }}
                      >
                        {amc.short}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{scheme.schemeName}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">Code: {scheme.schemeCode}</span>
                          {scheme.isinGrowth && (
                            <span className="text-xs text-gray-500">ISIN: {scheme.isinGrowth}</span>
                          )}
                          <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{cat}</span>
                        </div>
                      </div>

                      <span className="text-indigo-600 text-sm font-medium shrink-0 hidden md:block">View Details →</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
