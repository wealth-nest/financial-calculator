import { useState, useRef } from 'react';
import {
  Upload,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  FileText,
  BarChart3,
  Search,
  X,
  Download,
  Info,
  Lock,
  Loader2,
  User,
  CreditCard,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { getAmcInfo, inferCategory } from '../utils/fundHelpers';

// --- Types ---

interface Holding {
  id: string;
  schemeName: string;
  schemeCode?: number;
  units: number;
  investedValue: number;
  currentNav?: number;
  currentValue?: number;
  category?: string;
  xirr?: number;
  benchmarkReturn?: number;
  benchmarkName?: string;
  verdict?: 'outperformer' | 'underperformer' | 'par';
}

interface AnalysisResult {
  totalInvested: number;
  totalCurrent: number;
  totalGain: number;
  gainPercent: number;
  holdings: Holding[];
  outperformers: number;
  underperformers: number;
}

interface CASInfo {
  investorName: string | null;
  panNumber: string | null;
  statementDate: string | null;
}

type InputMode = 'cas' | 'csv' | 'manual';

// --- Benchmark CAGR approximations (when API unavailable) ---
const BENCHMARK_RETURNS: Record<string, { name: string; cagr3y: number }> = {
  'large cap': { name: 'Nifty 50', cagr3y: 14.5 },
  'mid cap': { name: 'Nifty Midcap 150', cagr3y: 18.2 },
  'small cap': { name: 'Nifty Smallcap 250', cagr3y: 20.1 },
  'flexi cap': { name: 'Nifty 500', cagr3y: 15.8 },
  'multi cap': { name: 'Nifty 500', cagr3y: 15.8 },
  'large & mid': { name: 'Nifty LargeMidcap 250', cagr3y: 16.5 },
  'elss': { name: 'Nifty 500', cagr3y: 15.8 },
  'focused': { name: 'Nifty 500', cagr3y: 15.8 },
  'value': { name: 'Nifty 500 Value 50', cagr3y: 17.0 },
  'contra': { name: 'Nifty 500', cagr3y: 15.8 },
  'dividend yield': { name: 'Nifty Dividend Opp 50', cagr3y: 16.0 },
  'sectoral': { name: 'Nifty 50', cagr3y: 14.5 },
  'thematic': { name: 'Nifty 50', cagr3y: 14.5 },
  'index': { name: 'Benchmark (Self)', cagr3y: 14.5 },
  'hybrid': { name: 'Nifty 50 Hybrid Composite', cagr3y: 11.0 },
  'balanced': { name: 'Nifty 50 Hybrid Composite', cagr3y: 11.0 },
  'arbitrage': { name: 'Nifty 50 Arbitrage', cagr3y: 6.5 },
  'debt': { name: 'CRISIL Composite Bond', cagr3y: 7.0 },
  'gilt': { name: 'CRISIL Gilt Index', cagr3y: 6.5 },
  'liquid': { name: 'CRISIL Liquid Fund', cagr3y: 6.0 },
  'bond': { name: 'CRISIL Composite Bond', cagr3y: 7.0 },
  'credit': { name: 'CRISIL Composite Bond', cagr3y: 7.0 },
};

function getBenchmarkForScheme(schemeName: string): { name: string; cagr3y: number } {
  const nameLower = schemeName.toLowerCase();
  for (const [keyword, benchmark] of Object.entries(BENCHMARK_RETURNS)) {
    if (nameLower.includes(keyword)) {
      return benchmark;
    }
  }
  return { name: 'Nifty 50', cagr3y: 14.5 };
}

function parseCSV(text: string): Holding[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const hasSchemeCode = header.includes('code');

  const holdings: Holding[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length < 3) continue;

    let idx = 0;
    const schemeCode = hasSchemeCode ? parseInt(cols[idx++]) || undefined : undefined;
    const schemeName = cols[idx++];
    const units = parseFloat(cols[idx++]) || 0;
    const investedValue = parseFloat(cols[idx++]) || 0;

    if (schemeName && (units > 0 || investedValue > 0)) {
      holdings.push({
        id: Date.now().toString() + i,
        schemeName,
        schemeCode,
        units,
        investedValue,
      });
    }
  }
  return holdings;
}

// --- Component ---

export default function PortfolioAnalyzer() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHolding, setNewHolding] = useState({ schemeName: '', units: '', investedValue: '' });
  const [inputMode, setInputMode] = useState<InputMode>('cas');

  // CAS upload state
  const [casUploading, setCasUploading] = useState(false);
  const [casError, setCasError] = useState<string | null>(null);
  const [casPassword, setCasPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [casFile, setCasFile] = useState<File | null>(null);
  const [casInfo, setCasInfo] = useState<CASInfo | null>(null);
  const [casWarning, setCasWarning] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const casInputRef = useRef<HTMLInputElement>(null);

  // --- CAS Upload ---
  const handleCASFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCasFile(file);
    setCasError(null);
    setCasWarning(null);
    setNeedsPassword(false);
    setCasPassword('');
    // Try uploading without password first
    uploadCAS(file, '');
  };

  const uploadCAS = async (file: File, password: string) => {
    setCasUploading(true);
    setCasError(null);
    setCasWarning(null);

    try {
      const formData = new FormData();
      formData.append('casFile', file);
      if (password) {
        formData.append('password', password);
      }

      const res = await fetch('http://localhost:3001/api/parse-cas', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needsPassword) {
          setNeedsPassword(true);
          setCasError(null);
        } else {
          setCasError(data.error || 'Failed to parse CAS');
        }
        setCasUploading(false);
        return;
      }

      if (data.warning) {
        setCasWarning(data.warning);
      }

      // Set investor info
      if (data.investorName || data.panNumber || data.statementDate) {
        setCasInfo({
          investorName: data.investorName,
          panNumber: data.panNumber,
          statementDate: data.statementDate,
        });
      }

      // Convert parsed holdings to our format
      if (data.holdings && data.holdings.length > 0) {
        const newHoldings: Holding[] = data.holdings.map((h: {
          schemeName: string;
          units: number;
          currentValue: number;
          investedValue: number;
          currentNav?: number;
        }, i: number) => ({
          id: 'cas_' + Date.now().toString() + i,
          schemeName: h.schemeName,
          units: h.units || 0,
          investedValue: h.investedValue || h.currentValue || 0,
          currentNav: h.currentNav,
          currentValue: h.currentValue || undefined,
        }));
        setHoldings((prev) => [...prev, ...newHoldings]);
        setAnalysis(null);
        setNeedsPassword(false);
      }
    } catch (err) {
      setCasError(err instanceof Error ? err.message : 'Failed to upload CAS');
    } finally {
      setCasUploading(false);
    }
  };

  const handleCASPasswordSubmit = () => {
    if (casFile && casPassword) {
      uploadCAS(casFile, casPassword);
    }
  };

  // --- Manual & CSV ---
  const addHolding = () => {
    if (!newHolding.schemeName || !newHolding.investedValue) return;
    setHoldings([
      ...holdings,
      {
        id: Date.now().toString(),
        schemeName: newHolding.schemeName.trim(),
        units: parseFloat(newHolding.units) || 0,
        investedValue: parseFloat(newHolding.investedValue) || 0,
      },
    ]);
    setNewHolding({ schemeName: '', units: '', investedValue: '' });
    setShowAddForm(false);
    setAnalysis(null);
  };

  const removeHolding = (id: string) => {
    setHoldings(holdings.filter((h) => h.id !== id));
    setAnalysis(null);
  };

  const clearAll = () => {
    setHoldings([]);
    setAnalysis(null);
    setCasInfo(null);
    setCasWarning(null);
    setCasError(null);
    setCasFile(null);
    setNeedsPassword(false);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length > 0) {
        setHoldings((prev) => [...prev, ...parsed]);
        setAnalysis(null);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const analyzePortfolio = async () => {
    if (holdings.length === 0) return;
    setAnalyzing(true);

    const analyzed: Holding[] = await Promise.all(
      holdings.map(async (h) => {
        const category = inferCategory(h.schemeName);
        const benchmark = getBenchmarkForScheme(h.schemeName);
        let currentNav = h.currentNav;
        let currentValue = h.currentValue;

        // Try fetching current NAV if we have a scheme code
        if (h.schemeCode && !currentValue) {
          try {
            const res = await fetch(`http://localhost:3001/api/mutual-funds/${h.schemeCode}`);
            if (res.ok) {
              const data = await res.json();
              if (data.data && data.data.length > 0) {
                currentNav = parseFloat(data.data[0].nav);
                currentValue = h.units * currentNav;
              }
            }
          } catch {
            // API unavailable
          }
        }

        // If still no current value, use CAS value or estimate
        if (!currentValue) {
          if (h.currentValue && h.currentValue > 0) {
            currentValue = h.currentValue;
          } else {
            currentValue = h.investedValue * 1.12;
          }
          if (!currentNav && h.units > 0) {
            currentNav = currentValue / h.units;
          }
        }

        const approxCAGR = h.investedValue > 0
          ? (Math.pow(currentValue / h.investedValue, 1 / 3) - 1) * 100
          : 0;

        let verdict: 'outperformer' | 'underperformer' | 'par' = 'par';
        if (approxCAGR > benchmark.cagr3y + 1) verdict = 'outperformer';
        else if (approxCAGR < benchmark.cagr3y - 1) verdict = 'underperformer';

        return {
          ...h,
          category,
          currentNav,
          currentValue,
          xirr: approxCAGR,
          benchmarkReturn: benchmark.cagr3y,
          benchmarkName: benchmark.name,
          verdict,
        };
      })
    );

    const totalInvested = analyzed.reduce((s, h) => s + h.investedValue, 0);
    const totalCurrent = analyzed.reduce((s, h) => s + (h.currentValue || h.investedValue), 0);

    setAnalysis({
      totalInvested,
      totalCurrent,
      totalGain: totalCurrent - totalInvested,
      gainPercent: totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested) * 100 : 0,
      holdings: analyzed,
      outperformers: analyzed.filter((h) => h.verdict === 'outperformer').length,
      underperformers: analyzed.filter((h) => h.verdict === 'underperformer').length,
    });

    setHoldings(analyzed);
    setAnalyzing(false);
  };

  const downloadSampleCSV = () => {
    const csv = `Scheme Name,Units,Invested Value
SBI Blue Chip Fund - Direct Plan - Growth,150.25,75000
HDFC Mid-Cap Opportunities Fund - Direct Plan - Growth,200.50,100000
Axis Small Cap Fund - Direct Plan - Growth,500.00,50000
Mirae Asset Large Cap Fund - Direct Plan - Growth,300.00,120000
Parag Parikh Flexi Cap Fund - Direct Plan - Growth,180.75,90000`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_portfolio.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartData = analysis
    ? analysis.holdings.map((h) => ({
        name: getAmcInfo(h.schemeName).short + ' ' + (h.schemeName.split(' ').slice(1, 3).join(' ')).slice(0, 15),
        'Your Return': parseFloat((h.xirr || 0).toFixed(1)),
        Benchmark: h.benchmarkReturn || 0,
      }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-600 rounded-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Portfolio Analyzer</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Upload your CAS statement or add holdings manually to compare performance against benchmarks
          </p>
        </div>

        {/* Input Mode Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setInputMode('cas')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                inputMode === 'cas'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              CAS Statement (PDF)
            </button>
            <button
              onClick={() => setInputMode('csv')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                inputMode === 'csv'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              CSV Upload
            </button>
            <button
              onClick={() => setInputMode('manual')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                inputMode === 'manual'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              Manual Entry
            </button>
          </div>

          {/* === CAS Upload Mode === */}
          {inputMode === 'cas' && (
            <div className="space-y-4">
              <div className="p-5 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">Upload your Consolidated Account Statement (CAS)</p>
                    <ul className="list-disc list-inside space-y-0.5 text-amber-700">
                      <li>Download CAS from <strong>myCAMS</strong> (camsonline.com) or <strong>KFintech</strong> (kfintech.com)</li>
                      <li>You can also get it from <strong>MFCentral</strong> (mfcentral.com)</li>
                      <li>CAS is usually password-protected: <strong>PAN (first 5 chars uppercase) + DOB (DDMMYYYY)</strong></li>
                      <li>Example: If PAN is ABCDE1234F and DOB is 15-Jan-1990, password is <code className="bg-amber-100 px-1 rounded">ABCDE15011990</code></li>
                      <li>Your data is processed locally on the server and never shared with third parties</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Upload Area */}
              {!needsPassword && (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-all"
                  onClick={() => casInputRef.current?.click()}
                >
                  {casUploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                      <p className="text-gray-600 font-medium">Parsing your CAS statement...</p>
                      <p className="text-sm text-gray-400">This may take a few seconds</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-700 font-semibold mb-1">
                        {casFile ? casFile.name : 'Click to upload your CAS PDF'}
                      </p>
                      <p className="text-sm text-gray-400">Supports CAMS, KFintech, and MFCentral CAS formats</p>
                    </>
                  )}
                  <input
                    ref={casInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleCASFileSelect}
                    className="hidden"
                  />
                </div>
              )}

              {/* Password Entry */}
              {needsPassword && (
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-800">Password Required</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    This CAS PDF is password-protected. Enter the password to continue.
                    <br />
                    Usually it is: <strong>PAN (first 5 chars) + DOB (DDMMYYYY)</strong>
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="password"
                      value={casPassword}
                      onChange={(e) => setCasPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCASPasswordSubmit()}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                      placeholder="e.g. ABCDE15011990"
                    />
                    <button
                      onClick={handleCASPasswordSubmit}
                      disabled={!casPassword || casUploading}
                      className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
                    >
                      {casUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                      Unlock & Parse
                    </button>
                  </div>
                </div>
              )}

              {/* CAS Error */}
              {casError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {casError}
                </div>
              )}

              {/* CAS Warning */}
              {casWarning && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                  {casWarning}
                </div>
              )}

              {/* Investor Info from CAS */}
              {casInfo && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">CAS Parsed Successfully</span>
                  </div>
                  {casInfo.investorName && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{casInfo.investorName}</span>
                    </div>
                  )}
                  {casInfo.panNumber && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CreditCard className="w-4 h-4" />
                      <span>PAN: {casInfo.panNumber.slice(0, 3)}****{casInfo.panNumber.slice(-1)}</span>
                    </div>
                  )}
                  {casInfo.statementDate && (
                    <span className="text-sm text-gray-500">as on {casInfo.statementDate}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* === CSV Upload Mode === */}
          {inputMode === 'csv' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">CSV Format:</p>
                  <p className="text-blue-600">
                    Columns: <code className="bg-blue-100 px-1 rounded">Scheme Name, Units, Invested Value</code>
                    {' '}(optionally prepend a <code className="bg-blue-100 px-1 rounded">Scheme Code</code> column)
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all text-sm font-medium text-gray-600">
                  <Upload className="w-5 h-5" />
                  Click to upload CSV file
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCSVUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={downloadSampleCSV}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Sample
                </button>
              </div>
            </div>
          )}

          {/* === Manual Entry Mode === */}
          {inputMode === 'manual' && (
            <div>
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add a Mutual Fund Holding
                </button>
              ) : (
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Add Mutual Fund Holding</h3>
                    <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Scheme Name *</label>
                      <input
                        type="text"
                        value={newHolding.schemeName}
                        onChange={(e) => setNewHolding({ ...newHolding, schemeName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                        placeholder="e.g. SBI Blue Chip Fund - Direct Plan - Growth"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                      <input
                        type="number"
                        value={newHolding.units}
                        onChange={(e) => setNewHolding({ ...newHolding, units: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                        placeholder="150.25"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount Invested (Rs) *</label>
                      <input
                        type="number"
                        value={newHolding.investedValue}
                        onChange={(e) => setNewHolding({ ...newHolding, investedValue: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                        placeholder="75000"
                        min="0"
                      />
                    </div>
                  </div>
                  <button
                    onClick={addHolding}
                    disabled={!newHolding.schemeName || !newHolding.investedValue}
                    className="mt-4 px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 font-medium"
                  >
                    Add to Portfolio
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Holdings Table */}
          {holdings.length > 0 && (
            <>
              <div className="flex items-center justify-between mt-8 mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Holdings ({holdings.length} funds)
                </h2>
                <div className="flex gap-2">
                  {inputMode !== 'manual' && (
                    <button
                      onClick={() => { setShowAddForm(true); setInputMode('manual'); }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add More
                    </button>
                  )}
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear All
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Fund</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Units</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Invested</th>
                      {analysis && (
                        <>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">Current Value</th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">Your CAGR</th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">Benchmark</th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-700">Verdict</th>
                        </>
                      )}
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h) => {
                      const amc = getAmcInfo(h.schemeName);
                      return (
                        <tr key={h.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                style={{ backgroundColor: amc.color }}
                              >
                                {amc.short.slice(0, 2)}
                              </div>
                              <div>
                                <p className="text-gray-900 font-medium text-xs leading-tight">
                                  {h.schemeName.length > 50 ? h.schemeName.slice(0, 50) + '...' : h.schemeName}
                                </p>
                                {h.category && h.category !== 'Other' && (
                                  <span className="text-xs text-gray-400">{h.category}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700">{h.units > 0 ? h.units.toFixed(2) : '—'}</td>
                          <td className="px-4 py-3 text-right text-gray-900">Rs {h.investedValue.toLocaleString('en-IN')}</td>
                          {analysis && (
                            <>
                              <td className="px-4 py-3 text-right font-medium text-gray-900">
                                Rs {(h.currentValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                              </td>
                              <td className={`px-4 py-3 text-right font-semibold ${(h.xirr || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {(h.xirr || 0).toFixed(1)}%
                              </td>
                              <td className="px-4 py-3 text-right text-gray-600">
                                {h.benchmarkReturn?.toFixed(1)}%
                                <div className="text-xs text-gray-400">{h.benchmarkName}</div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {h.verdict === 'outperformer' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                                    <TrendingUp className="w-3 h-3" /> Outperformer
                                  </span>
                                )}
                                {h.verdict === 'underperformer' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                                    <TrendingDown className="w-3 h-3" /> Underperformer
                                  </span>
                                )}
                                {h.verdict === 'par' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium">
                                    <CheckCircle className="w-3 h-3" /> At Par
                                  </span>
                                )}
                              </td>
                            </>
                          )}
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => removeHolding(h.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button
                onClick={analyzePortfolio}
                disabled={analyzing}
                className="mt-6 w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold py-4 rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {analyzing ? 'Analyzing Portfolio...' : 'Analyze & Compare with Benchmarks'}
              </button>
            </>
          )}

          {holdings.length === 0 && inputMode !== 'cas' && (
            <div className="text-center py-16 text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No holdings added yet</p>
              <p className="text-sm mt-1">
                {inputMode === 'csv'
                  ? 'Upload a CSV file to import your holdings'
                  : 'Click "Add a Mutual Fund Holding" to get started'}
              </p>
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {analysis && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <p className="text-sm text-gray-500 mb-1">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">Rs {analysis.totalInvested.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <p className="text-sm text-gray-500 mb-1">Current Value</p>
                <p className="text-2xl font-bold text-green-600">Rs {analysis.totalCurrent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <p className="text-sm text-gray-500 mb-1">Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${analysis.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analysis.totalGain >= 0 ? '+' : ''}Rs {analysis.totalGain.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
                <p className={`text-sm ${analysis.gainPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {analysis.gainPercent >= 0 ? '+' : ''}{analysis.gainPercent.toFixed(1)}%
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <p className="text-sm text-gray-500 mb-1">Portfolio Health</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-bold">{analysis.outperformers}</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-600">
                    <TrendingDown className="w-4 h-4" />
                    <span className="font-bold">{analysis.underperformers}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">vs benchmark</p>
              </div>
            </div>

            {/* Benchmark Comparison Chart */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                  Performance vs Benchmark
                </h2>
                <p className="text-sm text-gray-500 mb-6">Approximate 3-Year CAGR comparison</p>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <XAxis type="number" tickFormatter={(v) => `${v}%`} />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value: number | undefined) => `${(value ?? 0).toFixed(1)}%`} />
                      <Legend />
                      <Bar dataKey="Your Return" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={entry['Your Return'] >= entry.Benchmark ? '#16a34a' : '#dc2626'}
                          />
                        ))}
                      </Bar>
                      <Bar dataKey="Benchmark" fill="#94a3b8" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.underperformers > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Recommendations
                </h2>
                <div className="space-y-4">
                  {analysis.holdings
                    .filter((h) => h.verdict === 'underperformer')
                    .map((h) => (
                      <div key={h.id} className="p-4 bg-red-50 rounded-xl border border-red-100">
                        <div className="flex items-start gap-3">
                          <TrendingDown className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{h.schemeName}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              This fund returned <span className="font-semibold text-red-600">{(h.xirr || 0).toFixed(1)}%</span> CAGR
                              while its benchmark ({h.benchmarkName}) returned{' '}
                              <span className="font-semibold text-gray-900">{h.benchmarkReturn?.toFixed(1)}%</span>.
                              Consider switching to a better performing fund in the same category or an index fund tracking {h.benchmarkName}.
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-sm text-blue-700">
                      <strong>Want personalized advice?</strong> Contact Nandalal for a free portfolio review and get
                      recommendations tailored to your goals and risk profile.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-4 bg-gray-100 rounded-xl text-xs text-gray-500 text-center">
              <p>
                Note: Without live NAV data, current values are estimated. For accurate analysis, ensure the backend API
                is running. Benchmark returns are approximate historical averages. Past performance does not guarantee
                future results. CAS parsing accuracy depends on the statement format.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
