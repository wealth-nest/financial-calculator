import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, ArrowRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  actions?: { label: string; tab: string }[];
}

interface ChatBotProps {
  onNavigate: (tab: string) => void;
}

// --- Intent matching ---

interface Intent {
  keywords: string[];
  response: string;
  actions?: { label: string; tab: string }[];
}

const INTENTS: Intent[] = [
  {
    keywords: ['sip', 'systematic', 'monthly invest', 'start sip', 'sip calculator', 'how much sip'],
    response: 'I can help you calculate your SIP returns! Our SIP Calculator lets you plan monthly investments with step-up options. You can see how your money grows over time.',
    actions: [{ label: 'Open SIP Calculator', tab: 'calculators' }],
  },
  {
    keywords: ['lumpsum', 'lump sum', 'one time invest', 'bulk invest', 'lumpsum calculator'],
    response: 'Want to invest a lump sum amount? Use our Lumpsum Calculator to see projected returns based on expected growth rate and duration.',
    actions: [{ label: 'Open Lumpsum Calculator', tab: 'calculators' }],
  },
  {
    keywords: ['emi', 'loan', 'home loan', 'car loan', 'personal loan', 'emi calculator', 'prepayment'],
    response: 'Our EMI Calculator helps you plan loan repayments. You can also calculate prepayment savings — see how much interest you save by prepaying!',
    actions: [{ label: 'Open EMI Calculator', tab: 'calculators' }],
  },
  {
    keywords: ['mutual fund', 'explore fund', 'browse fund', 'which fund', 'best fund', 'top fund', 'fund list'],
    response: 'You can explore all AMFI-registered mutual funds in India! Filter by category (equity, debt, hybrid, ELSS) and search by name or AMC.',
    actions: [{ label: 'Explore Mutual Funds', tab: 'mutualfunds' }],
  },
  {
    keywords: ['compare', 'comparison', 'which is better', 'vs', 'versus', 'compare fund'],
    response: 'Compare up to 5 mutual funds side by side! See NAV charts, returns comparison, and identify which fund performed better over different time periods.',
    actions: [{ label: 'Compare Funds', tab: 'compare' }],
  },
  {
    keywords: ['portfolio', 'cas', 'account statement', 'my fund', 'my investment', 'review', 'analyze', 'benchmark'],
    response: 'Upload your CAS (Consolidated Account Statement) or enter your holdings manually. I\'ll compare each fund against its benchmark and identify underperformers.',
    actions: [{ label: 'Analyze Portfolio', tab: 'portfolio' }],
  },
  {
    keywords: ['net worth', 'networth', 'total asset', 'how much am i worth', 'wealth', 'assets and liabilities'],
    response: 'Calculate your total net worth across all asset classes — bank deposits, mutual funds, stocks, PPF, EPF, real estate, gold, and more. NRI assets are supported too!',
    actions: [{ label: 'Calculate Net Worth', tab: 'networth' }],
  },
  {
    keywords: ['risk', 'risk profile', 'risk appetite', 'how much risk', 'financial health', 'assessment', 'questionnaire'],
    response: 'Use our Risk Profiler to discover your risk profile and financial health score in 3 minutes. Get a personalized action plan with prioritized recommendations.',
    actions: [{ label: 'Open Risk Profiler', tab: 'assess' }],
  },
  {
    keywords: ['goal', 'plan', 'goal plan', 'goal planner', 'retirement plan', 'education plan', 'house plan', 'wedding plan', 'target', 'dream', 'glide path', 'asset allocation'],
    response: 'Our Goal Planner helps you plan for any financial goal — retirement, education, home, wedding, or custom goals. It assesses your risk profile, suggests where to invest, and shows how to reduce risk as your goal approaches (glide path).',
    actions: [{ label: 'Open Goal Planner', tab: 'goalplanner' }],
  },
  {
    keywords: ['about', 'who are you', 'nandalal', 'about us', 'distributor', 'advisor'],
    response: 'Nandalal is an AMFI-registered mutual fund distributor helping investors build wealth through disciplined investing. Visit the About page to learn more.',
    actions: [{ label: 'About Us', tab: 'about' }],
  },
  {
    keywords: ['faq', 'question', 'doubt', 'help', 'how does', 'what is'],
    response: 'Check out our FAQ section for answers to common questions about mutual funds, SIPs, risk, and more.',
    actions: [{ label: 'View FAQs', tab: 'faq' }],
  },
  {
    keywords: ['tax', 'tax saving', '80c', 'elss', 'tax benefit', 'save tax'],
    response: 'ELSS (Equity Linked Savings Scheme) mutual funds offer tax deduction under Section 80C up to Rs 1.5 lakh, with just a 3-year lock-in. They typically give better returns than PPF or FDs.',
    actions: [
      { label: 'Explore ELSS Funds', tab: 'mutualfunds' },
      { label: 'SIP in ELSS', tab: 'calculators' },
    ],
  },
  {
    keywords: ['retire', 'retirement', 'pension', 'old age', 'retirement plan'],
    response: 'For retirement planning, use our Goal Planner! It assesses your risk profile, calculates inflation-adjusted corpus needed, and shows a glide path to reduce risk as you approach retirement.',
    actions: [
      { label: 'Plan Retirement', tab: 'goalplanner' },
      { label: 'SIP Calculator', tab: 'calculators' },
    ],
  },
  {
    keywords: ['child', 'education', 'kid', 'daughter', 'son', 'college'],
    response: 'Planning for your child\'s education? Use our Goal Planner — it accounts for education inflation (10-12% p.a.), assesses your risk profile, and gives a complete investment plan with glide path.',
    actions: [
      { label: 'Plan Education Goal', tab: 'goalplanner' },
      { label: 'SIP Calculator', tab: 'calculators' },
    ],
  },
  {
    keywords: ['gold', 'sovereign gold', 'sgb', 'digital gold'],
    response: 'Gold can be part of your portfolio (5-15%). Consider Sovereign Gold Bonds (SGB) for tax-free returns at maturity, or Gold ETFs/funds for liquidity. Use the Net Worth Calculator to see your current gold allocation.',
    actions: [{ label: 'Check Net Worth', tab: 'networth' }],
  },
  {
    keywords: ['fd', 'fixed deposit', 'safe invest', 'low risk', 'guaranteed'],
    response: 'If you prefer safety, consider debt mutual funds which can offer FD-like stability with better tax efficiency. You can also use our FD Calculator to compare returns. Use our Risk Profiler to find the right mix for you.',
    actions: [
      { label: 'FD Calculator', tab: 'calculators' },
      { label: 'Risk Profiler', tab: 'assess' },
      { label: 'Explore Debt Funds', tab: 'mutualfunds' },
    ],
  },
  {
    keywords: ['calculator', 'ppf', 'rd', 'recurring deposit', 'ssy', 'sukanya', 'nsc', 'gratuity', 'hra', 'simple interest', 'compound interest', 'inflation', 'cagr', 'flat rate', 'reducing rate', 'financial calculator'],
    response: 'We have 12 financial calculators — FD, RD, PPF, SSY, NSC, Gratuity, HRA, Simple/Compound Interest, Inflation, CAGR, and Flat vs Reducing Rate. Try them out!',
    actions: [{ label: 'Open Calculators', tab: 'calculators' }],
  },
  {
    keywords: ['nri', 'foreign', 'abroad', 'overseas', '401k', 'usa', 'uae', 'canada', 'uk'],
    response: 'NRIs can invest in mutual funds in India! Our Net Worth Calculator supports foreign assets (401k, foreign property, NRE/NRO accounts). Use our Risk Profiler for personalized advice.',
    actions: [
      { label: 'Net Worth (NRI)', tab: 'networth' },
      { label: 'Risk Profiler', tab: 'assess' },
    ],
  },
  {
    keywords: ['contact', 'call', 'whatsapp', 'reach', 'phone', 'email', 'talk'],
    response: 'You can reach Nandalal via WhatsApp, phone call, or email. Visit the home page for contact details, or fill the consultation form for a callback.',
    actions: [{ label: 'Go to Home', tab: 'home' }],
  },
  {
    keywords: ['start', 'begin', 'new', 'first time', 'beginner', 'how to invest', 'where to start'],
    response: 'Welcome! Here\'s the best path for new investors:\n1. Use our Risk Profiler to know your profile\n2. Start a SIP (even Rs 500/month)\n3. Choose funds based on your risk level\n\nI recommend starting with the assessment!',
    actions: [
      { label: 'Take Risk Profiler', tab: 'assess' },
      { label: 'SIP Calculator', tab: 'calculators' },
    ],
  },
  {
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'namaste'],
    response: 'Hello! Welcome to Nandalal\'s financial planning platform. How can I help you today? You can ask me about SIPs, mutual funds, tax saving, retirement planning, or anything investment-related!',
    actions: [],
  },
  {
    keywords: ['thank', 'thanks', 'great', 'awesome', 'nice'],
    response: 'You\'re welcome! Feel free to ask anything else about investments, or explore our tools. Happy investing!',
    actions: [],
  },
];

const FALLBACK_RESPONSE: ChatMessage = {
  id: '',
  role: 'bot',
  text: 'I\'m not sure I understand that. Here are some things I can help with:',
  actions: [
    { label: 'SIP Calculator', tab: 'calculators' },
    { label: 'Explore Mutual Funds', tab: 'mutualfunds' },
    { label: 'Risk Profiler', tab: 'assess' },
    { label: 'Portfolio Analyzer', tab: 'portfolio' },
    { label: 'Net Worth Calculator', tab: 'networth' },
    { label: 'FAQs', tab: 'faq' },
  ],
};

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  text: 'Hi! I\'m Nandalal\'s assistant. I can help you navigate our tools and answer investment questions. What would you like to do today?',
  actions: [
    { label: 'Calculate SIP Returns', tab: 'calculators' },
    { label: 'Explore Mutual Funds', tab: 'mutualfunds' },
    { label: 'Know My Risk Profile', tab: 'assess' },
    { label: 'Analyze My Portfolio', tab: 'portfolio' },
  ],
};

function matchIntent(input: string): Intent | null {
  const lower = input.toLowerCase();
  let bestMatch: Intent | null = null;
  let bestScore = 0;

  for (const intent of INTENTS) {
    let score = 0;
    for (const kw of intent.keywords) {
      if (lower.includes(kw)) {
        score += kw.split(' ').length; // Multi-word matches score higher
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = intent;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

// --- Component ---

export default function ChatBot({ onNavigate }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const intent = matchIntent(text);
      let botMsg: ChatMessage;

      if (intent) {
        botMsg = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: intent.response,
          actions: intent.actions,
        };
      } else {
        botMsg = {
          ...FALLBACK_RESPONSE,
          id: (Date.now() + 1).toString(),
        };
      }

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  };

  const handleAction = (tab: string) => {
    onNavigate(tab);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transition-all flex items-center justify-center"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-32px)] h-[520px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Nandalal Assistant</p>
                <p className="text-xs text-blue-100">Ask me anything about investments</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'bot' && (
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                    }`}
                    style={{ whiteSpace: 'pre-line' }}
                  >
                    {msg.text}
                  </div>
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.actions.map((action) => (
                        <button
                          key={action.tab + action.label}
                          onClick={() => handleAction(action.tab)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-50 transition-colors shadow-sm"
                        >
                          {action.label}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 border-t border-gray-100 bg-white flex gap-1.5 overflow-x-auto flex-shrink-0">
            {['SIP', 'Mutual Funds', 'Risk Profile', 'Portfolio', 'FAQs'].map((q) => (
              <button
                key={q}
                onClick={() => {
                  setInput(q);
                  setTimeout(() => {
                    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: q };
                    setMessages((prev) => [...prev, userMsg]);
                    setIsTyping(true);
                    setTimeout(() => {
                      const intent = matchIntent(q);
                      const botMsg: ChatMessage = intent
                        ? { id: (Date.now() + 1).toString(), role: 'bot', text: intent.response, actions: intent.actions }
                        : { ...FALLBACK_RESPONSE, id: (Date.now() + 1).toString() };
                      setMessages((prev) => [...prev, botMsg]);
                      setIsTyping(false);
                    }, 500);
                    setInput('');
                  }, 50);
                }}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-200 bg-white flex gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about SIP, mutual funds, tax saving..."
              className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-30"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
