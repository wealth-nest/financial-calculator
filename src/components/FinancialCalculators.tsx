import { useState } from 'react';
import {
  Calculator,
  ArrowLeft,
  Landmark,
  PiggyBank,
  Shield,
  GraduationCap,
  Award,
  Home as HomeIcon,
  TrendingUp,
  Percent,
  BarChart3,
  ArrowRightLeft,
  IndianRupee,
  Banknote,
} from 'lucide-react';
import SIPCalculator from './SIPCalculator';
import LumpsumCalculator from './LumpsumCalculator';
import EMICalculator from './EMICalculator';

// ---- Utility ----
const fmt = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmt2 = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

// ---- Calculator Definitions ----
type CalcKey = 'sip' | 'lumpsum' | 'emi' | 'fd' | 'rd' | 'ppf' | 'ssy' | 'nsc' | 'gratuity' | 'hra' | 'si' | 'ci' | 'inflation' | 'cagr' | 'flat_reducing';

interface CalcCard {
  key: CalcKey;
  label: string;
  icon: typeof Calculator;
  color: string;
  bg: string;
}

const CALCS: CalcCard[] = [
  { key: 'sip', label: 'SIP Calculator', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'lumpsum', label: 'Lumpsum Calculator', icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-50' },
  { key: 'emi', label: 'EMI Calculator', icon: Banknote, color: 'text-orange-600', bg: 'bg-orange-50' },
  { key: 'fd', label: 'FD Calculator', icon: Landmark, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'rd', label: 'RD Calculator', icon: PiggyBank, color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'ppf', label: 'PPF Calculator', icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { key: 'ssy', label: 'SSY Calculator', icon: GraduationCap, color: 'text-pink-600', bg: 'bg-pink-50' },
  { key: 'nsc', label: 'NSC Calculator', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'gratuity', label: 'Gratuity Calculator', icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'hra', label: 'HRA Calculator', icon: HomeIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
  { key: 'si', label: 'Simple Interest', icon: Calculator, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { key: 'ci', label: 'Compound Interest', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
  { key: 'inflation', label: 'Inflation Calculator', icon: BarChart3, color: 'text-red-600', bg: 'bg-red-50' },
  { key: 'cagr', label: 'CAGR Calculator', icon: Percent, color: 'text-teal-600', bg: 'bg-teal-50' },
  { key: 'flat_reducing', label: 'Flat vs Reducing', icon: ArrowRightLeft, color: 'text-gray-600', bg: 'bg-gray-100' },
];

// ---- Input Component ----
function Input({ label, value, onChange, suffix, min, step, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; suffix?: string; min?: string; step?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors pr-12"
          placeholder={placeholder || '0'}
          min={min || '0'}
          step={step || '1'}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function ResultCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color || 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ---- Individual Calculators ----

function FDCalculator() {
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('7');
  const [years, setYears] = useState('5');
  const [compounding, setCompounding] = useState<'quarterly' | 'monthly' | 'yearly'>('quarterly');

  const P = parseFloat(principal) || 0;
  const r = (parseFloat(rate) || 0) / 100;
  const t = parseFloat(years) || 0;
  const n = compounding === 'quarterly' ? 4 : compounding === 'monthly' ? 12 : 1;
  const maturity = P * Math.pow(1 + r / n, n * t);
  const interest = maturity - P;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Principal Amount (Rs)" value={principal} onChange={setPrincipal} suffix="Rs" />
        <Input label="Interest Rate (% p.a.)" value={rate} onChange={setRate} suffix="%" step="0.1" />
        <Input label="Tenure (Years)" value={years} onChange={setYears} suffix="Yrs" />
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Compounding</label>
          <select value={compounding} onChange={(e) => setCompounding(e.target.value as typeof compounding)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-white">
            <option value="quarterly">Quarterly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <ResultCard label="Principal" value={`Rs ${fmt(P)}`} />
        <ResultCard label="Interest Earned" value={`Rs ${fmt(interest)}`} color="text-green-600" />
        <ResultCard label="Maturity Value" value={`Rs ${fmt(maturity)}`} color="text-blue-600" />
      </div>
    </div>
  );
}

function RDCalculator() {
  const [monthly, setMonthly] = useState('5000');
  const [rate, setRate] = useState('7');
  const [years, setYears] = useState('5');

  const P = parseFloat(monthly) || 0;
  const r = (parseFloat(rate) || 0) / 100;
  const t = parseFloat(years) || 0;
  const n = t * 12;
  // RD maturity: sum each month's deposit compounded quarterly
  let maturity = 0;
  for (let i = 1; i <= n; i++) {
    maturity += P * Math.pow(1 + r / 4, ((n - i + 1) / 3));
  }
  const totalDeposit = P * n;
  const interest = maturity - totalDeposit;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Monthly Deposit (Rs)" value={monthly} onChange={setMonthly} suffix="Rs" />
        <Input label="Interest Rate (% p.a.)" value={rate} onChange={setRate} suffix="%" step="0.1" />
        <Input label="Tenure (Years)" value={years} onChange={setYears} suffix="Yrs" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <ResultCard label="Total Deposited" value={`Rs ${fmt(totalDeposit)}`} />
        <ResultCard label="Interest Earned" value={`Rs ${fmt(interest)}`} color="text-green-600" />
        <ResultCard label="Maturity Value" value={`Rs ${fmt(maturity)}`} color="text-blue-600" />
      </div>
    </div>
  );
}

function PPFCalculator() {
  const [yearly, setYearly] = useState('150000');
  const [rate, setRate] = useState('7.1');
  const [years, setYears] = useState('15');

  const P = parseFloat(yearly) || 0;
  const r = (parseFloat(rate) || 0) / 100;
  const t = parseFloat(years) || 0;
  // PPF: annual deposits, compounded annually
  let balance = 0;
  for (let i = 0; i < t; i++) {
    balance = (balance + P) * (1 + r);
  }
  const totalDeposit = P * t;
  const interest = balance - totalDeposit;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Yearly Investment (Rs)" value={yearly} onChange={setYearly} suffix="Rs" placeholder="150000" />
        <Input label="Interest Rate (% p.a.)" value={rate} onChange={setRate} suffix="%" step="0.1" />
        <Input label="Tenure (Years)" value={years} onChange={setYears} suffix="Yrs" min="15" />
      </div>
      <p className="text-xs text-gray-500">PPF has a minimum lock-in of 15 years. Maximum yearly deposit: Rs 1,50,000. Tax-free under Section 80C.</p>
      <div className="grid grid-cols-3 gap-4">
        <ResultCard label="Total Invested" value={`Rs ${fmt(totalDeposit)}`} />
        <ResultCard label="Interest Earned" value={`Rs ${fmt(interest)}`} color="text-green-600" />
        <ResultCard label="Maturity Value" value={`Rs ${fmt(balance)}`} color="text-blue-600" />
      </div>
    </div>
  );
}

function SSYCalculator() {
  const [yearly, setYearly] = useState('50000');
  const [rate, setRate] = useState('8.2');
  const [girlAge, setGirlAge] = useState('5');

  const P = parseFloat(yearly) || 0;
  const r = (parseFloat(rate) || 0) / 100;
  const age = parseInt(girlAge) || 0;
  const depositYears = Math.min(15, 21 - age); // deposit up to 15 years
  const totalYears = 21 - age; // matures at 21
  let balance = 0;
  for (let i = 0; i < totalYears; i++) {
    if (i < depositYears) balance += P;
    balance *= (1 + r);
  }
  const totalDeposit = P * depositYears;
  const interest = balance - totalDeposit;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Yearly Deposit (Rs)" value={yearly} onChange={setYearly} suffix="Rs" />
        <Input label="Interest Rate (% p.a.)" value={rate} onChange={setRate} suffix="%" step="0.1" />
        <Input label="Girl's Current Age" value={girlAge} onChange={setGirlAge} suffix="Yrs" />
      </div>
      <p className="text-xs text-gray-500">SSY account matures when the girl turns 21. Deposits allowed for first 15 years. Max Rs 1,50,000/year. Tax-free returns under 80C.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ResultCard label="Deposit Years" value={`${depositYears} years`} />
        <ResultCard label="Total Deposited" value={`Rs ${fmt(totalDeposit)}`} />
        <ResultCard label="Interest Earned" value={`Rs ${fmt(interest)}`} color="text-green-600" />
        <ResultCard label="Maturity Value" value={`Rs ${fmt(balance)}`} color="text-blue-600" sub={`At age 21`} />
      </div>
    </div>
  );
}

function NSCCalculator() {
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('7.7');

  const P = parseFloat(principal) || 0;
  const r = (parseFloat(rate) || 0) / 100;
  // NSC: 5 years, compounded annually but interest reinvested (paid at maturity)
  const maturity = P * Math.pow(1 + r, 5);
  const interest = maturity - P;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Investment Amount (Rs)" value={principal} onChange={setPrincipal} suffix="Rs" />
        <Input label="Interest Rate (% p.a.)" value={rate} onChange={setRate} suffix="%" step="0.1" />
      </div>
      <p className="text-xs text-gray-500">NSC has a fixed 5-year tenure. Interest is compounded annually but paid at maturity. Qualifies for 80C deduction.</p>
      <div className="grid grid-cols-3 gap-4">
        <ResultCard label="Invested" value={`Rs ${fmt(P)}`} />
        <ResultCard label="Interest Earned" value={`Rs ${fmt(interest)}`} color="text-green-600" />
        <ResultCard label="Maturity (5 Yrs)" value={`Rs ${fmt(maturity)}`} color="text-blue-600" />
      </div>
    </div>
  );
}

function GratuityCalculator() {
  const [salary, setSalary] = useState('50000');
  const [years, setYears] = useState('10');

  const S = parseFloat(salary) || 0;
  const Y = parseFloat(years) || 0;
  // Gratuity = (Last drawn salary × 15 × Years of service) / 26
  const gratuity = (S * 15 * Y) / 26;
  const taxFree = Math.min(gratuity, 2000000); // Rs 20 lakh tax-free limit

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Last Drawn Basic + DA (Rs/month)" value={salary} onChange={setSalary} suffix="Rs" />
        <Input label="Years of Service" value={years} onChange={setYears} suffix="Yrs" />
      </div>
      <p className="text-xs text-gray-500">Formula: (Basic + DA) x 15 x Years / 26. Eligible after 5 years of service. Tax-free up to Rs 20 lakh.</p>
      <div className="grid grid-cols-2 gap-4">
        <ResultCard label="Gratuity Amount" value={`Rs ${fmt(gratuity)}`} color="text-blue-600" />
        <ResultCard label="Tax-Free Portion" value={`Rs ${fmt(taxFree)}`} color="text-green-600" sub={gratuity > 2000000 ? `Rs ${fmt(gratuity - 2000000)} taxable` : 'Fully tax-free'} />
      </div>
    </div>
  );
}

function HRACalculator() {
  const [basicDA, setBasicDA] = useState('50000');
  const [hra, setHra] = useState('20000');
  const [rent, setRent] = useState('15000');
  const [isMetro, setIsMetro] = useState(true);

  const basic = (parseFloat(basicDA) || 0) * 12;
  const hraReceived = (parseFloat(hra) || 0) * 12;
  const rentPaid = (parseFloat(rent) || 0) * 12;

  // HRA exemption = min of: (a) Actual HRA, (b) Rent - 10% of salary, (c) 50%/40% of salary
  const a = hraReceived;
  const b = rentPaid - 0.1 * basic;
  const c = (isMetro ? 0.5 : 0.4) * basic;
  const exemption = Math.max(0, Math.min(a, b, c));
  const taxable = hraReceived - exemption;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Basic + DA (Rs/month)" value={basicDA} onChange={setBasicDA} suffix="Rs" />
        <Input label="HRA Received (Rs/month)" value={hra} onChange={setHra} suffix="Rs" />
        <Input label="Rent Paid (Rs/month)" value={rent} onChange={setRent} suffix="Rs" />
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
          <div className="flex gap-3">
            <button onClick={() => setIsMetro(true)}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${isMetro ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Metro (50%)
            </button>
            <button onClick={() => setIsMetro(false)}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${!isMetro ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Non-Metro (40%)
            </button>
          </div>
        </div>
      </div>
      <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
        <p className="font-semibold mb-1">Exemption Calculation (yearly):</p>
        <ul className="space-y-0.5 text-blue-600">
          <li>(a) Actual HRA received: Rs {fmt(a)}</li>
          <li>(b) Rent paid - 10% of salary: Rs {fmt(Math.max(0, b))}</li>
          <li>(c) {isMetro ? '50%' : '40%'} of Basic+DA: Rs {fmt(c)}</li>
        </ul>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ResultCard label="HRA Exemption (yearly)" value={`Rs ${fmt(exemption)}`} color="text-green-600" sub={`Rs ${fmt(exemption / 12)}/month`} />
        <ResultCard label="Taxable HRA (yearly)" value={`Rs ${fmt(taxable)}`} color="text-red-600" sub={`Rs ${fmt(taxable / 12)}/month`} />
      </div>
    </div>
  );
}

function SimpleInterestCalc() {
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('8');
  const [years, setYears] = useState('5');

  const P = parseFloat(principal) || 0;
  const r = (parseFloat(rate) || 0) / 100;
  const t = parseFloat(years) || 0;
  const interest = P * r * t;
  const total = P + interest;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Principal (Rs)" value={principal} onChange={setPrincipal} suffix="Rs" />
        <Input label="Rate of Interest (% p.a.)" value={rate} onChange={setRate} suffix="%" step="0.1" />
        <Input label="Time Period (Years)" value={years} onChange={setYears} suffix="Yrs" step="0.5" />
      </div>
      <p className="text-xs text-gray-500">Simple Interest = P x R x T. Interest is calculated only on the original principal.</p>
      <div className="grid grid-cols-3 gap-4">
        <ResultCard label="Principal" value={`Rs ${fmt(P)}`} />
        <ResultCard label="Interest" value={`Rs ${fmt(interest)}`} color="text-green-600" />
        <ResultCard label="Total Amount" value={`Rs ${fmt(total)}`} color="text-blue-600" />
      </div>
    </div>
  );
}

function CompoundInterestCalc() {
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('8');
  const [years, setYears] = useState('5');
  const [freq, setFreq] = useState<'1' | '2' | '4' | '12' | '365'>('4');

  const P = parseFloat(principal) || 0;
  const r = (parseFloat(rate) || 0) / 100;
  const t = parseFloat(years) || 0;
  const n = parseInt(freq);
  const amount = P * Math.pow(1 + r / n, n * t);
  const interest = amount - P;

  const freqLabels: Record<string, string> = { '1': 'Yearly', '2': 'Half-Yearly', '4': 'Quarterly', '12': 'Monthly', '365': 'Daily' };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Principal (Rs)" value={principal} onChange={setPrincipal} suffix="Rs" />
        <Input label="Rate of Interest (% p.a.)" value={rate} onChange={setRate} suffix="%" step="0.1" />
        <Input label="Time Period (Years)" value={years} onChange={setYears} suffix="Yrs" step="0.5" />
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Compounding Frequency</label>
          <select value={freq} onChange={(e) => setFreq(e.target.value as typeof freq)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-white">
            {Object.entries(freqLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <ResultCard label="Principal" value={`Rs ${fmt(P)}`} />
        <ResultCard label="Interest Earned" value={`Rs ${fmt(interest)}`} color="text-green-600" />
        <ResultCard label="Total Amount" value={`Rs ${fmt(amount)}`} color="text-blue-600" />
      </div>
    </div>
  );
}

function InflationCalculator() {
  const [currentCost, setCurrentCost] = useState('100000');
  const [inflation, setInflation] = useState('6');
  const [years, setYears] = useState('10');

  const C = parseFloat(currentCost) || 0;
  const r = (parseFloat(inflation) || 0) / 100;
  const t = parseFloat(years) || 0;
  const futureCost = C * Math.pow(1 + r, t);
  const increase = futureCost - C;
  const purchasingPower = C / Math.pow(1 + r, t);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Current Cost (Rs)" value={currentCost} onChange={setCurrentCost} suffix="Rs" />
        <Input label="Inflation Rate (% p.a.)" value={inflation} onChange={setInflation} suffix="%" step="0.1" />
        <Input label="After Years" value={years} onChange={setYears} suffix="Yrs" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ResultCard label="Current Cost" value={`Rs ${fmt(C)}`} />
        <ResultCard label={`Cost after ${years} yrs`} value={`Rs ${fmt(futureCost)}`} color="text-red-600" />
        <ResultCard label="Price Increase" value={`Rs ${fmt(increase)}`} color="text-orange-600" sub={`${((increase / C) * 100).toFixed(0)}% more`} />
        <ResultCard label="Rs 1L will be worth" value={`Rs ${fmt(purchasingPower)}`} color="text-blue-600" sub="in today's terms" />
      </div>
    </div>
  );
}

function CAGRCalculator() {
  const [beginValue, setBeginValue] = useState('100000');
  const [endValue, setEndValue] = useState('200000');
  const [years, setYears] = useState('5');

  const B = parseFloat(beginValue) || 0;
  const E = parseFloat(endValue) || 0;
  const t = parseFloat(years) || 0;
  const cagr = B > 0 && t > 0 ? (Math.pow(E / B, 1 / t) - 1) * 100 : 0;
  const absReturn = B > 0 ? ((E - B) / B) * 100 : 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Beginning Value (Rs)" value={beginValue} onChange={setBeginValue} suffix="Rs" />
        <Input label="Ending Value (Rs)" value={endValue} onChange={setEndValue} suffix="Rs" />
        <Input label="Number of Years" value={years} onChange={setYears} suffix="Yrs" step="0.5" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <ResultCard label="CAGR" value={`${fmt2(cagr)}%`} color={cagr >= 0 ? 'text-green-600' : 'text-red-600'} />
        <ResultCard label="Absolute Return" value={`${fmt2(absReturn)}%`} color={absReturn >= 0 ? 'text-green-600' : 'text-red-600'} />
        <ResultCard label="Profit / Loss" value={`Rs ${fmt(E - B)}`} color={E >= B ? 'text-green-600' : 'text-red-600'} />
      </div>
    </div>
  );
}

function FlatVsReducingCalc() {
  const [principal, setPrincipal] = useState('1000000');
  const [flatRate, setFlatRate] = useState('10');
  const [years, setYears] = useState('5');

  const P = parseFloat(principal) || 0;
  const fr = (parseFloat(flatRate) || 0) / 100;
  const t = parseFloat(years) || 0;
  const n = t * 12;

  // Flat rate
  const flatInterest = P * fr * t;
  const flatTotal = P + flatInterest;
  const flatEMI = n > 0 ? flatTotal / n : 0;

  // Equivalent reducing rate (approximate via IRR-like approach)
  // EMI = P * r * (1+r)^n / ((1+r)^n - 1), solve for r given EMI = flatEMI
  let reducingRate = fr; // start guess
  for (let iter = 0; iter < 100; iter++) {
    const rm = reducingRate / 12;
    if (rm <= 0) break;
    const emi = P * rm * Math.pow(1 + rm, n) / (Math.pow(1 + rm, n) - 1);
    const diff = emi - flatEMI;
    if (Math.abs(diff) < 0.01) break;
    reducingRate += (diff > 0 ? -0.001 : 0.001);
  }

  // Also show: if same reducing rate was applied, what's the EMI
  const sameRateRM = fr / 12;
  const sameRateEMI = sameRateRM > 0 && n > 0 ? P * sameRateRM * Math.pow(1 + sameRateRM, n) / (Math.pow(1 + sameRateRM, n) - 1) : 0;
  const sameRateTotal = sameRateEMI * n;
  const sameRateInterest = sameRateTotal - P;
  const savings = flatTotal - sameRateTotal;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Loan Amount (Rs)" value={principal} onChange={setPrincipal} suffix="Rs" />
        <Input label="Flat Interest Rate (% p.a.)" value={flatRate} onChange={setFlatRate} suffix="%" step="0.1" />
        <Input label="Tenure (Years)" value={years} onChange={setYears} suffix="Yrs" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-red-50 rounded-xl border border-red-100">
          <h4 className="font-bold text-gray-900 mb-3">Flat Rate ({flatRate}%)</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">EMI</span><span className="font-semibold">Rs {fmt(flatEMI)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Total Interest</span><span className="font-semibold text-red-600">Rs {fmt(flatInterest)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Total Payment</span><span className="font-semibold">Rs {fmt(flatTotal)}</span></div>
            <div className="flex justify-between pt-2 border-t border-red-200"><span className="text-gray-600">Equivalent Reducing Rate</span><span className="font-bold text-red-600">{fmt2(reducingRate * 100)}%</span></div>
          </div>
        </div>
        <div className="p-5 bg-green-50 rounded-xl border border-green-100">
          <h4 className="font-bold text-gray-900 mb-3">Reducing Rate ({flatRate}%)</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">EMI</span><span className="font-semibold">Rs {fmt(sameRateEMI)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Total Interest</span><span className="font-semibold text-green-600">Rs {fmt(sameRateInterest)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Total Payment</span><span className="font-semibold">Rs {fmt(sameRateTotal)}</span></div>
            <div className="flex justify-between pt-2 border-t border-green-200"><span className="text-gray-600">You Save</span><span className="font-bold text-green-600">Rs {fmt(savings)}</span></div>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500">Flat rate charges interest on the full principal throughout the tenure. Reducing balance charges interest only on outstanding principal. A {flatRate}% flat rate is equivalent to ~{fmt2(reducingRate * 100)}% reducing rate.</p>
    </div>
  );
}

// ---- Main Component ----

export default function FinancialCalculators() {
  const [activeCalc, setActiveCalc] = useState<CalcKey | null>(null);

  // SIP, Lumpsum, EMI are full-page components rendered outside the card wrapper
  const isFullPageCalc = activeCalc === 'sip' || activeCalc === 'lumpsum' || activeCalc === 'emi';

  const renderCalculator = () => {
    switch (activeCalc) {
      case 'fd': return <FDCalculator />;
      case 'rd': return <RDCalculator />;
      case 'ppf': return <PPFCalculator />;
      case 'ssy': return <SSYCalculator />;
      case 'nsc': return <NSCCalculator />;
      case 'gratuity': return <GratuityCalculator />;
      case 'hra': return <HRACalculator />;
      case 'si': return <SimpleInterestCalc />;
      case 'ci': return <CompoundInterestCalc />;
      case 'inflation': return <InflationCalculator />;
      case 'cagr': return <CAGRCalculator />;
      case 'flat_reducing': return <FlatVsReducingCalc />;
      default: return null;
    }
  };

  const activeCard = CALCS.find((c) => c.key === activeCalc);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-slate-800 rounded-xl">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Financial Calculators</h1>
          </div>
          <p className="text-gray-600 text-lg">
            All essential Indian financial calculators in one place
          </p>
        </div>

        {!activeCalc ? (
          /* Calculator Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CALCS.map((calc) => (
              <button
                key={calc.key}
                onClick={() => setActiveCalc(calc.key)}
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group"
              >
                <div className={`p-3 ${calc.bg} rounded-xl group-hover:scale-110 transition-transform`}>
                  <calc.icon className={`w-7 h-7 ${calc.color}`} />
                </div>
                <span className="text-sm font-semibold text-gray-800 text-center">{calc.label}</span>
              </button>
            ))}
          </div>
        ) : isFullPageCalc ? (
          /* Full-page calculators (SIP, Lumpsum, EMI) — rendered with back button */
          <div>
            <button
              onClick={() => setActiveCalc(null)}
              className="flex items-center gap-2 mb-4 px-4 py-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">All Calculators</span>
            </button>
            {activeCalc === 'sip' && <SIPCalculator />}
            {activeCalc === 'lumpsum' && <LumpsumCalculator />}
            {activeCalc === 'emi' && <EMICalculator />}
          </div>
        ) : (
          /* Inline calculators (FD, RD, PPF, etc.) */
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <button
                onClick={() => setActiveCalc(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              {activeCard && (
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${activeCard.bg} rounded-lg`}>
                    <activeCard.icon className={`w-5 h-5 ${activeCard.color}`} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{activeCard.label}</h2>
                </div>
              )}
            </div>
            <div className="p-6 md:p-8">
              {renderCalculator()}
            </div>
          </div>
        )}

        {/* Quick nav when calculator is open */}
        {activeCalc && (
          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-3 font-medium">Other Calculators</p>
            <div className="flex flex-wrap gap-2">
              {CALCS.filter((c) => c.key !== activeCalc).map((calc) => (
                <button
                  key={calc.key}
                  onClick={() => setActiveCalc(calc.key)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <calc.icon className={`w-4 h-4 ${calc.color}`} />
                  {calc.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
