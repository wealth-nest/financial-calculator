import { useState } from 'react';
import {
  TrendingUp,
  Calculator,
  BarChart3,
  Shield,
  Phone,
  Mail,
  MessageCircle,
  Send,
  ChevronRight,
  Star,
  Target,
  Landmark,
  PiggyBank,
  Wallet,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

const fundCategories = [
  {
    title: 'Equity Funds',
    description: 'Invest in stocks for long-term wealth creation. Ideal for goals 5+ years away.',
    icon: TrendingUp,
    color: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    tags: ['Large Cap', 'Mid Cap', 'Small Cap', 'Flexi Cap'],
  },
  {
    title: 'Debt Funds',
    description: 'Stable returns with lower risk. Perfect for short to medium-term goals.',
    icon: Shield,
    color: 'from-green-500 to-green-600',
    bgLight: 'bg-green-50',
    textColor: 'text-green-600',
    tags: ['Liquid', 'Short Duration', 'Corporate Bond', 'Gilt'],
  },
  {
    title: 'Hybrid Funds',
    description: 'Best of both worlds — equity growth with debt stability.',
    icon: BarChart3,
    color: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    tags: ['Balanced', 'Aggressive', 'Conservative', 'Arbitrage'],
  },
  {
    title: 'ELSS (Tax Saving)',
    description: 'Save taxes under Section 80C while growing your wealth.',
    icon: Landmark,
    color: 'from-orange-500 to-orange-600',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-600',
    tags: ['3-Year Lock-in', 'Tax Benefit', 'Equity Linked'],
  },
  {
    title: 'Index Funds & ETFs',
    description: 'Low-cost passive investing that tracks market indices.',
    icon: Target,
    color: 'from-teal-500 to-teal-600',
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-600',
    tags: ['Nifty 50', 'Sensex', 'Nifty Next 50', 'Nasdaq 100'],
  },
  {
    title: 'SIP & Goal Planning',
    description: 'Start with as little as Rs 500/month. Disciplined investing for every goal.',
    icon: PiggyBank,
    color: 'from-pink-500 to-pink-600',
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-600',
    tags: ['Retirement', 'Child Education', 'Home', 'Wealth'],
  },
];

const tools = [
  { label: 'Calculators', tab: 'calculators', icon: Calculator, color: 'text-blue-600' },
  { label: 'Explore Funds', tab: 'mutualfunds', icon: BarChart3, color: 'text-indigo-600' },
  { label: 'Compare Funds', tab: 'compare', icon: Target, color: 'text-teal-600' },
  { label: 'Goal Planner', tab: 'goalplanner', icon: Wallet, color: 'text-teal-600' },
  { label: 'Portfolio Review', tab: 'portfolio', icon: TrendingUp, color: 'text-amber-600' },
  { label: 'Net Worth', tab: 'networth', icon: PiggyBank, color: 'text-emerald-600' },
  { label: 'Risk Profiler', tab: 'assess', icon: Shield, color: 'text-violet-600' },
];

const blogPosts = [
  {
    title: 'Why SIP is the Best Way to Build Wealth',
    excerpt: 'Systematic Investment Plans help you benefit from rupee cost averaging and the power of compounding. Learn how starting early can make a huge difference.',
    category: 'Investing Basics',
    readTime: '5 min read',
  },
  {
    title: 'Mutual Funds vs Fixed Deposits: Which is Better?',
    excerpt: 'Compare the risk, returns, liquidity, and tax efficiency of mutual funds and fixed deposits to make an informed investment decision.',
    category: 'Comparison',
    readTime: '7 min read',
  },
  {
    title: 'How to Choose the Right Mutual Fund for Your Goals',
    excerpt: 'From understanding your risk appetite to matching fund categories with your financial goals — a complete guide for new investors.',
    category: 'Guide',
    readTime: '6 min read',
  },
  {
    title: 'Tax Saving with ELSS: Everything You Need to Know',
    excerpt: 'ELSS funds offer tax deduction under Section 80C with the shortest lock-in among tax-saving instruments. Here is how to pick the right one.',
    category: 'Tax Planning',
    readTime: '4 min read',
  },
];

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setFormError('Name and phone number are required.');
      return;
    }
    setFormStatus('sending');
    setFormError('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit');
      }
      setFormStatus('success');
      setFormData({ name: '', email: '', phone: '', interest: '' });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong');
      setFormStatus('error');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-indigo-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>AMFI Registered Mutual Fund Distributor</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Plan Your Wealth with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                Nandalal
              </span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
              Your trusted partner for mutual fund investments. Get expert guidance,
              powerful tools, and personalized advice to grow your wealth systematically.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => onNavigate('calculators')}
                className="px-8 py-4 bg-white text-blue-900 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                Start Planning
              </button>
              <a
                href="#contact-form"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20 flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Get Free Consultation
              </a>
            </div>
          </div>

          {/* Quick Tools Bar */}
          <div className="mt-16 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <p className="text-sm text-blue-200 mb-4 text-center font-medium">Quick Access Tools</p>
            <div className="flex flex-wrap justify-center gap-3">
              {tools.map((tool) => (
                <button
                  key={tool.tab}
                  onClick={() => onNavigate(tool.tab)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm font-medium"
                >
                  <tool.icon className="w-4 h-4" />
                  {tool.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Fund Categories Showcase */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Invest in the Right Mutual Funds
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Choose from a wide range of mutual fund categories tailored to your financial goals and risk appetite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fundCategories.map((cat) => (
              <div
                key={cat.title}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100 group cursor-pointer"
                onClick={() => onNavigate('mutualfunds')}
              >
                <div className={`inline-flex p-3 rounded-xl ${cat.bgLight} mb-4`}>
                  <cat.icon className={`w-6 h-6 ${cat.textColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{cat.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{cat.description}</p>
                <div className="flex flex-wrap gap-2">
                  {cat.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-xs px-2.5 py-1 rounded-full ${cat.bgLight} ${cat.textColor} font-medium`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className={`mt-4 flex items-center gap-1 text-sm font-medium ${cat.textColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Explore <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Nandalal */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Invest with Nandalal?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'AMFI Registered',
                desc: 'Fully registered and compliant mutual fund distributor. Your investments are safe and regulated.',
              },
              {
                icon: Target,
                title: 'Goal-Based Planning',
                desc: 'Personalized investment strategies aligned to your life goals — retirement, education, home, and more.',
              },
              {
                icon: Calculator,
                title: 'Free Tools & Research',
                desc: 'Access SIP calculators, fund comparisons, and performance analytics — all completely free.',
              },
            ].map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className="inline-flex p-4 bg-blue-50 rounded-2xl mb-4">
                  <item.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-blue-600 font-medium mb-2">
              <BookOpen className="w-5 h-5" />
              Learn & Grow
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Investment Knowledge Hub
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Educational articles to help you make informed investment decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogPosts.map((post) => (
              <article
                key={post.title}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100 cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">{post.readTime}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                <span className="text-sm font-medium text-blue-600 flex items-center gap-1">
                  Read More <ArrowRight className="w-4 h-4" />
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Capture Form */}
      <section id="contact-form" className="py-20 px-4 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start Your Investment Journey Today
            </h2>
            <p className="text-blue-200 text-lg">
              Fill in your details and get a free consultation. No obligations, no charges.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-2xl">
            {formStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="inline-flex p-4 bg-green-50 rounded-full mb-4">
                  <Star className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-600 mb-6">
                  Your details have been received. Nandalal will get in touch with you shortly.
                </p>
                <button
                  onClick={() => setFormStatus('idle')}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Submit another enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="lead-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      id="lead-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lead-phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      id="lead-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label htmlFor="lead-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="lead-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="lead-interest" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Investment Interest
                    </label>
                    <select
                      id="lead-interest"
                      value={formData.interest}
                      onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-gray-900 bg-white"
                    >
                      <option value="">Select your interest</option>
                      <option value="sip">SIP (Monthly Investment)</option>
                      <option value="lumpsum">Lumpsum Investment</option>
                      <option value="tax-saving">Tax Saving (ELSS)</option>
                      <option value="retirement">Retirement Planning</option>
                      <option value="child-education">Child Education</option>
                      <option value="wealth-creation">Wealth Creation</option>
                      <option value="other">Other / Not Sure</option>
                    </select>
                  </div>
                </div>

                {formError && (
                  <p className="text-red-600 text-sm">{formError}</p>
                )}

                <button
                  type="submit"
                  disabled={formStatus === 'sending'}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  {formStatus === 'sending' ? 'Submitting...' : 'Get Free Consultation'}
                </button>
                <p className="text-xs text-gray-400 text-center">
                  Your information is secure and will only be used to contact you regarding investments.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Contact Buttons */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Get in Touch</h2>
          <p className="text-gray-600 mb-8">Reach out anytime for investment queries or to start your SIP.</p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/919876543210?text=Hi%20Nandalal%2C%20I%27m%20interested%20in%20mutual%20fund%20investments."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </a>
            <a
              href="tel:+919876543210"
              className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Phone className="w-5 h-5" />
              Call Now
            </a>
            <a
              href="mailto:nandalal@example.com?subject=Investment%20Enquiry"
              className="flex items-center gap-3 px-8 py-4 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl"
            >
              <Mail className="w-5 h-5" />
              Email
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-white font-semibold text-lg mb-2">Nandalal - Mutual Fund Distributor</p>
          <p className="text-sm mb-4">AMFI Registered | Helping you invest wisely</p>
          <p className="text-xs">
            Mutual fund investments are subject to market risks. Please read all scheme-related documents carefully before investing.
          </p>
        </div>
      </footer>
    </div>
  );
}
