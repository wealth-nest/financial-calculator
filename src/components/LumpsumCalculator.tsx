import { useState } from 'react';
import { Landmark } from 'lucide-react';
import { calculateLumpsum } from '../services/lumpsumService';
import { LumpsumCalculationResult } from '../types/lumpsum';
import LumpsumResults from './LumpsumResults';

export default function LumpsumCalculator() {
  const [investmentAmount, setInvestmentAmount] = useState<string>('100000');
  const [annualReturnRate, setAnnualReturnRate] = useState<string>('12');
  const [years, setYears] = useState<string>('10');
  const [result, setResult] = useState<LumpsumCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setError(null);
    setLoading(true);

    try {
      const calculationResult = await calculateLumpsum({
        investmentAmount: parseFloat(investmentAmount),
        annualReturnRate: parseFloat(annualReturnRate),
        years: parseFloat(years),
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-600 rounded-xl">
              <Landmark className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Lumpsum Calculator</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Calculate returns on your one-time lumpsum investment
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label htmlFor="investmentAmount" className="block text-sm font-semibold text-gray-700 mb-2">
                Investment Amount (₹)
              </label>
              <input
                id="investmentAmount"
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="100000"
                min="1"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="10"
                min="1"
              />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
            <LumpsumResults result={result} />
          </div>
        )}
      </div>
    </div>
  );
}
