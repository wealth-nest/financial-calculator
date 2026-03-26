import { useState } from 'react';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQ[] = [
  // Mutual Funds Basics
  {
    category: 'Mutual Fund Basics',
    question: 'What is a mutual fund?',
    answer: 'A mutual fund pools money from many investors and invests it in stocks, bonds, or other securities. It is managed by a professional fund manager. You own units of the fund proportional to your investment. Mutual funds are regulated by SEBI in India.',
  },
  {
    category: 'Mutual Fund Basics',
    question: 'Are mutual funds safe?',
    answer: 'Mutual funds are market-linked investments, so they carry some risk. However, they are regulated by SEBI and managed by professional fund managers. The risk varies by fund type: liquid funds are very low risk, debt funds are moderate, and equity funds carry higher risk but also higher potential returns. Diversification within a fund reduces individual stock risk.',
  },
  {
    category: 'Mutual Fund Basics',
    question: 'What is NAV?',
    answer: 'NAV (Net Asset Value) is the per-unit price of a mutual fund. It is calculated daily by dividing the total value of all securities in the fund by the total number of units. When you invest, you buy units at the current NAV. A higher NAV does not mean a fund is expensive — it just reflects the fund\'s accumulated growth.',
  },
  {
    category: 'Mutual Fund Basics',
    question: 'What is the difference between Direct and Regular plans?',
    answer: 'Direct plans have no distributor commission, so they have a lower expense ratio and give slightly higher returns (typically 0.5-1% more per year). Regular plans include a commission for the distributor/advisor. If you are investing through Nandalal, you get guidance and service along with your investment.',
  },
  {
    category: 'Mutual Fund Basics',
    question: 'What is the minimum amount to start investing in mutual funds?',
    answer: 'Most mutual funds allow SIP investments starting from Rs 500 per month. Lumpsum investments typically start from Rs 1,000 to Rs 5,000 depending on the fund house. There is no maximum limit for investment.',
  },

  // SIP
  {
    category: 'SIP (Systematic Investment Plan)',
    question: 'What is SIP?',
    answer: 'SIP (Systematic Investment Plan) is a way to invest a fixed amount regularly (usually monthly) in a mutual fund. It helps you build wealth through discipline, benefit from rupee cost averaging (buying more units when prices are low, fewer when high), and harness the power of compounding over time.',
  },
  {
    category: 'SIP (Systematic Investment Plan)',
    question: 'Can I stop or pause my SIP?',
    answer: 'Yes, you can stop your SIP at any time without any penalty. Some fund houses also offer a "pause" option for a few months. Your existing invested units remain in the fund and continue to grow. You can restart the SIP whenever you want.',
  },
  {
    category: 'SIP (Systematic Investment Plan)',
    question: 'What is a step-up or top-up SIP?',
    answer: 'A step-up SIP automatically increases your SIP amount every year by a fixed amount or percentage. For example, if your SIP is Rs 5,000 and you set a 10% step-up, it becomes Rs 5,500 in year 2, Rs 6,050 in year 3, and so on. This helps your investments keep pace with your growing income.',
  },
  {
    category: 'SIP (Systematic Investment Plan)',
    question: 'Is SIP better than lumpsum?',
    answer: 'It depends on market conditions. SIP reduces timing risk through rupee cost averaging and is ideal for regular income earners. Lumpsum works well if you have a large amount and the market is at reasonable levels. For most investors, SIP is recommended as it instills discipline and removes the stress of market timing.',
  },

  // Tax
  {
    category: 'Tax & ELSS',
    question: 'How are mutual fund returns taxed in India?',
    answer: 'For equity funds: Short-term gains (held less than 1 year) are taxed at 15%. Long-term gains exceeding Rs 1 lakh per year are taxed at 10%. For debt funds: All gains are taxed at your income tax slab rate regardless of holding period (as per 2023 rules). Dividend income is added to your total income and taxed at your slab rate.',
  },
  {
    category: 'Tax & ELSS',
    question: 'What is ELSS and how does it save tax?',
    answer: 'ELSS (Equity Linked Savings Scheme) is a type of equity mutual fund that qualifies for tax deduction under Section 80C of the Income Tax Act. You can claim deduction up to Rs 1.5 lakh per year. ELSS has the shortest lock-in period (3 years) among all 80C instruments and has the potential for higher returns compared to PPF, NSC, or tax-saving FDs.',
  },

  // Risk & Returns
  {
    category: 'Risk & Returns',
    question: 'What returns can I expect from mutual funds?',
    answer: 'Historical average returns (not guaranteed): Equity funds: 12-15% per annum over long term (10+ years). Hybrid funds: 8-12%. Debt funds: 6-8%. Liquid funds: 5-7%. These are averages — actual returns vary year to year. Past performance does not guarantee future results.',
  },
  {
    category: 'Risk & Returns',
    question: 'What if the market crashes after I invest?',
    answer: 'Market crashes are temporary. Historically, Indian markets have always recovered from crashes and gone on to make new highs. If you are doing SIP, a crash is actually good — you buy more units at lower prices, which boosts your returns when markets recover. The key is to stay invested and not panic-sell.',
  },
  {
    category: 'Risk & Returns',
    question: 'How do I know my risk profile?',
    answer: 'Your risk profile depends on your age, income stability, investment horizon, financial goals, and emotional comfort with volatility. Use our Risk Profiler on this platform — it asks 15 questions and gives you a personalized risk profile with recommended asset allocation.',
  },

  // Portfolio
  {
    category: 'Portfolio & CAS',
    question: 'What is a CAS (Consolidated Account Statement)?',
    answer: 'CAS is a single statement that shows all your mutual fund holdings across all fund houses. It is generated by CAMS or KFintech (registrars). You can download it from myCAMS (camsonline.com), KFintech (kfintech.com), or MFCentral (mfcentral.com). It is usually password-protected with PAN + DOB.',
  },
  {
    category: 'Portfolio & CAS',
    question: 'How often should I review my portfolio?',
    answer: 'Review your portfolio once every 6-12 months. Check if your funds are beating their benchmarks. Replace consistent underperformers. Rebalance your asset allocation if it has drifted significantly from your target. Avoid checking daily — it leads to unnecessary anxiety and impulsive decisions.',
  },
  {
    category: 'Portfolio & CAS',
    question: 'What does it mean if my fund is underperforming the benchmark?',
    answer: 'If your actively managed fund consistently underperforms its benchmark index over 3+ years, it means the fund manager is not adding value. Consider switching to a better-performing fund in the same category, or to an index fund that simply tracks the benchmark at a lower cost.',
  },

  // Getting Started
  {
    category: 'Getting Started',
    question: 'How do I start investing through Nandalal?',
    answer: 'It is simple! Fill the consultation form on our home page or contact us via WhatsApp. Nandalal will understand your goals, assess your risk profile, and recommend suitable mutual funds. You can also use our tools — SIP Calculator, Risk Profiler, and Fund Explorer — to plan before you start.',
  },
  {
    category: 'Getting Started',
    question: 'What documents do I need to invest?',
    answer: 'You need: PAN card, Aadhaar card (for KYC), a cancelled cheque or bank statement, passport-size photograph, and a mobile number linked to Aadhaar. If you are not KYC-compliant, we will help you complete the one-time KYC process online.',
  },
  {
    category: 'Getting Started',
    question: 'Can NRIs invest in mutual funds in India?',
    answer: 'Yes! NRIs can invest in Indian mutual funds through their NRE or NRO bank accounts. Some fund houses have restrictions for US/Canada-based NRIs due to FATCA compliance. KYC with overseas address proof is required. Nandalal can guide you through the NRI investment process.',
  },

  // Insurance & Planning
  {
    category: 'Financial Planning',
    question: 'Do I need both health insurance and life insurance?',
    answer: 'Yes, they serve different purposes. Health insurance covers hospitalization costs. Life insurance (term plan) provides financial security to your family in case of your untimely death. Both are essential. Avoid mixing insurance with investment (avoid ULIPs and endowment plans).',
  },
  {
    category: 'Financial Planning',
    question: 'How much emergency fund should I have?',
    answer: 'Keep 6 months of monthly expenses as an emergency fund. Park it in a liquid fund or savings account for easy access. This protects you from unexpected expenses (medical emergencies, job loss) without having to break your long-term investments.',
  },
  {
    category: 'Financial Planning',
    question: 'Should I invest or pay off loans first?',
    answer: 'Pay off high-interest loans first (credit cards at 36%+, personal loans at 12-18%). For home loans (7-9%), you can invest simultaneously since equity returns (12-15%) can exceed the loan interest. Use our EMI Calculator to plan prepayments and see interest savings.',
  },
];

const CATEGORIES = [...new Set(FAQS.map((f) => f.category))];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filtered = FAQS.filter((faq) => {
    const matchesSearch =
      !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Everything you need to know about mutual funds and investing
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm shadow-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === 'All'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All ({FAQS.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filtered.map((faq, i) => {
            const globalIndex = FAQS.indexOf(faq);
            const isOpen = openIndex === globalIndex;
            return (
              <div
                key={globalIndex}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                  className="w-full flex items-start gap-3 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-blue-500 font-bold text-sm mt-0.5 flex-shrink-0">
                    Q{i + 1}
                  </span>
                  <span className="flex-1 font-semibold text-gray-900 text-sm">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-0">
                    <div className="pl-8 text-sm text-gray-600 leading-relaxed border-l-2 border-blue-200 ml-1">
                      {faq.answer}
                    </div>
                    <div className="mt-3 pl-8 ml-1">
                      <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full font-medium">
                        {faq.category}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No matching questions found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}

        {/* Still have questions */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
          <p className="text-blue-100 mb-4">
            Reach out to Nandalal for personalized answers and investment guidance.
          </p>
          <a
            href="https://wa.me/919876543210?text=Hi%20Nandalal%2C%20I%20have%20a%20question%20about%20mutual%20funds."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all"
          >
            Ask on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
