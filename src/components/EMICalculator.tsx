import { useState } from 'react';
import { Banknote } from 'lucide-react';
import { calculateEMI } from '../services/emiService';
import { EMICalculationResult } from '../types/emi';
import EMIResults from './EMIResults';

type PrepaymentType = 'none' | 'fixed' | 'percentage' | 'additional_emi';

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState('2500000');
  const [interestRate, setInterestRate] = useState('8.5');
  const [tenureYears, setTenureYears] = useState('20');
  const [prepaymentType, setPrepaymentType] = useState<PrepaymentType>('none');
  const [prepaymentValue, setPrepaymentValue] = useState('0');
  const [result, setResult] = useState<EMICalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    setError(null);
    try {
      const res = calculateEMI({
        loanAmount: parseFloat(loanAmount),
        annualInterestRate: parseFloat(interestRate),
        tenureYears: parseFloat(tenureYears),
        prepaymentType,
        prepaymentValue: parseFloat(prepaymentValue) || 0,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResult(null);
    }
  };

  const prepaymentLabel = (): string => {
    switch (prepaymentType) {
      case 'fixed': return 'Annual Prepayment Amount (₹)';
      case 'percentage': return 'Annual Prepayment (% of Outstanding)';
      case 'additional_emi': return 'Additional EMIs Per Year';
      default: return '';
    }
  };

  const prepaymentHint = (): string => {
    switch (prepaymentType) {
      case 'fixed': return 'This fixed amount will be paid extra every year towards the principal';
      case 'percentage': return 'This percentage of outstanding loan balance will be prepaid every year';
      case 'additional_emi': return 'Number of extra EMIs paid every year (e.g. 1 = one extra EMI per year)';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-600 rounded-xl">
              <Banknote className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">EMI Calculator</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Calculate your loan EMI and see how prepayments can save you interest
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Loan Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label htmlFor="loanAmount" className="block text-sm font-semibold text-gray-700 mb-2">
                Loan Amount (₹)
              </label>
              <input
                id="loanAmount"
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="2500000"
                min="1"
              />
            </div>

            <div>
              <label htmlFor="interestRate" className="block text-sm font-semibold text-gray-700 mb-2">
                Annual Interest Rate (%)
              </label>
              <input
                id="interestRate"
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="8.5"
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label htmlFor="tenureYears" className="block text-sm font-semibold text-gray-700 mb-2">
                Loan Tenure (Years)
              </label>
              <input
                id="tenureYears"
                type="number"
                value={tenureYears}
                onChange={(e) => setTenureYears(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="20"
                min="1"
              />
            </div>
          </div>

          {/* Prepayment Section */}
          <div className="mb-8 p-5 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Prepayment Option
            </label>
            <div className="flex flex-wrap gap-3 mb-4">
              {([
                { key: 'none', label: 'No Prepayment' },
                { key: 'fixed', label: 'Fixed Amount (₹)' },
                { key: 'percentage', label: 'Percentage (%)' },
                { key: 'additional_emi', label: 'Additional EMI' },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setPrepaymentType(opt.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    prepaymentType === opt.key
                      ? 'bg-orange-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {prepaymentType !== 'none' && (
              <div>
                <label htmlFor="prepaymentValue" className="block text-sm font-medium text-gray-600 mb-2">
                  {prepaymentLabel()}
                </label>
                <input
                  id="prepaymentValue"
                  type="number"
                  value={prepaymentValue}
                  onChange={(e) => setPrepaymentValue(e.target.value)}
                  className="w-full md:w-1/2 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  placeholder={prepaymentType === 'additional_emi' ? '1' : prepaymentType === 'percentage' ? '5' : '50000'}
                  min="0"
                  step={prepaymentType === 'percentage' ? '0.1' : '1'}
                />
                <p className="text-xs text-gray-500 mt-1">{prepaymentHint()}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleCalculate}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white font-semibold py-4 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg hover:shadow-xl"
          >
            Calculate EMI
          </button>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Loan Summary</h2>
            <EMIResults result={result} />
          </div>
        )}
      </div>
    </div>
  );
}
