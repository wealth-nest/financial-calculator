import { useState } from 'react';
import {
  Shield,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Target,
  PiggyBank,
  Heart,
  Wallet,
  Clock,
  BarChart3,
  ArrowRight,
  RotateCcw,
  Landmark,
  Umbrella,
  GraduationCap,
  Home as HomeIcon,
  Download,
} from 'lucide-react';

// ---- Types ----

interface Question {
  id: string;
  section: 'risk' | 'health';
  text: string;
  subtitle?: string;
  options: { label: string; value: number; tag?: string }[];
}

interface RiskResult {
  score: number;
  maxScore: number;
  profile: 'Conservative' | 'Moderately Conservative' | 'Moderate' | 'Moderately Aggressive' | 'Aggressive';
  color: string;
  description: string;
  allocation: { equity: number; debt: number; gold: number };
  fundTypes: string[];
}

interface HealthResult {
  score: number;
  maxScore: number;
  grade: 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical';
  color: string;
  areas: HealthArea[];
}

interface HealthArea {
  label: string;
  icon: typeof Shield;
  status: 'good' | 'warning' | 'critical';
  message: string;
  action?: string;
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  icon: typeof Shield;
  actionLabel?: string;
  actionTab?: string;
}

// ---- Questions ----

const QUESTIONS: Question[] = [
  // --- Risk Profile (7 questions) ---
  {
    id: 'r1',
    section: 'risk',
    text: 'What is your age?',
    subtitle: 'Age affects your investment horizon and risk capacity',
    options: [
      { label: 'Below 25', value: 5, tag: 'Long runway' },
      { label: '25 - 35', value: 4 },
      { label: '36 - 45', value: 3 },
      { label: '46 - 55', value: 2 },
      { label: '56 and above', value: 1, tag: 'Capital preservation' },
    ],
  },
  {
    id: 'r2',
    section: 'risk',
    text: 'What is your primary investment goal?',
    options: [
      { label: 'Wealth creation (10+ years)', value: 5 },
      { label: 'Child education / marriage', value: 4 },
      { label: 'Buying a house (5-10 years)', value: 3 },
      { label: 'Retirement planning', value: 3 },
      { label: 'Short-term savings (1-3 years)', value: 1 },
      { label: 'Tax saving', value: 3 },
    ],
  },
  {
    id: 'r3',
    section: 'risk',
    text: 'How long can you stay invested without needing this money?',
    subtitle: 'Your investment horizon',
    options: [
      { label: 'Less than 1 year', value: 1 },
      { label: '1 - 3 years', value: 2 },
      { label: '3 - 5 years', value: 3 },
      { label: '5 - 10 years', value: 4 },
      { label: 'More than 10 years', value: 5 },
    ],
  },
  {
    id: 'r4',
    section: 'risk',
    text: 'If your investment drops 20% in a month, what would you do?',
    subtitle: 'This reveals your emotional response to volatility',
    options: [
      { label: 'Sell everything immediately', value: 1 },
      { label: 'Sell some to reduce losses', value: 2 },
      { label: 'Hold and wait for recovery', value: 3 },
      { label: 'Invest more to average down', value: 5 },
    ],
  },
  {
    id: 'r5',
    section: 'risk',
    text: 'What percentage of your monthly income can you invest?',
    options: [
      { label: 'Less than 10%', value: 1 },
      { label: '10% - 20%', value: 2 },
      { label: '20% - 30%', value: 3 },
      { label: '30% - 50%', value: 4 },
      { label: 'More than 50%', value: 5 },
    ],
  },
  {
    id: 'r6',
    section: 'risk',
    text: 'What is your investment experience?',
    options: [
      { label: 'No experience - I am new to investing', value: 1 },
      { label: 'Basic - FDs, PPF, savings account', value: 2 },
      { label: 'Moderate - Mutual funds, some stocks', value: 3 },
      { label: 'Good - Active stock trading, MF portfolio', value: 4 },
      { label: 'Expert - Derivatives, global markets', value: 5 },
    ],
  },
  {
    id: 'r7',
    section: 'risk',
    text: 'Which return expectation best matches your preference?',
    options: [
      { label: '6-7% (FD-like, very safe)', value: 1 },
      { label: '8-10% (slightly above FD, low risk)', value: 2 },
      { label: '10-14% (moderate growth, some ups and downs)', value: 3 },
      { label: '14-18% (aggressive growth, significant volatility)', value: 4 },
      { label: '18%+ (maximum growth, willing to accept big swings)', value: 5 },
    ],
  },

  // --- Financial Health (8 questions) ---
  {
    id: 'h1',
    section: 'health',
    text: 'Do you have an emergency fund?',
    subtitle: 'An emergency fund should cover 6 months of expenses',
    options: [
      { label: 'No emergency fund', value: 1 },
      { label: 'Less than 3 months of expenses', value: 2 },
      { label: '3 - 6 months of expenses', value: 3 },
      { label: 'More than 6 months of expenses', value: 5 },
    ],
  },
  {
    id: 'h2',
    section: 'health',
    text: 'Do you have health insurance?',
    options: [
      { label: 'No health insurance', value: 1 },
      { label: 'Only employer-provided insurance', value: 2 },
      { label: 'Personal health insurance (below Rs 10 lakh)', value: 3 },
      { label: 'Comprehensive cover (Rs 10 lakh+ or super top-up)', value: 5 },
    ],
  },
  {
    id: 'h3',
    section: 'health',
    text: 'Do you have term life insurance?',
    subtitle: 'Term insurance protects your family financially',
    options: [
      { label: 'No life insurance', value: 1 },
      { label: 'Only LIC endowment / ULIP', value: 2 },
      { label: 'Term insurance (less than 10x annual income)', value: 3 },
      { label: 'Adequate term cover (10x+ annual income)', value: 5 },
    ],
  },
  {
    id: 'h4',
    section: 'health',
    text: 'What is your current debt situation?',
    options: [
      { label: 'EMIs exceed 50% of income', value: 1 },
      { label: 'EMIs are 30-50% of income', value: 2 },
      { label: 'EMIs are 10-30% of income (manageable)', value: 3 },
      { label: 'Minimal or no debt', value: 5 },
    ],
  },
  {
    id: 'h5',
    section: 'health',
    text: 'Do you have a will or estate plan?',
    options: [
      { label: 'No, have not thought about it', value: 1 },
      { label: 'Have nominees on accounts but no will', value: 2 },
      { label: 'Have a basic will', value: 4 },
      { label: 'Comprehensive will and estate plan', value: 5 },
    ],
  },
  {
    id: 'h6',
    section: 'health',
    text: 'Are you saving/investing for retirement?',
    options: [
      { label: 'Not yet, relying on EPF only', value: 1 },
      { label: 'EPF + some savings', value: 2 },
      { label: 'EPF + PPF/NPS + mutual funds', value: 4 },
      { label: 'Well-planned retirement corpus building', value: 5 },
    ],
  },
  {
    id: 'h7',
    section: 'health',
    text: 'How diversified are your investments?',
    options: [
      { label: 'Everything in savings/FDs', value: 1 },
      { label: 'Mostly real estate and gold', value: 2 },
      { label: 'Mix of FD, MF, and some equity', value: 3 },
      { label: 'Well-diversified across equity, debt, gold, and real estate', value: 5 },
    ],
  },
  {
    id: 'h8',
    section: 'health',
    text: 'Do you track your expenses and maintain a budget?',
    options: [
      { label: 'No idea where my money goes', value: 1 },
      { label: 'Rough idea but no tracking', value: 2 },
      { label: 'Track major expenses', value: 3 },
      { label: 'Detailed budgeting and expense tracking', value: 5 },
    ],
  },
];

// ---- Scoring Logic ----

function computeRiskProfile(answers: Record<string, number>): RiskResult {
  const riskQs = QUESTIONS.filter((q) => q.section === 'risk');
  let score = 0;
  let maxScore = 0;
  for (const q of riskQs) {
    score += answers[q.id] || 0;
    maxScore += Math.max(...q.options.map((o) => o.value));
  }

  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;

  if (pct <= 25) {
    return {
      score, maxScore, profile: 'Conservative', color: '#3b82f6',
      description: 'You prefer safety over returns. Capital preservation is your top priority. You are uncomfortable with market fluctuations.',
      allocation: { equity: 15, debt: 75, gold: 10 },
      fundTypes: ['Liquid Funds', 'Short Duration Debt Funds', 'Banking & PSU Funds', 'Conservative Hybrid Funds'],
    };
  }
  if (pct <= 40) {
    return {
      score, maxScore, profile: 'Moderately Conservative', color: '#0ea5e9',
      description: 'You want some growth but with limited downside. Stability is important, but you can tolerate small fluctuations.',
      allocation: { equity: 30, debt: 55, gold: 15 },
      fundTypes: ['Conservative Hybrid Funds', 'Balanced Advantage Funds', 'Large Cap Funds', 'Short Duration Debt'],
    };
  }
  if (pct <= 60) {
    return {
      score, maxScore, profile: 'Moderate', color: '#10b981',
      description: 'You balance growth and safety. You can handle moderate volatility and are willing to stay invested for 5+ years.',
      allocation: { equity: 50, debt: 35, gold: 15 },
      fundTypes: ['Flexi Cap Funds', 'Large & Mid Cap', 'Balanced Advantage', 'ELSS', 'Index Funds (Nifty 50)'],
    };
  }
  if (pct <= 80) {
    return {
      score, maxScore, profile: 'Moderately Aggressive', color: '#f59e0b',
      description: 'You seek higher returns and can tolerate significant volatility. You have a longer investment horizon and good market understanding.',
      allocation: { equity: 70, debt: 20, gold: 10 },
      fundTypes: ['Mid Cap Funds', 'Flexi Cap', 'Focused Funds', 'Sectoral/Thematic', 'ELSS', 'Index Funds (Nifty Next 50)'],
    };
  }
  return {
    score, maxScore, profile: 'Aggressive', color: '#ef4444',
    description: 'You are a high-risk, high-reward investor. You can stomach large drawdowns and have a long horizon. Maximum equity exposure suits you.',
    allocation: { equity: 85, debt: 10, gold: 5 },
    fundTypes: ['Small Cap Funds', 'Mid Cap Funds', 'Sectoral/Thematic', 'International Funds', 'Index Funds (Nifty Smallcap 250)'],
  };
}

function computeHealthResult(answers: Record<string, number>): HealthResult {
  const healthQs = QUESTIONS.filter((q) => q.section === 'health');
  let score = 0;
  let maxScore = 0;
  for (const q of healthQs) {
    score += answers[q.id] || 0;
    maxScore += Math.max(...q.options.map((o) => o.value));
  }

  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;

  const areas: HealthArea[] = [];

  // Emergency fund
  const ef = answers['h1'] || 0;
  areas.push({
    label: 'Emergency Fund',
    icon: Umbrella,
    status: ef >= 4 ? 'good' : ef >= 3 ? 'warning' : 'critical',
    message: ef >= 4
      ? 'Great! You have 6+ months of expenses saved.'
      : ef >= 3
      ? 'You have 3-6 months covered. Try to build to 6 months.'
      : 'You need an emergency fund urgently. Start with a liquid fund SIP.',
    action: ef < 4 ? 'Start a Liquid Fund SIP for emergency fund' : undefined,
  });

  // Health insurance
  const hi = answers['h2'] || 0;
  areas.push({
    label: 'Health Insurance',
    icon: Heart,
    status: hi >= 4 ? 'good' : hi >= 2 ? 'warning' : 'critical',
    message: hi >= 4
      ? 'Well covered with comprehensive health insurance.'
      : hi >= 2
      ? 'Employer insurance alone is risky. Get a personal policy of Rs 10-15 lakh.'
      : 'No health insurance is very risky. One hospitalization can wipe out savings.',
    action: hi < 4 ? 'Get a personal health insurance policy immediately' : undefined,
  });

  // Term insurance
  const ti = answers['h3'] || 0;
  areas.push({
    label: 'Life Insurance',
    icon: Shield,
    status: ti >= 4 ? 'good' : ti >= 2 ? 'warning' : 'critical',
    message: ti >= 4
      ? 'Adequate term insurance in place.'
      : ti >= 2
      ? 'LIC/ULIP is not adequate. Get a term plan of 10-15x annual income.'
      : 'No life protection. Your family is financially vulnerable.',
    action: ti < 4 ? 'Buy a term insurance plan (10-15x annual income)' : undefined,
  });

  // Debt
  const debt = answers['h4'] || 0;
  areas.push({
    label: 'Debt Management',
    icon: Wallet,
    status: debt >= 4 ? 'good' : debt >= 3 ? 'warning' : 'critical',
    message: debt >= 4
      ? 'Minimal or no debt. Excellent position to invest.'
      : debt >= 3
      ? 'Debt is manageable. Avoid taking more loans while building investments.'
      : 'High debt load. Prioritize paying off high-interest loans before investing.',
    action: debt < 3 ? 'Pay off credit cards and personal loans first' : undefined,
  });

  // Estate planning
  const estate = answers['h5'] || 0;
  areas.push({
    label: 'Estate Planning',
    icon: Landmark,
    status: estate >= 4 ? 'good' : estate >= 2 ? 'warning' : 'critical',
    message: estate >= 4
      ? 'Will and nominations in place.'
      : estate >= 2
      ? 'Nominees are set but a will is important for smooth succession.'
      : 'No will or nominees. Your assets may face legal complications.',
    action: estate < 4 ? 'Create a will and update nominees on all accounts' : undefined,
  });

  // Retirement
  const ret = answers['h6'] || 0;
  areas.push({
    label: 'Retirement Readiness',
    icon: Clock,
    status: ret >= 4 ? 'good' : ret >= 2 ? 'warning' : 'critical',
    message: ret >= 4
      ? 'Strong retirement planning in progress.'
      : ret >= 2
      ? 'Basic savings only. Start SIPs in equity funds for long-term growth.'
      : 'Not planning for retirement at all. Start immediately even with small SIPs.',
    action: ret < 4 ? 'Start retirement SIPs in equity mutual funds' : undefined,
  });

  // Diversification
  const div = answers['h7'] || 0;
  areas.push({
    label: 'Diversification',
    icon: BarChart3,
    status: div >= 4 ? 'good' : div >= 3 ? 'warning' : 'critical',
    message: div >= 4
      ? 'Well-diversified portfolio across asset classes.'
      : div >= 2
      ? 'Concentrated in few assets. Add mutual funds for better diversification.'
      : 'All eggs in one basket. Diversification is crucial for wealth protection.',
    action: div < 4 ? 'Diversify into mutual funds across equity, debt, and gold' : undefined,
  });

  // Budgeting
  const budget = answers['h8'] || 0;
  areas.push({
    label: 'Budgeting',
    icon: PiggyBank,
    status: budget >= 4 ? 'good' : budget >= 2 ? 'warning' : 'critical',
    message: budget >= 4
      ? 'Disciplined budgeting and expense tracking.'
      : budget >= 2
      ? 'Rough tracking only. Use an app to monitor spending for better control.'
      : 'No expense tracking. You may be overspending without knowing.',
    action: budget < 3 ? 'Start tracking expenses using an app or spreadsheet' : undefined,
  });

  let grade: HealthResult['grade'];
  let color: string;
  if (pct >= 80) { grade = 'Excellent'; color = '#10b981'; }
  else if (pct >= 60) { grade = 'Good'; color = '#3b82f6'; }
  else if (pct >= 40) { grade = 'Needs Improvement'; color = '#f59e0b'; }
  else { grade = 'Critical'; color = '#ef4444'; }

  return { score, maxScore, grade, color, areas };
}

function generateRecommendations(
  answers: Record<string, number>,
  risk: RiskResult,
  health: HealthResult
): Recommendation[] {
  const recs: Recommendation[] = [];

  // Critical health items first
  for (const area of health.areas) {
    if (area.status === 'critical' && area.action) {
      recs.push({
        priority: 'high',
        title: area.label,
        description: area.action,
        icon: area.icon,
      });
    }
  }

  // Warning items
  for (const area of health.areas) {
    if (area.status === 'warning' && area.action) {
      recs.push({
        priority: 'medium',
        title: area.label,
        description: area.action,
        icon: area.icon,
      });
    }
  }

  // Investment recommendations based on risk profile
  if (risk.profile === 'Conservative' || risk.profile === 'Moderately Conservative') {
    recs.push({
      priority: 'medium',
      title: 'Start with Safe Investments',
      description: `Based on your ${risk.profile.toLowerCase()} profile, start with ${risk.fundTypes.slice(0, 2).join(' and ')}. Aim for ${risk.allocation.debt}% in debt and ${risk.allocation.equity}% in equity.`,
      icon: Shield,
      actionLabel: 'Use SIP Calculator',
      actionTab: 'calculators',
    });
  } else {
    recs.push({
      priority: 'medium',
      title: 'Build an Equity Portfolio',
      description: `Your ${risk.profile.toLowerCase()} profile suits ${risk.allocation.equity}% equity allocation. Consider ${risk.fundTypes.slice(0, 3).join(', ')}.`,
      icon: TrendingUp,
      actionLabel: 'Explore Funds',
      actionTab: 'mutualfunds',
    });
  }

  // SIP recommendation
  const investPct = answers['r5'] || 0;
  if (investPct <= 2) {
    recs.push({
      priority: 'medium',
      title: 'Increase Your Savings Rate',
      description: 'Try to save at least 20% of your income. Use a step-up SIP to automatically increase your investments each year.',
      icon: PiggyBank,
      actionLabel: 'Plan Your SIP',
      actionTab: 'calculators',
    });
  }

  // Tax saving
  const goal = answers['r2'] || 0;
  if (goal === 3) {
    recs.push({
      priority: 'low',
      title: 'Tax Saving with ELSS',
      description: 'ELSS funds offer tax deduction under Section 80C with only a 3-year lock-in. Better returns than PPF/FD in the long run.',
      icon: Landmark,
      actionLabel: 'Explore ELSS Funds',
      actionTab: 'mutualfunds',
    });
  }

  // Portfolio review
  const experience = answers['r6'] || 0;
  if (experience >= 3) {
    recs.push({
      priority: 'low',
      title: 'Review Your Existing Portfolio',
      description: 'Upload your CAS statement to check if your current funds are beating their benchmarks. Replace underperformers.',
      icon: BarChart3,
      actionLabel: 'Analyze Portfolio',
      actionTab: 'portfolio',
    });
  }

  // Net worth tracking
  recs.push({
    priority: 'low',
    title: 'Track Your Net Worth',
    description: 'Calculate your total net worth to understand where you stand. This is the starting point for financial planning.',
    icon: Wallet,
    actionLabel: 'Calculate Net Worth',
    actionTab: 'networth',
  });

  // Goal-based
  const goalType = answers['r2'] || 0;
  if (goalType === 4) {
    recs.push({
      priority: 'medium',
      title: 'Child Education Planning',
      description: 'Start a dedicated SIP for your child\'s education. A flexi cap or mid cap fund SIP of Rs 5,000/month for 15 years can grow to Rs 25+ lakh.',
      icon: GraduationCap,
      actionLabel: 'Calculate SIP',
      actionTab: 'calculators',
    });
  }
  if (goalType === 3) {
    recs.push({
      priority: 'medium',
      title: 'Home Purchase Planning',
      description: 'For a house in 5-10 years, use a combination of debt funds (for down payment in 2-3 years) and equity funds (for longer portion).',
      icon: HomeIcon,
      actionLabel: 'EMI Calculator',
      actionTab: 'calculators',
    });
  }

  return recs;
}

// ---- Component ----

interface RiskProfilerProps {
  onNavigate?: (tab: string) => void;
}

export default function RiskProfiler({ onNavigate }: RiskProfilerProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const totalQuestions = QUESTIONS.length;
  const riskQuestions = QUESTIONS.filter((q) => q.section === 'risk');
  const healthQuestions = QUESTIONS.filter((q) => q.section === 'health');
  const currentQuestion = QUESTIONS[currentQ];
  const isRiskSection = currentQuestion?.section === 'risk';
  const sectionLabel = isRiskSection ? 'Risk Profile' : 'Financial Health';
  const sectionProgress = isRiskSection
    ? `${Math.min(currentQ + 1, riskQuestions.length)} of ${riskQuestions.length}`
    : `${currentQ - riskQuestions.length + 1} of ${healthQuestions.length}`;

  const selectAnswer = (value: number) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    // Auto-advance after short delay
    setTimeout(() => {
      if (currentQ < totalQuestions - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        setShowResults(true);
      }
    }, 300);
  };

  const goBack = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  const restart = () => {
    setCurrentQ(0);
    setAnswers({});
    setShowResults(false);
  };

  const downloadReport = () => {
    const risk = computeRiskProfile(answers);
    const health = computeHealthResult(answers);
    const recs = generateRecommendations(answers, risk, health);
    const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const statusIcon = (s: string) => s === 'good' ? '&#9989;' : s === 'warning' ? '&#9888;&#65039;' : '&#10060;';
    const priorityColor = (p: string) => p === 'high' ? '#dc2626' : p === 'medium' ? '#d97706' : '#2563eb';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Financial Health Report - Nandalal</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
  h1 { font-size: 28px; margin-bottom: 4px; }
  h2 { font-size: 20px; margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
  h3 { font-size: 16px; margin: 16px 0 8px; }
  .header { text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 3px solid #7c3aed; }
  .header p { color: #6b7280; font-size: 14px; }
  .two-col { display: flex; gap: 24px; margin-bottom: 24px; }
  .two-col > div { flex: 1; }
  .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
  .card-header { padding: 16px 20px; border-radius: 12px 12px 0 0; color: white; margin: -20px -20px 16px; }
  .card-header h3 { color: white; margin: 0; font-size: 14px; opacity: 0.8; }
  .card-header .value { font-size: 24px; font-weight: bold; }
  .card-header .score { font-size: 12px; opacity: 0.7; }
  .alloc-bar { display: flex; height: 24px; border-radius: 12px; overflow: hidden; margin: 8px 0; }
  .alloc-bar span { display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 600; }
  .tag { display: inline-block; background: #f3f4f6; padding: 3px 10px; border-radius: 12px; font-size: 12px; margin: 2px; }
  .area-row { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 10px; font-size: 13px; }
  .area-row .icon { font-size: 16px; flex-shrink: 0; }
  .area-row .label { font-weight: 600; }
  .rec { padding: 14px; border-radius: 10px; margin-bottom: 10px; border-left: 4px solid; }
  .rec .priority { font-size: 11px; font-weight: 700; text-transform: uppercase; }
  .rec .title { font-weight: 600; font-size: 14px; margin: 2px 0; }
  .rec .desc { font-size: 13px; color: #4b5563; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af; }
  @media print { body { padding: 20px; } .no-print { display: none; } }
</style>
</head>
<body>
<div class="header">
  <h1>Financial Health Report</h1>
  <p>Prepared by <strong>Nandalal - Mutual Fund Distributor</strong></p>
  <p>Generated on ${date}</p>
</div>

<div class="two-col">
  <div class="card">
    <div class="card-header" style="background:${risk.color}">
      <h3>Risk Profile</h3>
      <div class="value">${risk.profile}</div>
      <div class="score">Score: ${risk.score}/${risk.maxScore}</div>
    </div>
    <p style="font-size:13px;color:#4b5563;margin-bottom:12px">${risk.description}</p>
    <h3>Recommended Allocation</h3>
    <div class="alloc-bar">
      <span style="width:${risk.allocation.equity}%;background:#3b82f6">Equity ${risk.allocation.equity}%</span>
      <span style="width:${risk.allocation.debt}%;background:#10b981">Debt ${risk.allocation.debt}%</span>
      <span style="width:${risk.allocation.gold}%;background:#eab308">Gold ${risk.allocation.gold}%</span>
    </div>
    <h3>Suitable Fund Types</h3>
    <div>${risk.fundTypes.map(f => `<span class="tag">${f}</span>`).join(' ')}</div>
  </div>

  <div class="card">
    <div class="card-header" style="background:${health.color}">
      <h3>Financial Health</h3>
      <div class="value">${health.grade}</div>
      <div class="score">Score: ${health.score}/${health.maxScore}</div>
    </div>
    ${health.areas.map(a => `
    <div class="area-row">
      <span class="icon">${statusIcon(a.status)}</span>
      <div><span class="label">${a.label}</span><br/><span style="color:#6b7280">${a.message}</span></div>
    </div>`).join('')}
  </div>
</div>

<h2>Personalized Action Plan</h2>
${recs.map(r => `
<div class="rec" style="border-color:${priorityColor(r.priority)};background:${r.priority === 'high' ? '#fef2f2' : r.priority === 'medium' ? '#fffbeb' : '#eff6ff'}">
  <div class="priority" style="color:${priorityColor(r.priority)}">${r.priority} priority</div>
  <div class="title">${r.title}</div>
  <div class="desc">${r.description}</div>
</div>`).join('')}

<div class="footer">
  <p><strong>Nandalal - AMFI Registered Mutual Fund Distributor</strong></p>
  <p>This report is for educational purposes only and does not constitute financial advice.</p>
  <p>Mutual fund investments are subject to market risks. Please read all scheme-related documents carefully.</p>
</div>

<div class="no-print" style="text-align:center;margin-top:24px">
  <button onclick="window.print()" style="padding:10px 24px;background:#7c3aed;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-weight:600">
    Print / Save as PDF
  </button>
</div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Financial_Health_Report_${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const progress = ((currentQ + (showResults ? 1 : 0)) / totalQuestions) * 100;

  // Results
  const riskResult = computeRiskProfile(answers);
  const healthResult = computeHealthResult(answers);
  const recommendations = generateRecommendations(answers, riskResult, healthResult);

  if (showResults) {
    const goodAreas = healthResult.areas.filter((a) => a.status === 'good').length;
    const warningAreas = healthResult.areas.filter((a) => a.status === 'warning').length;
    const criticalAreas = healthResult.areas.filter((a) => a.status === 'critical').length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Risk Profile & Financial Health</h1>
            <p className="text-gray-500 mb-4">Personalized analysis based on your responses</p>
            <button
              onClick={downloadReport}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium text-sm shadow-md"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>

          {/* Two-column results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Risk Profile Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 text-white" style={{ backgroundColor: riskResult.color }}>
                <p className="text-sm opacity-80 mb-1">Your Risk Profile</p>
                <p className="text-3xl font-bold">{riskResult.profile}</p>
                <p className="text-sm opacity-70 mt-1">Score: {riskResult.score}/{riskResult.maxScore}</p>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-5">{riskResult.description}</p>

                <h4 className="text-sm font-semibold text-gray-800 mb-3">Recommended Asset Allocation</h4>
                <div className="flex h-6 rounded-full overflow-hidden mb-3">
                  <div className="bg-blue-500 flex items-center justify-center text-white text-xs font-semibold" style={{ width: `${riskResult.allocation.equity}%` }}>
                    {riskResult.allocation.equity}%
                  </div>
                  <div className="bg-green-500 flex items-center justify-center text-white text-xs font-semibold" style={{ width: `${riskResult.allocation.debt}%` }}>
                    {riskResult.allocation.debt}%
                  </div>
                  <div className="bg-yellow-500 flex items-center justify-center text-white text-xs font-semibold" style={{ width: `${riskResult.allocation.gold}%` }}>
                    {riskResult.allocation.gold}%
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-gray-500 mb-5">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full" />Equity</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full" />Debt</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-500 rounded-full" />Gold</span>
                </div>

                <h4 className="text-sm font-semibold text-gray-800 mb-2">Suitable Fund Types</h4>
                <div className="flex flex-wrap gap-2">
                  {riskResult.fundTypes.map((f) => (
                    <span key={f} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full">{f}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial Health Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 text-white" style={{ backgroundColor: healthResult.color }}>
                <p className="text-sm opacity-80 mb-1">Financial Health</p>
                <p className="text-3xl font-bold">{healthResult.grade}</p>
                <p className="text-sm opacity-70 mt-1">Score: {healthResult.score}/{healthResult.maxScore}</p>
              </div>
              <div className="p-6">
                <div className="flex gap-4 mb-5">
                  <div className="flex items-center gap-1 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-semibold text-green-600">{goodAreas}</span>
                    <span className="text-gray-400">good</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold text-yellow-600">{warningAreas}</span>
                    <span className="text-gray-400">warning</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="font-semibold text-red-600">{criticalAreas}</span>
                    <span className="text-gray-400">critical</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {healthResult.areas.map((area) => (
                    <div key={area.label} className="flex items-start gap-2.5">
                      <div className={`mt-0.5 flex-shrink-0 p-1 rounded ${
                        area.status === 'good' ? 'bg-green-50' : area.status === 'warning' ? 'bg-yellow-50' : 'bg-red-50'
                      }`}>
                        <area.icon className={`w-3.5 h-3.5 ${
                          area.status === 'good' ? 'text-green-500' : area.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                        }`} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{area.label}</p>
                        <p className="text-xs text-gray-500">{area.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Personalized Action Plan */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Target className="w-5 h-5 text-violet-600" />
              Your Personalized Action Plan
            </h2>
            <p className="text-sm text-gray-500 mb-6">Prioritized steps based on your assessment</p>

            <div className="space-y-4">
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border flex items-start gap-4 ${
                    rec.priority === 'high'
                      ? 'bg-red-50 border-red-100'
                      : rec.priority === 'medium'
                      ? 'bg-amber-50 border-amber-100'
                      : 'bg-blue-50 border-blue-100'
                  }`}
                >
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    rec.priority === 'high' ? 'bg-red-100' : rec.priority === 'medium' ? 'bg-amber-100' : 'bg-blue-100'
                  }`}>
                    <rec.icon className={`w-5 h-5 ${
                      rec.priority === 'high' ? 'text-red-600' : rec.priority === 'medium' ? 'text-amber-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold uppercase ${
                        rec.priority === 'high' ? 'text-red-600' : rec.priority === 'medium' ? 'text-amber-600' : 'text-blue-600'
                      }`}>
                        {rec.priority} priority
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{rec.title}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{rec.description}</p>
                    {rec.actionLabel && rec.actionTab && onNavigate && (
                      <button
                        onClick={() => onNavigate(rec.actionTab!)}
                        className="mt-2 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        {rec.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-violet-600 to-blue-600 rounded-2xl p-8 text-white text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Want Expert Guidance?</h3>
            <p className="text-violet-100 mb-6">
              Share this assessment with Nandalal for a personalized investment plan tailored to your goals and risk appetite.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {onNavigate && (
                <button
                  onClick={() => onNavigate('calculators')}
                  className="px-6 py-3 bg-white text-violet-700 font-semibold rounded-xl hover:bg-violet-50 transition-all flex items-center gap-2"
                >
                  <Target className="w-5 h-5" />
                  Start Investing
                </button>
              )}
              <button
                onClick={downloadReport}
                className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Report
              </button>
              <button
                onClick={restart}
                className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20 flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Retake Assessment
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-gray-100 rounded-xl text-xs text-gray-500 text-center">
            This assessment is for educational purposes only. It does not constitute financial advice.
            Consult a qualified financial advisor before making investment decisions.
            Mutual fund investments are subject to market risks.
          </div>
        </div>
      </div>
    );
  }

  // ---- Questionnaire UI ----
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-violet-600 rounded-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Risk Profiler</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Discover your risk profile and financial health in 3 minutes
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className={`font-semibold ${isRiskSection ? 'text-violet-600' : 'text-blue-600'}`}>
              {sectionLabel} - Question {sectionProgress}
            </span>
            <span className="text-gray-400">{currentQ + 1} of {totalQuestions}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: isRiskSection ? '#7c3aed' : '#3b82f6',
              }}
            />
          </div>
          {/* Section indicator */}
          <div className="flex mt-3 gap-1">
            <div className={`flex-1 h-1 rounded-full ${currentQ < riskQuestions.length ? 'bg-violet-400' : 'bg-violet-200'}`} />
            <div className={`flex-1 h-1 rounded-full ${currentQ >= riskQuestions.length ? 'bg-blue-400' : 'bg-blue-200'}`} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">Risk Profile</span>
            <span className="text-xs text-gray-400">Financial Health</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{currentQuestion.text}</h2>
          {currentQuestion.subtitle && (
            <p className="text-sm text-gray-500 mb-6">{currentQuestion.subtitle}</p>
          )}
          {!currentQuestion.subtitle && <div className="mb-6" />}

          <div className="space-y-3">
            {currentQuestion.options.map((opt) => {
              const isSelected = answers[currentQuestion.id] === opt.value;
              return (
                <button
                  key={opt.label}
                  onClick={() => selectAnswer(opt.value)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'border-violet-500 bg-violet-50 text-violet-900'
                      : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-violet-500 bg-violet-500' : 'border-gray-300 group-hover:border-violet-300'
                    }`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="font-medium text-sm">{opt.label}</span>
                  </div>
                  {opt.tag && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{opt.tag}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={goBack}
            disabled={currentQ === 0}
            className="flex items-center gap-2 px-5 py-2.5 text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          {answers[currentQuestion.id] !== undefined && currentQ < totalQuestions - 1 && (
            <button
              onClick={() => setCurrentQ(currentQ + 1)}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {answers[currentQuestion.id] !== undefined && currentQ === totalQuestions - 1 && (
            <button
              onClick={() => setShowResults(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-lg hover:from-violet-700 hover:to-blue-700 transition-all font-semibold shadow-lg"
            >
              See Results
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
