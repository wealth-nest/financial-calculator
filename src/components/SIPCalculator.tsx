import { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { calculateSIP } from '../services/sipService';
import { SIPCalculationResult } from '../types/sip';
import SIPResults from './SIPResults';
import SIPChart from './SIPChart';

export default function SIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState<string>('5000');
  const [annualReturnRate, setAnnualReturnRate] = useState<string>('12');
  const [years, setYears] = useState<string>('10');
  const [upfrontInvestment, setUpfrontInvestment] = useState<string>('0');
  const [topupType, setTopupType] = useState<'none' | 'annual' | 'percentage'>('none');
  const [topupAmount, setTopupAmount] = useState<string>('0');
  const [topupPercentage, setTopupPercentage] = useState<string>('0');
  const [result, setResult] = useState<SIPCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  const handleCalculate = async () => {
    setError(null);
    setLoading(true);

    try {
      const calculationResult = await calculateSIP({
        monthlyInvestment: parseFloat(monthlyInvestment),
        annualReturnRate: parseFloat(annualReturnRate),
        years: parseFloat(years),
        upfrontInvestment: parseFloat(upfrontInvestment) || 0,
        topupAmount: topupType === 'annual' ? parseFloat(topupAmount) || 0 : 0,
        topupFrequency: topupType,
        topupPercentage: topupType === 'percentage' ? parseFloat(topupPercentage) || 0 : 0,
      });
      setResult(calculationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">SIP Calculator</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Calculate your Systematic Investment Plan returns and visualize growth over time
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="monthlyInvestment" className="block text-sm font-semibold text-gray-700 mb-2">
                Monthly Investment (₹)
              </label>
              <input
                id="monthlyInvestment"
                type="number"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="5000"
                min="100"
              />
            </div>

            <div>
              <label htmlFor="upfrontInvestment" className="block text-sm font-semibold text-gray-700 mb-2">
                Initial Investment (₹)
              </label>
              <input
                id="upfrontInvestment"
                type="number"
                value={upfrontInvestment}
                onChange={(e) => setUpfrontInvestment(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label htmlFor="annualReturnRate" className="block text-sm font-semibold text-gray-700 mb-2">
                Expected Annual Return (%)
              </label>
              <input
                id="annualReturnRate"
                type="number"
                value={annualReturnRate}
                onChange={(e) => setAnnualReturnRate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="12"
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label htmlFor="years" className="block text-sm font-semibold text-gray-700 mb-2">
                Investment Duration (Years)
              </label>
              <input
                id="years"
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="10"
                min="1"
              />
            </div>
          </div>

          {/* Step-up SIP Section */}
          <div className="mb-8 p-5 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Annual Step-up (Top-up SIP)
            </label>
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                type="button"
                onClick={() => setTopupType('none')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  topupType === 'none'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                No Top-up
              </button>
              <button
                type="button"
                onClick={() => setTopupType('annual')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  topupType === 'annual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Fixed Amount (₹)
              </button>
              <button
                type="button"
                onClick={() => setTopupType('percentage')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  topupType === 'percentage'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Percentage (%)
              </button>
            </div>

            {topupType === 'annual' && (
              <div>
                <label htmlFor="topupAmount" className="block text-sm font-medium text-gray-600 mb-2">
                  Yearly Step-up Amount (₹)
                </label>
                <input
                  id="topupAmount"
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  className="w-full md:w-1/2 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="1000"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Your monthly SIP increases by this amount every year</p>
              </div>
            )}

            {topupType === 'percentage' && (
              <div>
                <label htmlFor="topupPercentage" className="block text-sm font-medium text-gray-600 mb-2">
                  Yearly Step-up Percentage (%)
                </label>
                <input
                  id="topupPercentage"
                  type="number"
                  value={topupPercentage}
                  onChange={(e) => setTopupPercentage(e.target.value)}
                  className="w-full md:w-1/2 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="10"
                  min="0"
                  step="0.1"
                />
                <p className="text-xs text-gray-500 mt-1">Your monthly SIP increases by this percentage every year</p>
              </div>
            )}
          </div>

          <button
            onClick={handleCalculate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Calculating...' : 'Calculate Returns'}
          </button>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Investment Summary</h2>
            <SIPResults result={result} />
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Growth Over Time</h3>
              <SIPChart data={result.monthlyData} />
            </div>

            {/* Monthly Breakdown Table */}
            <div className="mt-8">
              <button
                onClick={() => setShowTable(!showTable)}
                className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4 hover:text-blue-600 transition-colors"
              >
                Monthly Breakdown
                {showTable ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {showTable && (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Month</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Invested</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Value</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Returns</th>
                        {result.totalTopups > 0 && (
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">Top-up</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {result.monthlyData.map((row) => (
                        <tr
                          key={row.month}
                          className={`border-t border-gray-100 ${row.month % 12 === 0 ? 'bg-blue-50' : ''}`}
                        >
                          <td className="px-4 py-2 text-gray-700">
                            {row.month}
                            {row.month % 12 === 0 && (
                              <span className="ml-1 text-xs text-blue-600 font-medium">Yr {row.month / 12}</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right text-gray-900">₹{row.invested.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-2 text-right text-green-700">₹{row.value.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-2 text-right text-emerald-600">
                            ₹{Math.round(row.value - row.invested).toLocaleString('en-IN')}
                          </td>
                          {result.totalTopups > 0 && (
                            <td className="px-4 py-2 text-right text-orange-600">
                              {row.topupApplied > 0 ? `₹${row.topupApplied.toLocaleString('en-IN')}` : '—'}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
