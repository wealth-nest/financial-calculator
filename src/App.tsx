import { useState, useEffect, useCallback } from 'react';
import { Home } from 'lucide-react';
import LandingPage from './components/LandingPage';
import MutualFundExplorer from './components/MutualFundExplorer';
import MutualFundCompare from './components/MutualFundCompare';
import PortfolioAnalyzer from './components/PortfolioAnalyzer';
import NetWorthCalculator from './components/NetWorthCalculator';
import RiskProfiler from './components/RiskProfiler';
import FAQPage from './components/FAQPage';
import AboutPage from './components/AboutPage';
import FinancialCalculators from './components/FinancialCalculators';
import GoalPlanner from './components/GoalPlanner';
import ChatBot from './components/ChatBot';

type Tab = 'home' | 'mutualfunds' | 'compare' | 'portfolio' | 'networth' | 'assess' | 'goalplanner' | 'calculators' | 'faq' | 'about';

// SEO: Per-tab title and meta description for dynamic updates
const SEO_META: Record<Tab, { title: string; description: string }> = {
  home: {
    title: 'Nandalal - Mutual Fund Distributor India | SIP Calculator, Goal Planner & Investment Advisory',
    description: 'Nandalal is an AMFI registered mutual fund distributor in India. Free SIP calculator, EMI calculator, goal planner, risk profiler, portfolio analyzer & expert investment guidance. Start investing from Rs 500/month.',
  },
  mutualfunds: {
    title: 'Mutual Fund Explorer - Browse & Research Funds India | Nandalal',
    description: 'Explore and research mutual fund schemes across all AMCs in India. Filter by category, view NAV history, returns, and fund details. Free tool by Nandalal.',
  },
  compare: {
    title: 'Compare Mutual Funds Side by Side - Fund Comparison Tool | Nandalal',
    description: 'Compare mutual funds side by side. Analyze returns, NAV history, and performance of multiple schemes. Free comparison tool by Nandalal.',
  },
  portfolio: {
    title: 'Portfolio Analyzer - CAS Upload & Benchmark Comparison | Nandalal',
    description: 'Upload your CAS (Consolidated Account Statement) and analyze your mutual fund portfolio vs benchmarks. Get actionable recommendations. Free tool by Nandalal.',
  },
  networth: {
    title: 'Net Worth Calculator India - Track Assets & Liabilities | Nandalal',
    description: 'Calculate your net worth with our India-specific calculator. Track all assets, liabilities, investments. NRI support included. Free tool by Nandalal.',
  },
  assess: {
    title: 'Risk Profiler & Financial Health Assessment India | Nandalal',
    description: 'Free risk profiler and financial health assessment. 15 questions to determine your risk appetite, financial health score, and get personalized mutual fund investment recommendations.',
  },
  goalplanner: {
    title: 'Goal Planner - Retirement, Education & Investment Planning India | Nandalal',
    description: 'Plan your financial goals with our goal planner. Get personalized asset allocation, glide path, fund recommendations based on your risk profile. Free tool for retirement, education, home purchase planning.',
  },
  calculators: {
    title: 'Financial Calculators India - SIP, EMI, FD, RD, PPF, SSY, Gratuity, HRA | Nandalal',
    description: 'Free Indian financial calculators: SIP with step-up, lumpsum, EMI with prepayment, FD, RD, PPF, Sukanya Samriddhi, NSC, Gratuity, HRA exemption, CAGR, inflation. All instant and free.',
  },
  faq: {
    title: 'Mutual Fund FAQs - Common Questions Answered | Nandalal',
    description: 'Frequently asked questions about mutual funds, SIP, ELSS tax saving, risk, returns, portfolio management. Get clear answers from Nandalal, AMFI registered distributor.',
  },
  about: {
    title: 'About Nandalal - AMFI Registered Mutual Fund Distributor India',
    description: 'Learn about Nandalal, an AMFI registered mutual fund distributor helping Indian families build wealth through disciplined investing. 500+ happy clients, 10+ years experience.',
  },
};

const tabs: { key: Tab; label: string; activeColor: string }[] = [
  { key: 'home', label: 'Home', activeColor: 'text-gray-900' },
  { key: 'mutualfunds', label: 'Mutual Funds', activeColor: 'text-indigo-600' },
  { key: 'compare', label: 'Compare', activeColor: 'text-teal-600' },
  { key: 'portfolio', label: 'Portfolio', activeColor: 'text-amber-600' },
  { key: 'networth', label: 'Net Worth', activeColor: 'text-emerald-600' },
  { key: 'assess', label: 'Risk Profiler', activeColor: 'text-violet-600' },
  { key: 'goalplanner', label: 'Goal Planner', activeColor: 'text-teal-600' },
  { key: 'calculators', label: 'Calculators', activeColor: 'text-rose-600' },
  { key: 'faq', label: 'FAQs', activeColor: 'text-sky-600' },
  { key: 'about', label: 'About', activeColor: 'text-gray-700' },
];

function getTabFromHash(): Tab {
  const hash = window.location.hash.replace('#', '');
  if (hash && tabs.some(t => t.key === hash)) return hash as Tab;
  return 'home';
}

function updateSEO(tab: Tab) {
  const meta = SEO_META[tab];
  document.title = meta.title;
  const descTag = document.querySelector('meta[name="description"]');
  if (descTag) descTag.setAttribute('content', meta.description);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', tab === 'home' ? 'https://nandalal.in/' : `https://nandalal.in/#${tab}`);
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(getTabFromHash);

  useEffect(() => {
    const onHashChange = () => {
      const tab = getTabFromHash();
      setActiveTab(tab);
      updateSEO(tab);
    };
    window.addEventListener('hashchange', onHashChange);
    updateSEO(activeTab);
    return () => window.removeEventListener('hashchange', onHashChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNavigate = useCallback((tab: string) => {
    const t = tab as Tab;
    setActiveTab(t);
    window.location.hash = t === 'home' ? '' : t;
    updateSEO(t);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => handleNavigate('home')}
              className="flex items-center gap-2 font-bold text-blue-900 text-lg hover:text-blue-700 transition-colors flex-shrink-0"
              aria-label="Go to home page"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Nandalal</span>
            </button>
            <div className="flex overflow-x-auto gap-1 ml-4 scrollbar-hide" role="tablist" aria-label="Tools and pages">
              {tabs.filter(t => t.key !== 'home').map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleNavigate(tab.key)}
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  aria-label={tab.label}
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? `bg-gray-100 ${tab.activeColor}`
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main>
        {activeTab === 'home' && <LandingPage onNavigate={handleNavigate} />}
        {activeTab === 'mutualfunds' && <MutualFundExplorer />}
        {activeTab === 'compare' && <MutualFundCompare />}
        {activeTab === 'portfolio' && <PortfolioAnalyzer />}
        {activeTab === 'networth' && <NetWorthCalculator />}
        {activeTab === 'assess' && <RiskProfiler onNavigate={handleNavigate} />}
        {activeTab === 'goalplanner' && <GoalPlanner onNavigate={handleNavigate} />}
        {activeTab === 'calculators' && <FinancialCalculators />}
        {activeTab === 'faq' && <FAQPage />}
        {activeTab === 'about' && <AboutPage onNavigate={handleNavigate} />}
      </main>

      <ChatBot onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
