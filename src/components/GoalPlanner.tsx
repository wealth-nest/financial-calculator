import { useState } from 'react';
import {
  Target,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  GraduationCap,
  Home as HomeIcon,
  Car,
  Plane,
  Umbrella,
  Heart,
  TrendingUp,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  RotateCcw,
  Info,
  Users,
  Baby,
  UserCheck,
  Wallet,
  BarChart3,
  IndianRupee,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// ---- Utility ----
const fmt = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmt2 = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmtLakh = (n: number) => {
  if (n >= 10000000) return `${fmt2(n / 10000000)} Cr`;
  if (n >= 100000) return `${fmt2(n / 100000)} L`;
  return `Rs ${fmt(n)}`;
};

// ---- Types ----
type GoalType = 'retirement' | 'child_education' | 'home_purchase' | 'car_purchase' | 'vacation' | 'emergency_fund' | 'wedding' | 'wealth_creation' | 'custom';

interface GoalConfig {
  type: GoalType;
  label: string;
  icon: typeof Target;
  defaultTimeline: number;
  defaultAmount: number;
  color: string;
  inflationRate: number;
  description: string;
}

interface Question {
  id: string;
  section: 'risk' | 'health';
  text: string;
  subtitle?: string;
  options: { label: string; value: number; tag?: string }[];
}

interface YearAllocation {
  year: number;
  equity: number;
  debt: number;
  gold: number;
  yearsToGoal: number;
}

interface FundRecommendation {
  category: string;
  allocation: number;
  assetClass: 'equity' | 'debt' | 'gold';
  rationale: string;
}

interface HealthArea {
  label: string;
  icon: typeof Shield;
  status: 'good' | 'warning' | 'critical';
  message: string;
  action?: string;
}

interface GoalPlanResult {
  inflationAdjustedTarget: number;
  fvCurrentSavings: number;
  gap: number;
  sipWithoutStepup: number;
  sipWithStepup: number;
  stepupPct: number;
  blendedReturn: number;
  initialAllocation: { equity: number; debt: number; gold: number };
  glidePathData: YearAllocation[];
  fundRecommendations: FundRecommendation[];
  riskProfile: string;
  riskScore: number;
  riskMaxScore: number;
  riskDescription: string;
  healthGrade: string;
  healthScore: number;
  healthMaxScore: number;
  healthAreas: HealthArea[];
  warnings: string[];
  actionItems: { priority: 'high' | 'medium' | 'low'; text: string; reason: string }[];
}

interface GoalPlannerProps {
  onNavigate?: (tab: string) => void;
}

// ---- Goal Configs ----
const GOAL_CONFIGS: GoalConfig[] = [
  { type: 'retirement', label: 'Retirement', icon: Clock, defaultTimeline: 25, defaultAmount: 50000000, color: '#7c3aed', inflationRate: 6, description: 'Build a corpus for a comfortable retired life' },
  { type: 'child_education', label: 'Child Education', icon: GraduationCap, defaultTimeline: 15, defaultAmount: 5000000, color: '#3b82f6', inflationRate: 10, description: 'Fund your child\'s higher education in India or abroad' },
  { type: 'home_purchase', label: 'Home Purchase', icon: HomeIcon, defaultTimeline: 7, defaultAmount: 3000000, color: '#f59e0b', inflationRate: 7, description: 'Save for a down payment or full home purchase' },
  { type: 'car_purchase', label: 'Car Purchase', icon: Car, defaultTimeline: 3, defaultAmount: 1000000, color: '#ef4444', inflationRate: 5, description: 'Plan your next vehicle purchase' },
  { type: 'vacation', label: 'Dream Vacation', icon: Plane, defaultTimeline: 2, defaultAmount: 500000, color: '#06b6d4', inflationRate: 6, description: 'Plan a memorable family trip' },
  { type: 'emergency_fund', label: 'Emergency Fund', icon: Umbrella, defaultTimeline: 1, defaultAmount: 300000, color: '#10b981', inflationRate: 6, description: 'Build a safety net of 6 months\' expenses' },
  { type: 'wedding', label: 'Wedding', icon: Heart, defaultTimeline: 5, defaultAmount: 2500000, color: '#ec4899', inflationRate: 8, description: 'Plan for your own or your child\'s wedding' },
  { type: 'wealth_creation', label: 'Wealth Creation', icon: TrendingUp, defaultTimeline: 15, defaultAmount: 10000000, color: '#8b5cf6', inflationRate: 6, description: 'Build long-term wealth for financial freedom' },
  { type: 'custom', label: 'Custom Goal', icon: Target, defaultTimeline: 10, defaultAmount: 1000000, color: '#6b7280', inflationRate: 6, description: 'Set your own goal with a custom timeline' },
];

// ---- Assessment Questions (9 risk + 10 health/dependent) ----
const QUESTIONS: Question[] = [
  // Risk (7)
  {
    id: 'r1', section: 'risk',
    text: 'What is your age group?',
    subtitle: 'Age affects investment horizon and risk capacity',
    options: [
      { label: 'Below 25', value: 5, tag: 'Long runway' },
      { label: '25 - 35', value: 4 },
      { label: '36 - 45', value: 3 },
      { label: '46 - 55', value: 2 },
      { label: '56 and above', value: 1, tag: 'Capital preservation' },
    ],
  },
  {
    id: 'r2', section: 'risk',
    text: 'How stable is your income?',
    subtitle: 'Stable income allows higher risk tolerance',
    options: [
      { label: 'Government / PSU job', value: 5, tag: 'Very stable' },
      { label: 'Private salaried (large company)', value: 4 },
      { label: 'Self-employed with steady income', value: 3 },
      { label: 'Freelance / contract-based', value: 2 },
      { label: 'Irregular / seasonal income', value: 1 },
    ],
  },
  {
    id: 'r3', section: 'risk',
    text: 'What is your investment experience?',
    options: [
      { label: 'No experience — I am new', value: 1 },
      { label: 'Basic — FDs, PPF, savings account', value: 2 },
      { label: 'Moderate — Mutual funds, some stocks', value: 3 },
      { label: 'Good — Active stock trading, MF portfolio', value: 4 },
      { label: 'Expert — Derivatives, global markets', value: 5 },
    ],
  },
  {
    id: 'r4', section: 'risk',
    text: 'If your investment drops 20% in a month, what would you do?',
    subtitle: 'This reveals your emotional response to volatility',
    options: [
      { label: 'Sell everything immediately', value: 1 },
      { label: 'Sell some to reduce losses', value: 2 },
      { label: 'Hold and wait for recovery', value: 3 },
      { label: 'Invest more to average down', value: 5, tag: 'Contrarian' },
    ],
  },
  {
    id: 'r5', section: 'risk',
    text: 'Which return expectation matches your preference?',
    options: [
      { label: '6-7% (FD-like, very safe)', value: 1 },
      { label: '8-10% (slightly above FD, low risk)', value: 2 },
      { label: '10-14% (moderate growth, some ups & downs)', value: 3 },
      { label: '14-18% (aggressive growth, significant volatility)', value: 4 },
      { label: '18%+ (max growth, willing to accept big swings)', value: 5 },
    ],
  },
  {
    id: 'r6', section: 'risk',
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
    id: 'r7', section: 'risk',
    text: 'How long can you stay invested without needing this money?',
    subtitle: 'Apart from this specific goal',
    options: [
      { label: 'Less than 1 year', value: 1 },
      { label: '1 - 3 years', value: 2 },
      { label: '3 - 5 years', value: 3 },
      { label: '5 - 10 years', value: 4 },
      { label: 'More than 10 years', value: 5 },
    ],
  },

  // Health & Dependents (10)
  {
    id: 'h1', section: 'health',
    text: 'Do you have an emergency fund?',
    subtitle: 'Should cover 6 months of household expenses',
    options: [
      { label: 'No emergency fund', value: 1 },
      { label: 'Less than 3 months\' expenses', value: 2 },
      { label: '3 - 6 months\' expenses', value: 3 },
      { label: 'More than 6 months\' expenses', value: 5 },
    ],
  },
  {
    id: 'h2', section: 'health',
    text: 'What are your existing EMIs as a percentage of income?',
    subtitle: 'Home loan, car loan, personal loan EMIs combined',
    options: [
      { label: 'No EMIs', value: 5 },
      { label: 'Below 20% of income', value: 4 },
      { label: '20% - 35% of income', value: 3 },
      { label: '35% - 50% of income', value: 2 },
      { label: 'Above 50% of income', value: 1, tag: 'Debt stress' },
    ],
  },
  {
    id: 'h3', section: 'health',
    text: 'Do you have health insurance for yourself?',
    options: [
      { label: 'No health insurance', value: 1 },
      { label: 'Only employer-provided', value: 2 },
      { label: 'Personal policy below Rs 10 lakh', value: 3 },
      { label: 'Comprehensive cover Rs 10 lakh+ or super top-up', value: 5 },
    ],
  },
  {
    id: 'h4', section: 'health',
    text: 'Are your spouse and children covered under health insurance?',
    subtitle: 'A family floater or individual policies for each member',
    options: [
      { label: 'Not applicable — no spouse/children', value: 5, tag: 'N/A' },
      { label: 'No, they are not covered', value: 1 },
      { label: 'Only under employer\'s group policy', value: 2 },
      { label: 'Separate family floater below Rs 10 lakh', value: 3 },
      { label: 'Comprehensive family cover Rs 10 lakh+', value: 5 },
    ],
  },
  {
    id: 'h5', section: 'health',
    text: 'Are your parents covered under health insurance?',
    subtitle: 'Senior citizen health costs can be very high',
    options: [
      { label: 'Not applicable — parents not dependent', value: 5, tag: 'N/A' },
      { label: 'No, parents have no coverage', value: 1 },
      { label: 'Only basic government scheme (PMJAY etc.)', value: 2 },
      { label: 'Personal / family floater that includes parents', value: 3 },
      { label: 'Dedicated senior citizen policy Rs 5 lakh+', value: 5 },
    ],
  },
  {
    id: 'h6', section: 'health',
    text: 'Do you have term life insurance?',
    subtitle: 'Protects your family\'s financial future',
    options: [
      { label: 'No life insurance at all', value: 1 },
      { label: 'Only LIC endowment / ULIP', value: 2, tag: 'Not adequate' },
      { label: 'Term plan but less than 10x annual income', value: 3 },
      { label: 'Adequate term cover (10x+ annual income)', value: 5 },
    ],
  },
  {
    id: 'h7', section: 'health',
    text: 'How many financial dependents do you have?',
    subtitle: 'Spouse (non-earning), children, parents, others',
    options: [
      { label: 'None — I support only myself', value: 5 },
      { label: '1 dependent', value: 4 },
      { label: '2-3 dependents', value: 3 },
      { label: '4-5 dependents', value: 2 },
      { label: '6 or more dependents', value: 1 },
    ],
  },
  {
    id: 'h8', section: 'health',
    text: 'Do you have a will or succession plan?',
    subtitle: 'Especially important if you have dependents',
    options: [
      { label: 'No, haven\'t thought about it', value: 1 },
      { label: 'Nominees on accounts but no will', value: 2 },
      { label: 'Have a basic will', value: 4 },
      { label: 'Comprehensive will and estate plan', value: 5 },
    ],
  },
  {
    id: 'h9', section: 'health',
    text: 'Are your children\'s future expenses (education, wedding) being planned for?',
    subtitle: 'Dedicated investments for children\'s milestones',
    options: [
      { label: 'Not applicable — no children', value: 5, tag: 'N/A' },
      { label: 'No, haven\'t started planning', value: 1 },
      { label: 'Thinking about it but no dedicated investments', value: 2 },
      { label: 'Some investments earmarked (FD/gold/Sukanya)', value: 3 },
      { label: 'Dedicated SIPs / investments for each child\'s goals', value: 5 },
    ],
  },
  {
    id: 'h10', section: 'health',
    text: 'Do you track your household expenses and budget?',
    options: [
      { label: 'No idea where money goes', value: 1 },
      { label: 'Rough idea but no tracking', value: 2 },
      { label: 'Track major expenses', value: 3 },
      { label: 'Detailed budgeting and expense tracking', value: 5 },
    ],
  },
];

// ---- Scoring Logic ----

function computeRiskProfile(answers: Record<string, number>) {
  const riskQs = QUESTIONS.filter(q => q.section === 'risk');
  let score = 0, maxScore = 0;
  for (const q of riskQs) {
    score += answers[q.id] || 0;
    maxScore += Math.max(...q.options.map(o => o.value));
  }
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;

  let profile: string, description: string, allocation: { equity: number; debt: number; gold: number };
  if (pct <= 30) {
    profile = 'Conservative';
    description = 'You prefer safety over returns. Capital preservation is your priority.';
    allocation = { equity: 20, debt: 65, gold: 15 };
  } else if (pct <= 50) {
    profile = 'Moderately Conservative';
    description = 'You want some growth but with limited downside. Stability matters.';
    allocation = { equity: 35, debt: 50, gold: 15 };
  } else if (pct <= 65) {
    profile = 'Moderate';
    description = 'You balance growth and safety. You can handle moderate volatility.';
    allocation = { equity: 55, debt: 35, gold: 10 };
  } else if (pct <= 80) {
    profile = 'Moderately Aggressive';
    description = 'You seek higher returns and can tolerate significant volatility.';
    allocation = { equity: 70, debt: 20, gold: 10 };
  } else {
    profile = 'Aggressive';
    description = 'You are a high-risk, high-reward investor with maximum equity exposure.';
    allocation = { equity: 85, debt: 10, gold: 5 };
  }

  return { profile, description, allocation, score, maxScore };
}

function computeHealthResult(answers: Record<string, number>) {
  const healthQs = QUESTIONS.filter(q => q.section === 'health');
  let score = 0, maxScore = 0;
  for (const q of healthQs) {
    score += answers[q.id] || 0;
    maxScore += Math.max(...q.options.map(o => o.value));
  }
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;

  const areas: HealthArea[] = [];

  // Emergency fund
  const ef = answers['h1'] || 0;
  areas.push({
    label: 'Emergency Fund', icon: Umbrella,
    status: ef >= 4 ? 'good' : ef >= 3 ? 'warning' : 'critical',
    message: ef >= 4 ? 'Great! 6+ months of expenses saved.' : ef >= 3 ? '3-6 months covered. Try to build to 6 months.' : 'No adequate emergency fund. One unexpected expense could derail your goals.',
    action: ef < 4 ? 'Build emergency fund of 6 months\' expenses in a liquid fund' : undefined,
  });

  // Debt load
  const dl = answers['h2'] || 0;
  areas.push({
    label: 'Debt Management', icon: Wallet,
    status: dl >= 4 ? 'good' : dl >= 3 ? 'warning' : 'critical',
    message: dl >= 4 ? 'Low/no EMI burden — excellent position to invest.' : dl >= 3 ? 'Manageable debt. Avoid new loans while building investments.' : 'High EMI burden is limiting your investment capacity.',
    action: dl < 3 ? 'Prioritize paying off high-interest loans (credit cards, personal loans) first' : undefined,
  });

  // Self health insurance
  const hi = answers['h3'] || 0;
  areas.push({
    label: 'Your Health Cover', icon: Shield,
    status: hi >= 4 ? 'good' : hi >= 2 ? 'warning' : 'critical',
    message: hi >= 4 ? 'Well covered with comprehensive health insurance.' : hi >= 2 ? 'Employer insurance alone is risky. Get a personal policy of Rs 10-15 lakh.' : 'No health insurance. One hospitalization can wipe out years of savings.',
    action: hi < 4 ? 'Get a personal health insurance policy (Rs 10-15 lakh)' : undefined,
  });

  // Spouse/children health
  const fh = answers['h4'] || 0;
  const fhApplicable = fh < 5 || (fh === 5 && answers['h4'] !== 5);
  // Check if N/A was selected (first option value=5 with tag N/A)
  const fhIsNA = fh === 5 && QUESTIONS.find(q => q.id === 'h4')?.options[0].value === 5;
  if (!fhIsNA || fh < 5) {
    areas.push({
      label: 'Family Health Cover', icon: Heart,
      status: fh >= 4 ? 'good' : fh >= 2 ? 'warning' : 'critical',
      message: fh >= 4 ? 'Spouse and children well covered.' : fh >= 2 ? 'Employer group policy won\'t cover family after job change. Get a family floater.' : 'Your family has no health coverage — a major financial risk.',
      action: fh < 4 && fhApplicable ? 'Get a family floater health policy (Rs 10-15 lakh) covering spouse & children' : undefined,
    });
  }

  // Parents health
  const ph = answers['h5'] || 0;
  const phIsNA = ph === 5;
  if (!phIsNA || ph < 5) {
    areas.push({
      label: 'Parents\' Health Cover', icon: Users,
      status: ph >= 4 ? 'good' : ph >= 2 ? 'warning' : 'critical',
      message: ph >= 4 ? 'Parents have dedicated health coverage.' : ph >= 2 ? 'Basic coverage may not be enough for senior citizens. Consider a dedicated senior citizen policy.' : 'Parents have no health insurance. Senior citizen medical costs can be devastating.',
      action: ph < 4 ? 'Get a senior citizen health policy for parents (Rs 5-10 lakh)' : undefined,
    });
  }

  // Term life
  const ti = answers['h6'] || 0;
  areas.push({
    label: 'Life Insurance', icon: Shield,
    status: ti >= 4 ? 'good' : ti >= 2 ? 'warning' : 'critical',
    message: ti >= 4 ? 'Adequate term insurance in place.' : ti >= 2 ? 'LIC/ULIP doesn\'t provide adequate cover. Get term plan of 10-15x income.' : 'No life protection. Your dependents are financially vulnerable.',
    action: ti < 4 ? 'Buy a term insurance plan (10-15x annual income)' : undefined,
  });

  // Dependents
  const dep = answers['h7'] || 0;
  if (dep <= 2) {
    areas.push({
      label: 'Dependent Load', icon: Users,
      status: 'warning',
      message: `You support ${dep === 1 ? '4-5' : '6+'} dependents. This significantly impacts your risk capacity and savings ability.`,
      action: 'Factor higher expenses into goal planning. Consider increasing term insurance cover.',
    });
  }

  // Will / succession
  const will = answers['h8'] || 0;
  const depCount = answers['h7'] || 0;
  if (depCount < 5) { // has dependents
    areas.push({
      label: 'Estate Planning', icon: BarChart3,
      status: will >= 4 ? 'good' : will >= 2 ? 'warning' : 'critical',
      message: will >= 4 ? 'Will and nominations in place.' : will >= 2 ? 'Nominees set but a will ensures smooth succession for dependents.' : 'No will. Your assets may face legal complications — risky when you have dependents.',
      action: will < 4 ? 'Create a will and update nominees on all accounts' : undefined,
    });
  }

  // Children's planning
  const cp = answers['h9'] || 0;
  const cpIsNA = cp === 5;
  if (!cpIsNA || cp < 5) {
    areas.push({
      label: 'Children\'s Future Planning', icon: Baby,
      status: cp >= 4 ? 'good' : cp >= 2 ? 'warning' : 'critical',
      message: cp >= 4 ? 'Dedicated investments for children\'s milestones in place.' : cp >= 2 ? 'Thinking about it is good — now start dedicated SIPs for each child\'s goals.' : 'No plan for children\'s education or wedding. Start early — education inflation is 10-12%.',
      action: cp < 4 ? 'Start dedicated SIPs for children\'s education (consider Sukanya Samriddhi for daughters)' : undefined,
    });
  }

  // Budgeting
  const bud = answers['h10'] || 0;
  areas.push({
    label: 'Budgeting', icon: Wallet,
    status: bud >= 4 ? 'good' : bud >= 2 ? 'warning' : 'critical',
    message: bud >= 4 ? 'Disciplined budgeting and expense tracking.' : bud >= 2 ? 'Rough tracking only. Use an app to monitor spending.' : 'No expense tracking. You may be overspending without knowing.',
    action: bud < 3 ? 'Start tracking expenses using an app or spreadsheet' : undefined,
  });

  let grade: string;
  if (pct >= 80) grade = 'Excellent';
  else if (pct >= 60) grade = 'Good';
  else if (pct >= 40) grade = 'Needs Improvement';
  else grade = 'Critical';

  return { grade, score, maxScore, areas };
}

// ---- Asset allocation adjusted for timeline ----
function adjustAllocationForTimeline(
  baseAllocation: { equity: number; debt: number; gold: number },
  timelineYears: number,
): { equity: number; debt: number; gold: number } {
  let { equity, debt, gold } = baseAllocation;

  if (timelineYears <= 1) {
    equity = Math.min(equity, 10);
  } else if (timelineYears <= 3) {
    equity = Math.min(equity, 30);
  } else if (timelineYears <= 5) {
    equity = Math.min(equity, 50);
  }
  // Redistribute difference to debt
  const reduced = baseAllocation.equity - equity;
  debt += reduced;

  return { equity, debt, gold };
}

// ---- Glide path ----
function computeGlidePath(
  initialAlloc: { equity: number; debt: number; gold: number },
  timelineYears: number,
): YearAllocation[] {
  const data: YearAllocation[] = [];
  const minEquity = 10;
  const glideStart = Math.min(7, timelineYears); // start reducing equity 7 years before goal

  for (let year = 0; year <= timelineYears; year++) {
    const yearsToGoal = timelineYears - year;
    let equity: number;

    if (yearsToGoal >= glideStart) {
      equity = initialAlloc.equity;
    } else if (yearsToGoal <= 0) {
      equity = minEquity;
    } else {
      equity = Math.round(minEquity + ((initialAlloc.equity - minEquity) * yearsToGoal) / glideStart);
    }

    const gold = initialAlloc.gold;
    const debt = 100 - equity - gold;
    data.push({ year, equity, debt, gold, yearsToGoal });
  }

  return data;
}

// ---- SIP calculations ----
function calculateSIP(corpus: number, annualReturn: number, years: number): number {
  if (corpus <= 0 || years <= 0) return 0;
  const r = annualReturn / 12;
  const n = years * 12;
  if (r === 0) return corpus / n;
  return (corpus * r) / (Math.pow(1 + r, n) - 1);
}

function calculateStepUpSIP(corpus: number, annualReturn: number, years: number, stepUpPct: number): number {
  if (corpus <= 0 || years <= 0) return 0;
  let lo = 0, hi = corpus;
  for (let iter = 0; iter < 100; iter++) {
    const mid = (lo + hi) / 2;
    let accumulated = 0;
    let currentSIP = mid;
    const monthlyRate = annualReturn / 12;

    for (let yr = 0; yr < years; yr++) {
      for (let m = 0; m < 12; m++) {
        accumulated = (accumulated + currentSIP) * (1 + monthlyRate);
      }
      currentSIP *= (1 + stepUpPct);
    }

    if (Math.abs(accumulated - corpus) < 1) break;
    if (accumulated < corpus) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function blendedReturn(alloc: { equity: number; debt: number; gold: number }, timelineYears: number): number {
  const eqReturn = timelineYears > 10 ? 0.12 : timelineYears > 5 ? 0.11 : timelineYears > 3 ? 0.10 : 0.08;
  const debtReturn = 0.07;
  const goldReturn = 0.08;
  return (alloc.equity * eqReturn + alloc.debt * debtReturn + alloc.gold * goldReturn) / 100;
}

// ---- Fund recommendations ----
function getFundRecommendations(
  riskProfile: string,
  timelineYears: number,
  alloc: { equity: number; debt: number; gold: number },
): FundRecommendation[] {
  const recs: FundRecommendation[] = [];

  if (alloc.equity > 0) {
    if (timelineYears > 10) {
      if (riskProfile.includes('Aggressive')) {
        recs.push({ category: 'Small Cap Fund', allocation: Math.round(alloc.equity * 0.25), assetClass: 'equity', rationale: 'Your long timeline (10+ years) and aggressive profile allow small caps. They are volatile short-term but historically deliver 15-18% CAGR over long periods.' });
        recs.push({ category: 'Mid Cap Fund', allocation: Math.round(alloc.equity * 0.30), assetClass: 'equity', rationale: 'Mid caps offer a balance of growth potential with your long horizon absorbing interim volatility.' });
        recs.push({ category: 'Flexi Cap / Large Cap Fund', allocation: Math.round(alloc.equity * 0.25), assetClass: 'equity', rationale: 'Core stability for your portfolio. Large caps provide lower volatility and steady compounding.' });
        recs.push({ category: 'International / Thematic Fund', allocation: Math.round(alloc.equity * 0.20), assetClass: 'equity', rationale: 'Geographic diversification reduces India-specific risk. Consider US index or technology funds.' });
      } else if (riskProfile.includes('Moderate')) {
        recs.push({ category: 'Flexi Cap Fund', allocation: Math.round(alloc.equity * 0.35), assetClass: 'equity', rationale: 'Flexi cap funds dynamically shift between large, mid, and small caps. Suits your moderate risk profile over a long horizon.' });
        recs.push({ category: 'Large & Mid Cap Fund', allocation: Math.round(alloc.equity * 0.35), assetClass: 'equity', rationale: 'Combines stability of large caps with growth potential of mid caps — ideal for moderate investors.' });
        recs.push({ category: 'Index Fund (Nifty 50)', allocation: Math.round(alloc.equity * 0.30), assetClass: 'equity', rationale: 'Low-cost market exposure. Over 10+ years, index funds beat most active funds after fees.' });
      } else {
        recs.push({ category: 'Large Cap / Index Fund', allocation: Math.round(alloc.equity * 0.50), assetClass: 'equity', rationale: 'Your conservative profile means prioritizing stability. Large caps and index funds have lower drawdowns during crashes.' });
        recs.push({ category: 'Balanced Advantage Fund', allocation: Math.round(alloc.equity * 0.50), assetClass: 'equity', rationale: 'Automatically shifts between equity and debt based on valuations. Reduces volatility while capturing upside.' });
      }
    } else if (timelineYears > 5) {
      recs.push({ category: 'Large Cap / Flexi Cap Fund', allocation: Math.round(alloc.equity * 0.50), assetClass: 'equity', rationale: `With ${timelineYears} years, large caps provide growth with reasonable stability. Flexi caps offer manager flexibility.` });
      recs.push({ category: 'Balanced Advantage Fund', allocation: Math.round(alloc.equity * 0.50), assetClass: 'equity', rationale: 'Auto-rebalancing between equity/debt provides a built-in glide path as markets fluctuate.' });
    } else if (timelineYears > 3) {
      recs.push({ category: 'Balanced Advantage / Conservative Hybrid Fund', allocation: alloc.equity, assetClass: 'equity', rationale: `Short ${timelineYears}-year timeline limits equity exposure. Hybrid funds provide some equity upside with debt cushion.` });
    } else {
      recs.push({ category: 'Conservative Hybrid / Equity Savings Fund', allocation: alloc.equity, assetClass: 'equity', rationale: 'Very short timeline. Equity savings funds keep equity below 35% with arbitrage — lower risk, better tax efficiency than debt.' });
    }
  }

  if (alloc.debt > 0) {
    if (timelineYears <= 1) {
      recs.push({ category: 'Liquid Fund', allocation: alloc.debt, assetClass: 'debt', rationale: 'Goal is very near. Liquid funds offer capital safety with 5-6% returns and same/next day withdrawal.' });
    } else if (timelineYears <= 3) {
      recs.push({ category: 'Short Duration / Ultra Short Fund', allocation: alloc.debt, assetClass: 'debt', rationale: 'Short-term debt funds give better returns than FDs with moderate safety for your timeline.' });
    } else {
      recs.push({ category: 'Short to Medium Duration Debt Fund', allocation: Math.round(alloc.debt * 0.60), assetClass: 'debt', rationale: 'Provides steady 7-8% returns with low volatility. Acts as portfolio ballast during equity downturns.' });
      recs.push({ category: 'Corporate Bond / Banking & PSU Fund', allocation: Math.round(alloc.debt * 0.40), assetClass: 'debt', rationale: 'High-quality credit funds with slightly better yields. Banking & PSU funds have implicit government backing.' });
    }
  }

  if (alloc.gold > 0) {
    recs.push({ category: 'Gold ETF / Sovereign Gold Bond', allocation: alloc.gold, assetClass: 'gold', rationale: 'Gold hedges against inflation and rupee depreciation. SGBs give 2.5% annual interest bonus over gold price appreciation.' });
  }

  return recs;
}

// ---- Generate full plan ----
function generateGoalPlan(
  goalInputs: { goalType: GoalType; targetAmount: number; currentSavings: number; timelineYears: number; monthlyIncome: number; customGoalName: string },
  answers: Record<string, number>,
): GoalPlanResult {
  const goalConfig = GOAL_CONFIGS.find(g => g.type === goalInputs.goalType)!;
  const risk = computeRiskProfile(answers);
  const health = computeHealthResult(answers);

  // Adjust allocation for timeline
  const initialAllocation = adjustAllocationForTimeline(risk.allocation, goalInputs.timelineYears);
  const expectedReturn = blendedReturn(initialAllocation, goalInputs.timelineYears);

  // Inflation-adjusted target
  const inflationAdjustedTarget = goalInputs.targetAmount * Math.pow(1 + goalConfig.inflationRate / 100, goalInputs.timelineYears);

  // Future value of current savings
  const fvCurrentSavings = goalInputs.currentSavings * Math.pow(1 + expectedReturn, goalInputs.timelineYears);

  // Gap
  const gap = Math.max(0, inflationAdjustedTarget - fvCurrentSavings);

  // SIP calculations
  const sipWithoutStepup = calculateSIP(gap, expectedReturn, goalInputs.timelineYears);
  const stepupPct = 0.10;
  const sipWithStepup = calculateStepUpSIP(gap, expectedReturn, goalInputs.timelineYears, stepupPct);

  // Glide path
  const glidePathData = computeGlidePath(initialAllocation, goalInputs.timelineYears);

  // Fund recommendations
  const fundRecommendations = getFundRecommendations(risk.profile, goalInputs.timelineYears, initialAllocation);

  // Warnings
  const warnings: string[] = [];
  if (sipWithoutStepup > goalInputs.monthlyIncome * 0.5) {
    warnings.push('The required SIP exceeds 50% of your monthly income. Consider extending the timeline, reducing the target, or increasing step-up percentage.');
  }
  if (sipWithoutStepup > goalInputs.monthlyIncome * 0.3 && sipWithoutStepup <= goalInputs.monthlyIncome * 0.5) {
    warnings.push('The required SIP is 30-50% of your income. This is aggressive — ensure your other essentials and emergency fund are covered.');
  }
  if (goalInputs.timelineYears <= 2 && initialAllocation.equity > 20) {
    warnings.push('Short timeline with equity exposure carries risk. Be prepared for potential shortfall if markets decline near your goal date.');
  }
  const emiLoad = answers['h2'] || 0;
  if (emiLoad <= 2) {
    warnings.push('Your high EMI burden limits investable surplus. Consider prepaying high-interest loans first.');
  }
  if ((answers['h3'] || 0) <= 2) {
    warnings.push('Without health insurance, a medical emergency could force you to break this investment. Get coverage first.');
  }
  if ((answers['h4'] || 0) <= 2 && (answers['h4'] || 0) > 0) {
    warnings.push('Your spouse/children lack adequate health coverage. One family medical emergency could derail this goal.');
  }
  if ((answers['h5'] || 0) <= 2 && (answers['h5'] || 0) > 0) {
    warnings.push('Parents without health insurance are a financial risk. Senior citizen hospitalization averages Rs 2-5 lakh.');
  }
  if ((answers['h1'] || 0) <= 2) {
    warnings.push('No emergency fund means you may need to redeem these goal investments during a crisis — destroying your plan. Build an emergency fund first.');
  }

  // Action items
  const actionItems: GoalPlanResult['actionItems'] = [];

  // Critical health actions
  for (const area of health.areas) {
    if (area.status === 'critical' && area.action) {
      actionItems.push({ priority: 'high', text: area.action, reason: `${area.label}: ${area.message}` });
    }
  }
  for (const area of health.areas) {
    if (area.status === 'warning' && area.action) {
      actionItems.push({ priority: 'medium', text: area.action, reason: `${area.label}: ${area.message}` });
    }
  }

  // Goal-specific actions
  if (gap > 0) {
    actionItems.push({
      priority: 'high',
      text: `Start a monthly SIP of Rs ${fmt(Math.ceil(sipWithStepup))} with 10% annual step-up`,
      reason: `To reach your inflation-adjusted goal of Rs ${fmtLakh(inflationAdjustedTarget)} in ${goalInputs.timelineYears} years.`,
    });
  }
  if (goalInputs.timelineYears > 5) {
    actionItems.push({
      priority: 'medium',
      text: `Review and rebalance your portfolio annually. Start shifting to debt ${Math.min(7, goalInputs.timelineYears)} years before goal date.`,
      reason: 'Glide path reduces equity risk as your goal approaches, protecting your accumulated corpus from market crashes.',
    });
  }
  if (goalInputs.timelineYears <= 3) {
    actionItems.push({
      priority: 'high',
      text: 'Keep majority in debt/liquid funds. Avoid equity for money needed within 3 years.',
      reason: 'Short timelines don\'t allow recovery from market downturns. Capital protection is priority.',
    });
  }

  return {
    inflationAdjustedTarget,
    fvCurrentSavings,
    gap,
    sipWithoutStepup,
    sipWithStepup,
    stepupPct,
    blendedReturn: expectedReturn,
    initialAllocation,
    glidePathData,
    fundRecommendations,
    riskProfile: risk.profile,
    riskScore: risk.score,
    riskMaxScore: risk.maxScore,
    riskDescription: risk.description,
    healthGrade: health.grade,
    healthScore: health.score,
    healthMaxScore: health.maxScore,
    healthAreas: health.areas,
    warnings,
    actionItems,
  };
}

// ---- PIE CHART COLORS ----
const ALLOC_COLORS: Record<string, string> = { equity: '#3b82f6', debt: '#10b981', gold: '#f59e0b' };

// ---- Download Report ----
function downloadReport(
  goalInputs: { goalType: GoalType; targetAmount: number; currentSavings: number; timelineYears: number; monthlyIncome: number; customGoalName: string },
  result: GoalPlanResult,
) {
  const goalConfig = GOAL_CONFIGS.find(g => g.type === goalInputs.goalType)!;
  const goalName = goalInputs.goalType === 'custom' ? goalInputs.customGoalName : goalConfig.label;

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Goal Plan - ${goalName} | Nandalal</title>
<style>
body { font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 30px; color: #1e293b; line-height: 1.6; }
h1 { color: #0d9488; border-bottom: 3px solid #0d9488; padding-bottom: 10px; }
h2 { color: #334155; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
.badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
.kpi { display: inline-block; background: #f1f5f9; border-radius: 12px; padding: 16px 24px; margin: 6px; text-align: center; min-width: 160px; }
.kpi .val { font-size: 22px; font-weight: 700; color: #0d9488; }
.kpi .lbl { font-size: 12px; color: #64748b; margin-top: 4px; }
table { width: 100%; border-collapse: collapse; margin: 16px 0; }
th, td { padding: 10px 14px; border: 1px solid #e2e8f0; text-align: left; font-size: 13px; }
th { background: #f8fafc; font-weight: 600; }
.warn { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px 14px; margin: 8px 0; border-radius: 6px; font-size: 13px; }
.critical { background: #fee2e2; border-left: 4px solid #ef4444; }
.good { background: #d1fae5; border-left: 4px solid #10b981; }
.action { padding: 10px 14px; margin: 6px 0; border-radius: 8px; font-size: 13px; }
.action.high { background: #fee2e2; border-left: 4px solid #ef4444; }
.action.medium { background: #fef3c7; border-left: 4px solid #f59e0b; }
.action.low { background: #dbeafe; border-left: 4px solid #3b82f6; }
.rec-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin: 8px 0; }
.disclaimer { font-size: 11px; color: #94a3b8; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
@media print { body { padding: 20px; } .no-print { display: none; } }
</style></head><body>
<div style="text-align:center;margin-bottom:30px;">
  <h1>Goal Plan: ${goalName}</h1>
  <p style="color:#64748b;">Generated by Nandalal Financial Planning Platform</p>
</div>

<h2>Goal Summary</h2>
<div style="text-align:center;">
  <div class="kpi"><div class="val">Rs ${fmtLakh(goalInputs.targetAmount)}</div><div class="lbl">Today's Target</div></div>
  <div class="kpi"><div class="val">Rs ${fmtLakh(result.inflationAdjustedTarget)}</div><div class="lbl">Inflation-Adjusted Target</div></div>
  <div class="kpi"><div class="val">${goalInputs.timelineYears} years</div><div class="lbl">Timeline</div></div>
  <div class="kpi"><div class="val">Rs ${fmtLakh(goalInputs.currentSavings)}</div><div class="lbl">Current Savings</div></div>
</div>

<h2>Your Risk Profile & Financial Health</h2>
<p><strong>Risk Profile:</strong> <span class="badge" style="background:#dbeafe;color:#1e40af;">${result.riskProfile}</span> (${result.riskScore}/${result.riskMaxScore})</p>
<p>${result.riskDescription}</p>
<p><strong>Financial Health:</strong> <span class="badge" style="background:${result.healthGrade === 'Excellent' || result.healthGrade === 'Good' ? '#d1fae5;color:#065f46' : result.healthGrade === 'Needs Improvement' ? '#fef3c7;color:#92400e' : '#fee2e2;color:#991b1b'}">${result.healthGrade}</span> (${result.healthScore}/${result.healthMaxScore})</p>

<h3>Health Assessment Areas</h3>
${result.healthAreas.map(a => `<div class="${a.status === 'good' ? 'good' : a.status === 'warning' ? 'warn' : 'warn critical'}">\n<strong>${a.label}:</strong> ${a.message}</div>`).join('\n')}

<h2>Investment Plan</h2>
<div style="text-align:center;">
  <div class="kpi"><div class="val">Rs ${fmt(Math.ceil(result.sipWithoutStepup))}</div><div class="lbl">Monthly SIP (Fixed)</div></div>
  <div class="kpi"><div class="val">Rs ${fmt(Math.ceil(result.sipWithStepup))}</div><div class="lbl">Monthly SIP (10% step-up)</div></div>
  <div class="kpi"><div class="val">${fmt2(result.blendedReturn * 100)}%</div><div class="lbl">Expected Return (blended)</div></div>
</div>

<h3>Recommended Asset Allocation</h3>
<table>
<tr><th>Asset Class</th><th>Allocation</th><th>Expected Return</th></tr>
<tr><td>Equity</td><td>${result.initialAllocation.equity}%</td><td>10-12% p.a.</td></tr>
<tr><td>Debt</td><td>${result.initialAllocation.debt}%</td><td>7% p.a.</td></tr>
<tr><td>Gold</td><td>${result.initialAllocation.gold}%</td><td>8% p.a.</td></tr>
</table>

<h3>Glide Path (Year-by-Year Allocation)</h3>
<p><em>Equity is gradually reduced as you approach your goal to protect accumulated wealth.</em></p>
<table>
<tr><th>Year</th><th>Years to Goal</th><th>Equity %</th><th>Debt %</th><th>Gold %</th></tr>
${result.glidePathData.filter((_, i) => i % Math.max(1, Math.floor(result.glidePathData.length / 10)) === 0 || i === result.glidePathData.length - 1).map(d => `<tr><td>Year ${d.year}</td><td>${d.yearsToGoal}</td><td>${d.equity}%</td><td>${d.debt}%</td><td>${d.gold}%</td></tr>`).join('\n')}
</table>

<h3>Fund Category Recommendations</h3>
${result.fundRecommendations.map(r => `<div class="rec-card"><strong>${r.category}</strong> (${r.allocation}% — ${r.assetClass})<br/><em>Why:</em> ${r.rationale}</div>`).join('\n')}

${result.warnings.length > 0 ? `<h2>Warnings</h2>\n${result.warnings.map(w => `<div class="warn">${w}</div>`).join('\n')}` : ''}

<h2>Action Items</h2>
${result.actionItems.map(a => `<div class="action ${a.priority}"><strong>${a.priority === 'high' ? 'URGENT' : a.priority === 'medium' ? 'IMPORTANT' : 'SUGGESTED'}:</strong> ${a.text}<br/><span style="color:#64748b;font-size:12px;">Reason: ${a.reason}</span></div>`).join('\n')}

<h2>Risk Reduction Strategy (Glide Path)</h2>
<p>As your goal approaches, your equity allocation is systematically reduced to protect your accumulated corpus from market volatility:</p>
<ul>
<li><strong>7+ years to goal:</strong> Maximum equity allocation for growth</li>
<li><strong>5-7 years:</strong> Begin gradual shift — reduce equity by 5-10% annually</li>
<li><strong>3-5 years:</strong> Move to balanced allocation (equity + debt roughly equal)</li>
<li><strong>1-3 years:</strong> Majority in debt, only 15-20% in equity</li>
<li><strong>Less than 1 year:</strong> Move almost entirely to liquid/ultra-short funds</li>
</ul>
<p>This strategy is called a "glide path" — similar to target-date mutual funds. It ensures that a sudden market crash near your goal date doesn't wipe out years of accumulated gains.</p>

<div class="disclaimer">
<p><strong>Nandalal - AMFI Registered Mutual Fund Distributor</strong></p>
<p>Mutual fund investments are subject to market risks. The returns mentioned are assumptions based on historical averages and are not guaranteed. Past performance does not indicate future results. Asset allocation suggestions are based on your self-assessed risk profile and should be reviewed with a financial advisor. This is not investment advice — it is a planning tool.</p>
</div>

<div class="no-print" style="text-align:center;margin-top:30px;">
  <button onclick="window.print()" style="background:#0d9488;color:white;padding:12px 30px;border:none;border-radius:8px;font-size:15px;cursor:pointer;">Print / Save as PDF</button>
</div>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `goal-plan-${goalInputs.goalType}-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ======== MAIN COMPONENT ========

export default function GoalPlanner({ onNavigate }: GoalPlannerProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 — goal inputs
  const [goalType, setGoalType] = useState<GoalType | null>(null);
  const [customGoalName, setCustomGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentSavings, setCurrentSavings] = useState('0');
  const [timelineYears, setTimelineYears] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');

  // Step 2 — assessment
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // Step 3 — result
  const [result, setResult] = useState<GoalPlanResult | null>(null);
  const [showGlideTable, setShowGlideTable] = useState(false);
  const [expandedRec, setExpandedRec] = useState<number | null>(null);

  const selectedGoal = goalType ? GOAL_CONFIGS.find(g => g.type === goalType) : null;

  // Select goal type
  const handleSelectGoal = (type: GoalType) => {
    const config = GOAL_CONFIGS.find(g => g.type === type)!;
    setGoalType(type);
    setTargetAmount(String(config.defaultAmount));
    setTimelineYears(String(config.defaultTimeline));
  };

  // Proceed to assessment
  const canProceedStep1 = goalType && parseFloat(targetAmount) > 0 && parseFloat(timelineYears) > 0 && parseFloat(monthlyIncome) > 0 && (goalType !== 'custom' || customGoalName.trim());

  const handleProceedToAssessment = () => {
    if (!canProceedStep1) return;
    setCurrentQ(0);
    setStep(2);
  };

  // Answer a question
  const handleAnswer = (qId: string, value: number) => {
    const newAnswers = { ...answers, [qId]: value };
    setAnswers(newAnswers);

    // Auto-advance
    if (currentQ < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    } else {
      // Last question — compute result
      setTimeout(() => {
        const goalInputs = {
          goalType: goalType!,
          targetAmount: parseFloat(targetAmount) || 0,
          currentSavings: parseFloat(currentSavings) || 0,
          timelineYears: parseFloat(timelineYears) || 0,
          monthlyIncome: parseFloat(monthlyIncome) || 0,
          customGoalName,
        };
        setResult(generateGoalPlan(goalInputs, newAnswers));
        setStep(3);
      }, 400);
    }
  };

  // Reset
  const handleReset = () => {
    setStep(1);
    setGoalType(null);
    setCustomGoalName('');
    setTargetAmount('');
    setCurrentSavings('0');
    setTimelineYears('');
    setMonthlyIncome('');
    setCurrentQ(0);
    setAnswers({});
    setResult(null);
    setShowGlideTable(false);
    setExpandedRec(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---- RENDER ----
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-teal-600 rounded-xl">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Goal Planner</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Plan your financial goals with personalized investment strategy, risk profiling, and glide path
          </p>
        </div>

        {/* ========== STEP 1: Goal Definition ========== */}
        {step === 1 && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">1. Choose Your Goal</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {GOAL_CONFIGS.map(g => (
                  <button
                    key={g.type}
                    onClick={() => handleSelectGoal(g.type)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                      goalType === g.type
                        ? 'border-teal-500 bg-teal-50 shadow-md'
                        : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                    }`}
                  >
                    <g.icon className="w-6 h-6" style={{ color: g.color }} />
                    <span className="text-sm font-semibold text-gray-800">{g.label}</span>
                  </button>
                ))}
              </div>

              {goalType && (
                <>
                  {selectedGoal && (
                    <p className="text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg">
                      <Info className="w-4 h-4 inline mr-1 text-teal-500" />
                      {selectedGoal.description}. Inflation assumption: {selectedGoal.inflationRate}% p.a.
                    </p>
                  )}

                  {goalType === 'custom' && (
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Goal Name</label>
                      <input
                        type="text"
                        value={customGoalName}
                        onChange={e => setCustomGoalName(e.target.value)}
                        placeholder="e.g., Start a Business, Buy Land"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Target Amount (in today's value)
                      </label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={targetAmount}
                          onChange={e => setTargetAmount(e.target.value)}
                          placeholder="e.g., 5000000"
                          className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                      {parseFloat(targetAmount) > 0 && (
                        <p className="text-xs text-gray-500 mt-1">Rs {fmtLakh(parseFloat(targetAmount))}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Current Savings for this Goal
                      </label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={currentSavings}
                          onChange={e => setCurrentSavings(e.target.value)}
                          placeholder="0"
                          className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Timeline (Years)
                      </label>
                      <input
                        type="number"
                        value={timelineYears}
                        onChange={e => setTimelineYears(e.target.value)}
                        min="1"
                        max="40"
                        placeholder="e.g., 15"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Monthly Income
                      </label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={monthlyIncome}
                          onChange={e => setMonthlyIncome(e.target.value)}
                          placeholder="e.g., 80000"
                          className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToAssessment}
                    disabled={!canProceedStep1}
                    className={`mt-8 w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all ${
                      canProceedStep1
                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 shadow-lg'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Next: Risk Profiler
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ========== STEP 2: Assessment ========== */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
                <span>{QUESTIONS[currentQ].section === 'risk' ? 'Risk Profile' : 'Financial Health & Dependents'}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Section badge */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                QUESTIONS[currentQ].section === 'risk'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {QUESTIONS[currentQ].section === 'risk' ? (
                  <><Shield className="w-3 h-3" /> Risk Profiler</>
                ) : (
                  <><Heart className="w-3 h-3" /> Health & Dependents</>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{QUESTIONS[currentQ].text}</h3>
              {QUESTIONS[currentQ].subtitle && (
                <p className="text-sm text-gray-500 mb-6">{QUESTIONS[currentQ].subtitle}</p>
              )}

              <div className="space-y-3">
                {QUESTIONS[currentQ].options.map((opt, idx) => {
                  const selected = answers[QUESTIONS[currentQ].id] === opt.value;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(QUESTIONS[currentQ].id, opt.value)}
                      className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                        selected
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`font-medium ${selected ? 'text-teal-700' : 'text-gray-700'}`}>{opt.label}</span>
                      {opt.tag && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{opt.tag}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Nav */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => {
                    if (currentQ > 0) setCurrentQ(currentQ - 1);
                    else setStep(1);
                  }}
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> {currentQ === 0 ? 'Back to Goal' : 'Previous'}
                </button>
                {currentQ < QUESTIONS.length - 1 && answers[QUESTIONS[currentQ].id] !== undefined && (
                  <button
                    onClick={() => setCurrentQ(currentQ + 1)}
                    className="flex items-center gap-1 text-teal-600 hover:text-teal-700 font-medium transition-colors"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========== STEP 3: Results ========== */}
        {step === 3 && result && (
          <div className="space-y-8">
            {/* Summary Header */}
            <div className="bg-gradient-to-r from-teal-700 to-emerald-700 rounded-2xl p-8 text-white">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {selectedGoal && <selectedGoal.icon className="w-8 h-8" />}
                <h2 className="text-2xl font-bold">
                  {goalType === 'custom' ? customGoalName : selectedGoal?.label} Plan
                </h2>
                <span className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm">{timelineYears} years</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold">Rs {fmtLakh(parseFloat(targetAmount))}</p>
                  <p className="text-sm text-teal-100">Today's Target</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold">Rs {fmtLakh(result.inflationAdjustedTarget)}</p>
                  <p className="text-sm text-teal-100">Inflation-Adjusted</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-300">Rs {fmt(Math.ceil(result.sipWithStepup))}</p>
                  <p className="text-sm text-teal-100">Monthly SIP (step-up)</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold">Rs {fmt(Math.ceil(result.sipWithoutStepup))}</p>
                  <p className="text-sm text-teal-100">Monthly SIP (fixed)</p>
                </div>
              </div>
            </div>

            {/* Risk Profile & Financial Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Risk Profile */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Risk Profile</h3>
                    <p className="text-sm text-gray-500">{result.riskScore}/{result.riskMaxScore} points</p>
                  </div>
                  <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                    {result.riskProfile}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{result.riskDescription}</p>
                <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full"
                    style={{ width: `${(result.riskScore / result.riskMaxScore) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Conservative</span>
                  <span>Aggressive</span>
                </div>
              </div>

              {/* Health Score */}
              <div className={`bg-white rounded-2xl shadow-lg p-6 border-t-4 ${
                result.healthGrade === 'Excellent' ? 'border-green-500' :
                result.healthGrade === 'Good' ? 'border-blue-500' :
                result.healthGrade === 'Needs Improvement' ? 'border-yellow-500' : 'border-red-500'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Heart className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Financial Health</h3>
                    <p className="text-sm text-gray-500">{result.healthScore}/{result.healthMaxScore} points</p>
                  </div>
                  <span className={`ml-auto px-3 py-1 rounded-full text-sm font-bold ${
                    result.healthGrade === 'Excellent' ? 'bg-green-100 text-green-700' :
                    result.healthGrade === 'Good' ? 'bg-blue-100 text-blue-700' :
                    result.healthGrade === 'Needs Improvement' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {result.healthGrade}
                  </span>
                </div>
                <div className="space-y-2 mt-2">
                  {result.healthAreas.slice(0, 4).map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {a.status === 'good' ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> :
                       a.status === 'warning' ? <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" /> :
                       <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                      <span className="text-gray-600 truncate">{a.label}: {a.status === 'good' ? 'Covered' : a.status === 'warning' ? 'Needs attention' : 'Critical'}</span>
                    </div>
                  ))}
                  {result.healthAreas.length > 4 && (
                    <p className="text-xs text-gray-400">+ {result.healthAreas.length - 4} more areas assessed below</p>
                  )}
                </div>
              </div>
            </div>

            {/* Health Areas Detail */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-600" />
                Detailed Health & Dependent Assessment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.healthAreas.map((area, i) => (
                  <div key={i} className={`flex gap-3 p-4 rounded-xl border ${
                    area.status === 'good' ? 'border-green-200 bg-green-50' :
                    area.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    'border-red-200 bg-red-50'
                  }`}>
                    <div className={`p-1.5 rounded-lg h-fit ${
                      area.status === 'good' ? 'bg-green-100' : area.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <area.icon className={`w-4 h-4 ${
                        area.status === 'good' ? 'text-green-600' : area.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{area.label}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{area.message}</p>
                      {area.action && (
                        <p className="text-xs font-medium text-teal-700 mt-1">Action: {area.action}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Asset Allocation */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Recommended Asset Allocation</h3>
              <p className="text-sm text-gray-500 mb-4">Based on your <strong>{result.riskProfile}</strong> profile and <strong>{timelineYears}-year</strong> timeline</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Equity', value: result.initialAllocation.equity },
                          { name: 'Debt', value: result.initialAllocation.debt },
                          { name: 'Gold', value: result.initialAllocation.gold },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, value }) => `${name} ${value}%`}
                      >
                        <Cell fill={ALLOC_COLORS.equity} />
                        <Cell fill={ALLOC_COLORS.debt} />
                        <Cell fill={ALLOC_COLORS.gold} />
                      </Pie>
                      <Tooltip formatter={(value: number | undefined) => `${value ?? 0}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Equity', pct: result.initialAllocation.equity, color: ALLOC_COLORS.equity, desc: 'Growth engine — higher returns with volatility' },
                    { label: 'Debt', pct: result.initialAllocation.debt, color: ALLOC_COLORS.debt, desc: 'Stability — steady returns, capital protection' },
                    { label: 'Gold', pct: result.initialAllocation.gold, color: ALLOC_COLORS.gold, desc: 'Hedge — inflation & currency protection' },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-gray-800">{item.label}</span>
                        <span className="font-bold" style={{ color: item.color }}>{item.pct}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Why this allocation?</strong> Your {result.riskProfile.toLowerCase()} risk profile
                      {result.initialAllocation.equity > 50
                        ? ' allows significant equity exposure for growth. '
                        : result.initialAllocation.equity > 30
                        ? ' balances growth and safety. '
                        : ' prioritizes capital protection. '}
                      With {timelineYears} years to goal,
                      {parseInt(timelineYears) > 7
                        ? ' equity has enough time to recover from any market downturn.'
                        : parseInt(timelineYears) > 3
                        ? ' we limit equity to manage short-term volatility.'
                        : ' most goes into debt for capital safety.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Glide Path Chart */}
            {parseInt(timelineYears) > 2 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Risk Reduction Glide Path</h3>
                <p className="text-sm text-gray-500 mb-6">
                  As your goal approaches, equity is systematically reduced to protect your accumulated wealth from market crashes.
                </p>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result.glidePathData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" label={{ value: 'Year', position: 'bottom', offset: -5 }} tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} label={{ value: 'Allocation %', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value: number | undefined) => `${value ?? 0}%`} />
                      <Legend />
                      <Area type="monotone" dataKey="equity" stackId="1" stroke="#3b82f6" fill="#93c5fd" name="Equity %" />
                      <Area type="monotone" dataKey="debt" stackId="1" stroke="#10b981" fill="#6ee7b7" name="Debt %" />
                      <Area type="monotone" dataKey="gold" stackId="1" stroke="#f59e0b" fill="#fcd34d" name="Gold %" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Glide path explanation */}
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-5">
                  <h4 className="font-bold text-gray-800 mb-2">How does the glide path work?</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="flex gap-2">
                      <span className="font-bold text-blue-600 flex-shrink-0">7+ yrs:</span>
                      <span>Maximum equity ({result.initialAllocation.equity}%) for compounding growth</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-blue-600 flex-shrink-0">5-7 yrs:</span>
                      <span>Begin reducing equity by 5-10% annually</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-yellow-600 flex-shrink-0">3-5 yrs:</span>
                      <span>Move to balanced allocation (equity ≈ debt)</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-red-600 flex-shrink-0">&lt;3 yrs:</span>
                      <span>Mostly debt/liquid — protect the corpus</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    <strong>Why?</strong> A market crash 1-2 years before your goal could wipe out years of gains.
                    By gradually shifting to debt, you lock in profits and ensure the money is available when you need it.
                    This is similar to how target-date mutual funds operate globally.
                  </p>
                </div>

                {/* Glide table toggle */}
                <button
                  onClick={() => setShowGlideTable(!showGlideTable)}
                  className="mt-4 flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showGlideTable ? 'rotate-180' : ''}`} />
                  {showGlideTable ? 'Hide' : 'Show'} year-by-year table
                </button>
                {showGlideTable && (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left font-semibold text-gray-600 border-b">Year</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-600 border-b">Years to Goal</th>
                          <th className="px-4 py-2 text-left font-semibold text-blue-600 border-b">Equity %</th>
                          <th className="px-4 py-2 text-left font-semibold text-green-600 border-b">Debt %</th>
                          <th className="px-4 py-2 text-left font-semibold text-yellow-600 border-b">Gold %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.glidePathData.map(d => (
                          <tr key={d.year} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-2">{d.year}</td>
                            <td className="px-4 py-2 text-gray-500">{d.yearsToGoal}</td>
                            <td className="px-4 py-2 font-medium text-blue-600">{d.equity}%</td>
                            <td className="px-4 py-2 font-medium text-green-600">{d.debt}%</td>
                            <td className="px-4 py-2 font-medium text-yellow-600">{d.gold}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Fund Recommendations */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Where to Invest</h3>
              <p className="text-sm text-gray-500 mb-6">Fund categories recommended based on your profile, timeline, and allocation</p>

              <div className="space-y-3">
                {result.fundRecommendations.map((rec, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedRec(expandedRec === i ? null : i)}
                      className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className={`w-3 h-3 rounded-full flex-shrink-0`} style={{ backgroundColor: ALLOC_COLORS[rec.assetClass] }} />
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900">{rec.category}</span>
                        <span className="text-sm text-gray-500 ml-2">({rec.allocation}%)</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        rec.assetClass === 'equity' ? 'bg-blue-100 text-blue-700' :
                        rec.assetClass === 'debt' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {rec.assetClass}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedRec === i ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedRec === i && (
                      <div className="px-5 pb-4 pt-0 border-t border-gray-100">
                        <div className="flex gap-2 mt-3">
                          <Info className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-800 mb-1">Why this recommendation?</p>
                            <p className="text-sm text-gray-600">{rec.rationale}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Important Warnings
                </h3>
                <div className="space-y-3">
                  {result.warnings.map((w, i) => (
                    <div key={i} className="flex gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">{w}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Action Plan</h3>
              <div className="space-y-3">
                {result.actionItems.map((item, i) => (
                  <div key={i} className={`flex gap-3 p-4 rounded-xl border-l-4 ${
                    item.priority === 'high' ? 'bg-red-50 border-red-500' :
                    item.priority === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                    'bg-blue-50 border-blue-500'
                  }`}>
                    <div className="flex-shrink-0 mt-0.5">
                      <span className={`inline-block w-6 h-6 rounded-full text-center text-xs font-bold leading-6 text-white ${
                        item.priority === 'high' ? 'bg-red-500' : item.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}>
                        {i + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        <strong>Why:</strong> {item.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SIP Summary Card */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Start Your SIP Today</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-sm text-teal-100">Fixed SIP</p>
                  <p className="text-2xl font-bold">Rs {fmt(Math.ceil(result.sipWithoutStepup))}<span className="text-sm font-normal">/month</span></p>
                </div>
                <div className="bg-white/20 rounded-xl p-4 ring-2 ring-white/30">
                  <p className="text-sm text-teal-100">Step-up SIP (recommended)</p>
                  <p className="text-2xl font-bold">Rs {fmt(Math.ceil(result.sipWithStepup))}<span className="text-sm font-normal">/month</span></p>
                  <p className="text-xs text-teal-200 mt-1">Increases 10% annually with your income</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-sm text-teal-100">Expected Return</p>
                  <p className="text-2xl font-bold">{fmt2(result.blendedReturn * 100)}%<span className="text-sm font-normal"> p.a.</span></p>
                  <p className="text-xs text-teal-200 mt-1">Blended across asset classes</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => downloadReport(
                    { goalType: goalType!, targetAmount: parseFloat(targetAmount), currentSavings: parseFloat(currentSavings), timelineYears: parseFloat(timelineYears), monthlyIncome: parseFloat(monthlyIncome), customGoalName },
                    result,
                  )}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-teal-700 font-semibold rounded-xl hover:bg-teal-50 transition-all"
                >
                  <Download className="w-4 h-4" /> Download Report
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
                >
                  <RotateCcw className="w-4 h-4" /> Plan Another Goal
                </button>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('calculators')}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
                  >
                    <TrendingUp className="w-4 h-4" /> SIP Calculator
                  </button>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="text-center text-xs text-gray-400 space-y-1">
              <p className="font-semibold text-gray-500">Nandalal - AMFI Registered Mutual Fund Distributor</p>
              <p>Mutual fund investments are subject to market risks. Returns mentioned are assumptions based on historical averages and are not guaranteed. Asset allocation suggestions are based on your self-assessed risk profile. This is a planning tool, not investment advice.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
