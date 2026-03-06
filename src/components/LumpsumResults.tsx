import { TrendingUp, Wallet, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LumpsumCalculationResult } from '../types/lumpsum';

interface LumpsumResultsProps {
  result: LumpsumCalculationResult;
}

export default function LumpsumResults({ result }: LumpsumResultsProps) {
  const chartData = [
    {
      name: 'Invested',
      amount: result.investedAmount,
    },
    {
      name: 'Maturity Value',
      amount: result.maturityValue,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wallet className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Invested</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{result.investedAmount.toLocaleString('en-IN')}
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
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Invested vs Maturity</h3>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis
                stroke="#666"
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="amount" name="Amount" fill="#8b5cf6" radius={[8, 8, 0, 0]} barSize={80} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
