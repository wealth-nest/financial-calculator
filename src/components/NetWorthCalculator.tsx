import { useState } from 'react';
import {
  Wallet,
  Home as HomeIcon,
  Car,
  Landmark,
  PiggyBank,
  TrendingUp,
  CreditCard,
  GraduationCap,
  Globe,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  BarChart3,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface AssetCategory {
  key: string;
  label: string;
  icon: typeof Wallet;
  color: string;
  items: { key: string; label: string; placeholder: string }[];
}

interface LiabilityCategory {
  key: string;
  label: string;
  icon: typeof CreditCard;
  color: string;
  items: { key: string; label: string; placeholder: string }[];
}

const ASSET_CATEGORIES: AssetCategory[] = [
  {
    key: 'bank',
    label: 'Bank & Cash',
    icon: Landmark,
    color: '#3b82f6',
    items: [
      { key: 'savings', label: 'Savings Account', placeholder: '0' },
      { key: 'fd', label: 'Fixed Deposits (FD)', placeholder: '0' },
      { key: 'rd', label: 'Recurring Deposits (RD)', placeholder: '0' },
      { key: 'cash', label: 'Cash in Hand', placeholder: '0' },
    ],
  },
  {
    key: 'investments',
    label: 'Investments',
    icon: TrendingUp,
    color: '#10b981',
    items: [
      { key: 'mutual_funds', label: 'Mutual Funds', placeholder: '0' },
      { key: 'stocks', label: 'Stocks / Equity', placeholder: '0' },
      { key: 'ppf', label: 'PPF', placeholder: '0' },
      { key: 'epf', label: 'EPF / VPF', placeholder: '0' },
      { key: 'nps', label: 'NPS', placeholder: '0' },
      { key: 'bonds', label: 'Bonds / Debentures', placeholder: '0' },
      { key: 'ssy', label: 'Sukanya Samriddhi (SSY)', placeholder: '0' },
      { key: 'post_office', label: 'Post Office Savings (NSC/KVP)', placeholder: '0' },
    ],
  },
  {
    key: 'property',
    label: 'Real Estate',
    icon: HomeIcon,
    color: '#f59e0b',
    items: [
      { key: 'primary_home', label: 'Primary Residence', placeholder: '0' },
      { key: 'other_property', label: 'Other Properties', placeholder: '0' },
      { key: 'land', label: 'Land / Plots', placeholder: '0' },
      { key: 'commercial', label: 'Commercial Property', placeholder: '0' },
    ],
  },
  {
    key: 'precious',
    label: 'Gold & Precious Metals',
    icon: IndianRupee,
    color: '#eab308',
    items: [
      { key: 'physical_gold', label: 'Physical Gold / Jewellery', placeholder: '0' },
      { key: 'digital_gold', label: 'Digital Gold / SGB', placeholder: '0' },
      { key: 'silver', label: 'Silver', placeholder: '0' },
    ],
  },
  {
    key: 'insurance',
    label: 'Insurance & Retirement',
    icon: PiggyBank,
    color: '#8b5cf6',
    items: [
      { key: 'lic', label: 'LIC / Endowment Policies', placeholder: '0' },
      { key: 'ulip', label: 'ULIPs', placeholder: '0' },
      { key: 'pension', label: 'Pension / Annuity', placeholder: '0' },
      { key: 'gratuity', label: 'Gratuity (estimated)', placeholder: '0' },
    ],
  },
  {
    key: 'vehicles',
    label: 'Vehicles & Others',
    icon: Car,
    color: '#6366f1',
    items: [
      { key: 'car', label: 'Car(s)', placeholder: '0' },
      { key: 'two_wheeler', label: 'Two Wheeler(s)', placeholder: '0' },
      { key: 'crypto', label: 'Cryptocurrency', placeholder: '0' },
      { key: 'other_assets', label: 'Other Assets', placeholder: '0' },
    ],
  },
];

const NRI_ASSET_CATEGORY: AssetCategory = {
  key: 'nri_assets',
  label: 'Foreign / NRI Assets',
  icon: Globe,
  color: '#0ea5e9',
  items: [
    { key: 'foreign_bank', label: 'Foreign Bank Accounts', placeholder: '0' },
    { key: 'foreign_401k', label: '401(k) / IRA / Superannuation', placeholder: '0' },
    { key: 'foreign_stocks', label: 'Foreign Stocks / ETFs', placeholder: '0' },
    { key: 'foreign_property', label: 'Foreign Real Estate', placeholder: '0' },
    { key: 'nre_nro', label: 'NRE / NRO Accounts (India)', placeholder: '0' },
    { key: 'fcnr', label: 'FCNR Deposits', placeholder: '0' },
    { key: 'foreign_other', label: 'Other Foreign Assets', placeholder: '0' },
  ],
};

const LIABILITY_CATEGORIES: LiabilityCategory[] = [
  {
    key: 'loans',
    label: 'Loans',
    icon: CreditCard,
    color: '#ef4444',
    items: [
      { key: 'home_loan', label: 'Home Loan (Outstanding)', placeholder: '0' },
      { key: 'car_loan', label: 'Car / Vehicle Loan', placeholder: '0' },
      { key: 'personal_loan', label: 'Personal Loan', placeholder: '0' },
      { key: 'education_loan', label: 'Education Loan', placeholder: '0' },
      { key: 'gold_loan', label: 'Gold Loan', placeholder: '0' },
      { key: 'credit_card', label: 'Credit Card Outstanding', placeholder: '0' },
      { key: 'other_loans', label: 'Other Loans / EMIs', placeholder: '0' },
    ],
  },
];

const NRI_LIABILITY_CATEGORY: LiabilityCategory = {
  key: 'nri_liabilities',
  label: 'Foreign Liabilities',
  icon: Globe,
  color: '#f97316',
  items: [
    { key: 'foreign_mortgage', label: 'Foreign Mortgage', placeholder: '0' },
    { key: 'foreign_student_loan', label: 'Foreign Student Loan', placeholder: '0' },
    { key: 'foreign_car_loan', label: 'Foreign Car Loan', placeholder: '0' },
    { key: 'foreign_credit', label: 'Foreign Credit Card Debt', placeholder: '0' },
    { key: 'foreign_other_loan', label: 'Other Foreign Liabilities', placeholder: '0' },
  ],
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#eab308', '#8b5cf6', '#6366f1', '#0ea5e9'];

export default function NetWorthCalculator() {
  const [isNRI, setIsNRI] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    bank: true,
    investments: true,
  });
  const [calculated, setCalculated] = useState(false);

  const assetCategories = isNRI ? [...ASSET_CATEGORIES, NRI_ASSET_CATEGORY] : ASSET_CATEGORIES;
  const liabilityCategories = isNRI ? [...LIABILITY_CATEGORIES, NRI_LIABILITY_CATEGORY] : LIABILITY_CATEGORIES;

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getValue = (key: string): number => {
    const v = values[key];
    return v ? parseFloat(v) || 0 : 0;
  };

  const setCatValue = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setCalculated(false);
  };

  const getCategoryTotal = (cat: AssetCategory | LiabilityCategory): number => {
    return cat.items.reduce((sum, item) => sum + getValue(item.key), 0);
  };

  const totalAssets = assetCategories.reduce((sum, cat) => sum + getCategoryTotal(cat), 0);
  const totalLiabilities = liabilityCategories.reduce((sum, cat) => sum + getCategoryTotal(cat), 0);
  const netWorth = totalAssets - totalLiabilities;

  const assetBreakdown = assetCategories
    .map((cat) => ({
      name: cat.label,
      value: getCategoryTotal(cat),
      color: cat.color,
    }))
    .filter((d) => d.value > 0);

  const liabilityBreakdown = liabilityCategories
    .flatMap((cat) =>
      cat.items.map((item) => ({
        name: item.label,
        value: getValue(item.key),
      }))
    )
    .filter((d) => d.value > 0);

  const formatINR = (amount: number): string => {
    if (Math.abs(amount) >= 10000000) {
      return `${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(amount) >= 100000) {
      return `${(amount / 100000).toFixed(2)} L`;
    }
    return amount.toLocaleString('en-IN');
  };

  const renderCategory = (cat: AssetCategory | LiabilityCategory, type: 'asset' | 'liability') => {
    const isExpanded = expandedSections[cat.key] ?? false;
    const total = getCategoryTotal(cat);

    return (
      <div key={cat.key} className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection(cat.key)}
          className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: cat.color + '15' }}>
              <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
            </div>
            <span className="font-semibold text-gray-800">{cat.label}</span>
          </div>
          <div className="flex items-center gap-3">
            {total > 0 && (
              <span className={`text-sm font-semibold ${type === 'asset' ? 'text-green-600' : 'text-red-600'}`}>
                Rs {total.toLocaleString('en-IN')}
              </span>
            )}
            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </button>

        {isExpanded && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {cat.items.map((item) => (
              <div key={item.key}>
                <label className="block text-sm font-medium text-gray-600 mb-1">{item.label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rs</span>
                  <input
                    type="number"
                    value={values[item.key] || ''}
                    onChange={(e) => setCatValue(item.key, e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder={item.placeholder}
                    min="0"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-600 rounded-xl">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Net Worth Calculator</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Calculate your total net worth across all Indian and foreign asset classes
          </p>
        </div>

        {/* NRI Toggle */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-semibold text-gray-800">Are you an NRI / have foreign assets?</p>
                <p className="text-sm text-gray-500">Enable to add foreign bank accounts, 401(k), foreign property, etc.</p>
              </div>
            </div>
            <button
              onClick={() => setIsNRI(!isNRI)}
              className={`relative w-14 h-7 rounded-full transition-colors ${isNRI ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  isNRI ? 'translate-x-7' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Assets */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Assets</h2>
              {totalAssets > 0 && (
                <span className="ml-auto text-lg font-bold text-green-600">Rs {formatINR(totalAssets)}</span>
              )}
            </div>
            <div className="space-y-3">
              {assetCategories.map((cat) => renderCategory(cat, 'asset'))}
            </div>
          </div>

          {/* Liabilities */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">Liabilities</h2>
              {totalLiabilities > 0 && (
                <span className="ml-auto text-lg font-bold text-red-600">Rs {formatINR(totalLiabilities)}</span>
              )}
            </div>
            <div className="space-y-3">
              {liabilityCategories.map((cat) => renderCategory(cat, 'liability'))}
            </div>
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={() => setCalculated(true)}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-4 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl mb-8"
        >
          Calculate Net Worth
        </button>

        {/* Results */}
        {calculated && (totalAssets > 0 || totalLiabilities > 0) && (
          <>
            {/* Net Worth Card */}
            <div className={`rounded-2xl shadow-2xl p-8 mb-8 text-center ${
              netWorth >= 0
                ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white'
                : 'bg-gradient-to-br from-red-600 to-red-700 text-white'
            }`}>
              <p className="text-lg opacity-80 mb-2">Your Net Worth</p>
              <p className="text-5xl md:text-6xl font-bold mb-2">
                Rs {formatINR(Math.abs(netWorth))}
              </p>
              {netWorth < 0 && <p className="text-red-200 text-lg">(Negative Net Worth)</p>}
              <div className="flex justify-center gap-8 mt-6 text-sm">
                <div>
                  <p className="opacity-70">Total Assets</p>
                  <p className="text-xl font-bold">Rs {formatINR(totalAssets)}</p>
                </div>
                <div className="w-px bg-white/30" />
                <div>
                  <p className="opacity-70">Total Liabilities</p>
                  <p className="text-xl font-bold">Rs {formatINR(totalLiabilities)}</p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Asset Allocation Pie */}
              {assetBreakdown.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    Asset Allocation
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={assetBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {assetBreakdown.map((entry, index) => (
                            <Cell key={index} fill={entry.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number | undefined) => `Rs ${(value ?? 0).toLocaleString('en-IN')}`}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Asset vs Liability Bar */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Assets vs Liabilities</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Assets', value: totalAssets },
                        { name: 'Liabilities', value: totalLiabilities },
                        { name: 'Net Worth', value: Math.max(netWorth, 0) },
                      ]}
                    >
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(v) => `Rs ${formatINR(v)}`} />
                      <Tooltip formatter={(value: number | undefined) => `Rs ${(value ?? 0).toLocaleString('en-IN')}`} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                        <Cell fill={netWorth >= 0 ? '#3b82f6' : '#ef4444'} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Detailed Breakdown</h3>
              <div className="space-y-3">
                {assetCategories.map((cat) => {
                  const total = getCategoryTotal(cat);
                  if (total <= 0) return null;
                  const percentage = totalAssets > 0 ? (total / totalAssets) * 100 : 0;
                  return (
                    <div key={cat.key} className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg" style={{ backgroundColor: cat.color + '15' }}>
                        <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-40">{cat.label}</span>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-800 w-28 text-right">
                        Rs {formatINR(total)}
                      </span>
                      <span className="text-xs text-gray-400 w-12 text-right">{percentage.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>

              {liabilityBreakdown.length > 0 && (
                <>
                  <hr className="my-6" />
                  <h4 className="font-semibold text-gray-700 mb-3">Liabilities</h4>
                  <div className="space-y-2">
                    {liabilityBreakdown.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.name}</span>
                        <span className="text-sm font-semibold text-red-600">Rs {item.value.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Financial Health Tips */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Financial Health Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {totalLiabilities > 0 && totalAssets > 0 && (
                  <div className={`p-4 rounded-xl ${
                    totalLiabilities / totalAssets > 0.5
                      ? 'bg-red-50 border border-red-100'
                      : 'bg-green-50 border border-green-100'
                  }`}>
                    <p className="text-sm font-semibold text-gray-800">Debt-to-Asset Ratio</p>
                    <p className={`text-2xl font-bold ${
                      totalLiabilities / totalAssets > 0.5 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {((totalLiabilities / totalAssets) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {totalLiabilities / totalAssets > 0.5
                        ? 'High debt ratio. Consider reducing liabilities.'
                        : 'Healthy debt level. Keep it up!'}
                    </p>
                  </div>
                )}

                {(() => {
                  const liquidAssets = getValue('savings') + getValue('fd') + getValue('rd') + getValue('cash') +
                    getValue('mutual_funds') + getValue('stocks');
                  const realEstate = getValue('primary_home') + getValue('other_property') + getValue('land') + getValue('commercial');
                  const hasHighRealEstate = realEstate > 0 && totalAssets > 0 && realEstate / totalAssets > 0.6;

                  return (
                    <>
                      {totalAssets > 0 && (
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <p className="text-sm font-semibold text-gray-800">Liquid Assets</p>
                          <p className="text-2xl font-bold text-blue-600">Rs {formatINR(liquidAssets)}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {totalAssets > 0 ? `${((liquidAssets / totalAssets) * 100).toFixed(0)}% of total assets` : ''}
                          </p>
                        </div>
                      )}
                      {hasHighRealEstate && (
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                          <p className="text-sm font-semibold text-gray-800">High Real Estate Concentration</p>
                          <p className="text-2xl font-bold text-amber-600">
                            {((realEstate / totalAssets) * 100).toFixed(0)}%
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Consider diversifying into financial assets for better liquidity.
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 p-4 bg-gray-100 rounded-xl text-xs text-gray-500 text-center">
              <p>
                This calculator provides an indicative net worth estimate. Asset valuations (especially real estate, gold)
                should be based on current market value. For NRIs, convert foreign assets to INR at the prevailing exchange rate.
                Consult a financial advisor for comprehensive wealth planning.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
