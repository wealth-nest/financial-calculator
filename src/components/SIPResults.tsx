import { TrendingUp, Wallet, DollarSign, PiggyBank, ArrowUpCircle } from 'lucide-react';
import { SIPCalculationResult } from '../types/sip';

interface SIPResultsProps {
  result: SIPCalculationResult;
}

export default function SIPResults({ result }: SIPResultsProps) {
  const showUpfront = result.upfrontInvestment > 0;
  const showTopups = result.totalTopups > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600">Total Invested</h3>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          ₹{result.totalInvested.toLocaleString('en-IN')}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600">Maturity Value</h3>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          ₹{result.maturityValue.toLocaleString('en-IN')}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-emerald-500">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600">Estimated Returns</h3>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          ₹{result.estimatedReturns.toLocaleString('en-IN')}
        </p>
      </div>

      {showUpfront && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PiggyBank className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Initial Investment</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{result.upfrontInvestment.toLocaleString('en-IN')}
          </p>
        </div>
      )}

      {showTopups && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ArrowUpCircle className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Top-ups</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{result.totalTopups.toLocaleString('en-IN')}
          </p>
        </div>
      )}
    </div>
  );
}
