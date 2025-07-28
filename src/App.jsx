
import React, { useState, useMemo } from 'react';
import { Calculator, HelpCircle, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

const InfoTooltip = ({ text }) => (
  <span className="group relative inline-block">
    <HelpCircle className="w-4 h-4 text-gray-400 cursor-pointer ml-1" />
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </span>
  </span>
);

export default function App() {
  const [preScore, setPreScore] = useState('');
  const [postScore, setPostScore] = useState('');
  const [stdDev, setStdDev] = useState('');
  const [reliability, setReliability] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const calculateRCI = () => {
    setError('');
    setResults(null);

    const x1 = parseFloat(preScore);
    const x2 = parseFloat(postScore);
    const sd = parseFloat(stdDev);
    const r = parseFloat(reliability);

    if (isNaN(x1) || isNaN(x2) || isNaN(sd) || isNaN(r)) {
      setError('All fields must be filled with valid numbers.');
      return;
    }
    if (sd <= 0) {
      setError('Standard Deviation must be greater than 0.');
      return;
    }
    if (r < 0 || r > 1) {
      setError('Reliability coefficient must be between 0 and 1.');
      return;
    }

    const sem = sd * Math.sqrt(1 - r);
    const sdiff = Math.sqrt(2 * Math.pow(sem, 2));
    const rci = (x2 - x1) / sdiff;

    setResults({ sem, sdiff, rci });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateRCI();
  };

  const handleReset = () => {
    setPreScore('');
    setPostScore('');
    setStdDev('');
    setReliability('');
    setResults(null);
    setError('');
  };

  const ResultsDisplay = useMemo(() => {
    if (!results) return null;
    let interpretation = '';
    let bgColor = 'bg-gray-700/80';
    let textColor = 'text-gray-200';
    let Icon = Minus;

    if (results.rci < -1.96) {
      interpretation = 'The improvement is statistically reliable.';
      bgColor = 'bg-green-800/80';
      textColor = 'text-green-200';
      Icon = TrendingDown;
    } else if (results.rci > 1.96) {
      interpretation = 'The decline is statistically reliable.';
      bgColor = 'bg-red-800/80';
      textColor = 'text-red-200';
      Icon = TrendingUp;
    } else {
      interpretation = 'The change is not statistically reliable.';
    }

    return (
      <div className="mt-8 p-6 bg-gray-800 rounded-2xl shadow-inner">
        <h3 className="text-2xl font-bold text-center text-teal-300 mb-6">Calculation Results</h3>
        <div className="text-center mb-6">
          <p className="text-lg text-gray-400">Reliable Change Index (RCI)</p>
          <p className="text-5xl font-bold text-white my-2">{results.rci.toFixed(2)}</p>
        </div>
      </div>
    );
  }, [results]);

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-300">Reliable Change Index (RCI)</h1>
          <p className="text-lg text-gray-400 mt-2">Evaluate the significance of score changes.</p>
        </header>
        <form onSubmit={handleSubmit} onReset={handleReset}>
          <input placeholder="Pre-score" value={preScore} onChange={(e) => setPreScore(e.target.value)} />
          <input placeholder="Post-score" value={postScore} onChange={(e) => setPostScore(e.target.value)} />
          <input placeholder="SD" value={stdDev} onChange={(e) => setStdDev(e.target.value)} />
          <input placeholder="Reliability" value={reliability} onChange={(e) => setReliability(e.target.value)} />
          <button type="submit">Calculate</button>
          <button type="reset">Reset</button>
        </form>
        {error && <p>{error}</p>}
        {ResultsDisplay}
      </div>
    </div>
  );
}
