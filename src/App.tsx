import { useState } from 'react';
import SIPCalculator from './components/SIPCalculator';
import LumpsumCalculator from './components/LumpsumCalculator';

function App() {
  const [activeTab, setActiveTab] = useState<'sip' | 'lumpsum'>('sip');

  return (
    <div>
      <div className="flex justify-center pt-8 pb-2">
        <div className="inline-flex bg-gray-200 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('sip')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'sip'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            SIP Calculator
          </button>
          <button
            onClick={() => setActiveTab('lumpsum')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'lumpsum'
                ? 'bg-white text-purple-600 shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Lumpsum Calculator
          </button>
        </div>
      </div>

      {activeTab === 'sip' ? <SIPCalculator /> : <LumpsumCalculator />}
    </div>
  );
}

export default App;
