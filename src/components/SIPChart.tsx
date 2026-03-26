import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonthlyData } from '../types/sip';

interface SIPChartProps {
  data: MonthlyData[];
}

export default function SIPChart({ data }: SIPChartProps) {
  const chartData = data.map((item, index) => ({
    year: ((index + 1) / 12).toFixed(1),
    'Total Invested': item.invested,
    'Maturity Value': item.value,
  }));

  const sampledData = chartData.filter((_, index) => index % 6 === 0 || index === chartData.length - 1);

  return (
    <div className="w-full h-80 mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sampledData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="year"
            label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
            stroke="#666"
          />
          <YAxis
            label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }}
            stroke="#666"
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value: number | undefined) => `₹${(value ?? 0).toLocaleString('en-IN')}`}
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="Total Invested"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Maturity Value"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
