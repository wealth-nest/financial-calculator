import { useState } from 'react';
import { Wallet, TrendingDown, Clock, PiggyBank, IndianRupee, CalendarCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EMICalculationResult } from '../types/emi';

interface EMIResultsProps {
  result: EMICalculationResult;
}

export default function EMIResults({ result }: EMIResultsProps) {
  const hasPrepayment = result.totalPrepayment > 0;
  const [showTable, setShowTable] = useState(false);

  // Prepare chart data — sample yearly for readability
  const chartData = result.monthlyData
    .filter((_, i) => i % 12 === 11 || i === result.monthlyData.length - 1)
    .map((item) => ({
      year: Math.ceil(item.month / 12),
      'Outstanding Balance': item.outstandingBalance,
      'Principal Paid': item.principal,
      'Interest Paid': item.interest,
    }));

  // Cumulative breakdown for pie-like summary
  const totalPrincipal = result.totalPayment - result.totalInterest;

  return (
    <>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <IndianRupee className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Monthly EMI</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{result.monthlyEMI.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-red-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Interest</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{result.totalInterest.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Payment</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{result.totalPayment.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Prepayment Savings */}
      {hasPrepayment && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <PiggyBank className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Interest Saved</h3>
            </div>
            <p className="text-3xl font-bold text-green-700">
              ₹{result.interestSaved.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-emerald-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CalendarCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Months Saved</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-700">
              {result.monthsSaved} months
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Loan closes in {Math.floor(result.actualTenureMonths / 12)}y {result.actualTenureMonths % 12}m instead of {Math.floor(result.originalTenureMonths / 12)}y
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Total Prepaid</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ₹{result.totalPrepayment.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      )}

      {/* Payment Breakdown Bar */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Breakdown</h3>
        <div className="flex rounded-full overflow-hidden h-6">
          <div
            className="bg-blue-500"
            style={{ width: `${(totalPrincipal / result.totalPayment) * 100}%` }}
            title={`Principal: ₹${totalPrincipal.toLocaleString('en-IN')}`}
          />
          <div
            className="bg-red-400"
            style={{ width: `${(result.totalInterest / result.totalPayment) * 100}%` }}
            title={`Interest: ₹${result.totalInterest.toLocaleString('en-IN')}`}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            Principal: ₹{totalPrincipal.toLocaleString('en-IN')} ({((totalPrincipal / result.totalPayment) * 100).toFixed(1)}%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
            Interest: ₹{result.totalInterest.toLocaleString('en-IN')} ({((result.totalInterest / result.totalPayment) * 100).toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Amortization Chart */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Balance Over Time (Yearly)</h3>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="year"
                label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                stroke="#666"
              />
              <YAxis
                stroke="#666"
                tickFormatter={(value) =>
                  value >= 100000
                    ? `₹${(value / 100000).toFixed(1)}L`
                    : `₹${(value / 1000).toFixed(0)}k`
                }
              />
              <Tooltip
                formatter={(value: number | undefined) => `₹${(value ?? 0).toLocaleString('en-IN')}`}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="Outstanding Balance"
                stroke="#f97316"
                fill="#fed7aa"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="mt-8">
        <button
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4 hover:text-indigo-600 transition-colors"
        >
          Monthly Amortization Schedule
          {showTable ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showTable && (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Month</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">EMI</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Principal</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Interest</th>
                  {hasPrepayment && (
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Prepayment</th>
                  )}
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Balance</th>
                </tr>
              </thead>
              <tbody>
                {result.monthlyData.map((row) => (
                  <tr
                    key={row.month}
                    className={`border-t border-gray-100 ${row.month % 12 === 0 ? 'bg-orange-50' : ''}`}
                  >
                    <td className="px-4 py-2 text-gray-700">
                      {row.month}
                      {row.month % 12 === 0 && (
                        <span className="ml-1 text-xs text-orange-600 font-medium">Yr {row.month / 12}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-900">₹{row.emi.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2 text-right text-blue-700">₹{row.principal.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2 text-right text-red-600">₹{row.interest.toLocaleString('en-IN')}</td>
                    {hasPrepayment && (
                      <td className="px-4 py-2 text-right text-green-700">
                        {row.prepayment > 0 ? `₹${row.prepayment.toLocaleString('en-IN')}` : '—'}
                      </td>
                    )}
                    <td className="px-4 py-2 text-right font-medium text-gray-900">
                      ₹{row.outstandingBalance.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
