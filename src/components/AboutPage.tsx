import {
  Shield,
  Target,
  Users,
  Award,
  CheckCircle,
  TrendingUp,
  Heart,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  Star,
  Calculator,
  BarChart3,
  FileText,
  Wallet,
} from 'lucide-react';

interface AboutPageProps {
  onNavigate?: (tab: string) => void;
}

const services = [
  {
    icon: TrendingUp,
    title: 'Mutual Fund Advisory',
    description: 'Personalized mutual fund recommendations based on your goals, risk profile, and time horizon. We help you choose the right funds from 40+ AMCs.',
  },
  {
    icon: Target,
    title: 'Goal-Based Planning',
    description: 'Whether it is retirement, child education, home purchase, or wealth creation — we create a customized investment plan aligned to each of your life goals.',
  },
  {
    icon: FileText,
    title: 'Portfolio Review',
    description: 'Regular review of your existing portfolio. We identify underperforming funds, suggest replacements, and ensure your portfolio stays aligned with your goals.',
  },
  {
    icon: Calculator,
    title: 'SIP Planning',
    description: 'Start with as little as Rs 500/month. We help you set up SIPs with step-up options so your investments grow with your income.',
  },
  {
    icon: Shield,
    title: 'Risk Profiler',
    description: 'Scientific risk profiling to understand your risk appetite. We never recommend products that don\'t match your comfort level.',
  },
  {
    icon: Wallet,
    title: 'Tax Planning',
    description: 'Optimize your taxes with ELSS funds under Section 80C. We help you plan tax-saving investments that also give good long-term returns.',
  },
];

const values = [
  {
    icon: Heart,
    title: 'Client First',
    description: 'Your financial wellbeing is our priority. We recommend what is right for you, not what pays us more.',
  },
  {
    icon: Shield,
    title: 'Transparency',
    description: 'No hidden charges, no misleading promises. We explain everything in simple language and set realistic expectations.',
  },
  {
    icon: Award,
    title: 'Expertise',
    description: 'Backed by deep market knowledge and continuous learning. We stay updated with the latest regulations and market trends.',
  },
  {
    icon: Users,
    title: 'Long-term Relationships',
    description: 'We don\'t just sell products — we build lifelong relationships. Your success is our success.',
  },
];

const tools = [
  { icon: Calculator, label: 'Calculators', tab: 'calculators' },
  { icon: BarChart3, label: 'Fund Explorer', tab: 'mutualfunds' },
  { icon: FileText, label: 'Portfolio Analyzer', tab: 'portfolio' },
  { icon: Wallet, label: 'Net Worth Calculator', tab: 'networth' },
  { icon: Shield, label: 'Risk Profiler', tab: 'assess' },
  { icon: Target, label: 'Fund Comparison', tab: 'compare' },
];

export default function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm mb-6">
            <Award className="w-4 h-4 text-yellow-400" />
            AMFI Registered Mutual Fund Distributor
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">Nandalal</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Helping Indian families build wealth through disciplined mutual fund investing.
            We believe everyone deserves access to professional financial guidance,
            regardless of the amount they invest.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We started Nandalal with a simple belief: every Indian should have access to
                trustworthy financial advice. Too many people leave their savings in low-return
                instruments like FDs or get misled by agents selling wrong products.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our mission is to educate, guide, and empower investors to make informed decisions.
                Whether you are investing Rs 500 or Rs 5 lakh, you get the same quality of advice and attention.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We leverage technology — calculators, portfolio analyzers, risk assessments — combined
                with personal guidance to make investing simple and effective.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
              <div className="space-y-5">
                {[
                  { number: '500+', label: 'Happy Clients', icon: Users },
                  { number: '10+', label: 'Years of Experience', icon: Clock },
                  { number: '40+', label: 'AMC Partners', icon: TrendingUp },
                  { number: 'Rs 25Cr+', label: 'Assets Under Advisory', icon: Star },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <stat.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.number}</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">What We Offer</h2>
            <p className="text-gray-600">Comprehensive mutual fund distribution and advisory services</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                <div className="p-3 bg-blue-50 rounded-xl w-fit mb-4">
                  <s.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Values</h2>
            <p className="text-gray-600">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="flex gap-4 p-5 rounded-xl border border-gray-100 hover:border-blue-200 transition-all">
                <div className="p-2 bg-blue-50 rounded-lg h-fit">
                  <v.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{v.title}</h3>
                  <p className="text-sm text-gray-600">{v.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Invest with Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'AMFI registered and fully compliant',
              'No hidden charges — complete fee transparency',
              'Personalized advice, not one-size-fits-all',
              'Free financial tools and calculators',
              'Regular portfolio reviews and rebalancing',
              'Support for NRI investments',
              'Tax-efficient investment strategies',
              'WhatsApp and phone support',
              'Goal-based investment planning',
              'Educational content and market updates',
            ].map((point) => (
              <div key={point} className="flex items-center gap-3 bg-white px-5 py-3.5 rounded-xl shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Tools */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Free Tools for You</h2>
          <p className="text-gray-600 mb-8">Use our suite of financial tools — completely free, no login required</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <button
                key={tool.tab}
                onClick={() => onNavigate?.(tool.tab)}
                className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-2xl hover:bg-blue-50 hover:border-blue-200 border border-gray-100 transition-all group"
              >
                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-all">
                  <tool.icon className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Get in Touch</h2>
            <p className="text-blue-200">We are here to help you start your investment journey</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="https://wa.me/919876543210?text=Hi%20Nandalal%2C%20I%27m%20interested%20in%20mutual%20fund%20investments."
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 p-6 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10"
            >
              <MessageCircle className="w-8 h-8" />
              <p className="font-semibold">WhatsApp</p>
              <p className="text-sm text-blue-200">Quick responses</p>
            </a>
            <a
              href="tel:+919876543210"
              className="flex flex-col items-center gap-3 p-6 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10"
            >
              <Phone className="w-8 h-8" />
              <p className="font-semibold">Call Us</p>
              <p className="text-sm text-blue-200">+91 98765 43210</p>
            </a>
            <a
              href="mailto:nandalal@example.com?subject=Investment%20Enquiry"
              className="flex flex-col items-center gap-3 p-6 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10"
            >
              <Mail className="w-8 h-8" />
              <p className="font-semibold">Email</p>
              <p className="text-sm text-blue-200">nandalal@example.com</p>
            </a>
          </div>
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-blue-200 text-sm">
              <MapPin className="w-4 h-4" />
              <span>Mumbai, Maharashtra, India</span>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center text-xs space-y-2">
          <p className="text-white font-semibold text-sm">Nandalal - AMFI Registered Mutual Fund Distributor</p>
          <p>ARN: ARN-XXXXXX | EUIN: E-XXXXXX</p>
          <p>
            Mutual fund investments are subject to market risks. Please read all scheme-related documents carefully before investing.
            Past performance is not indicative of future results.
          </p>
        </div>
      </footer>
    </div>
  );
}
