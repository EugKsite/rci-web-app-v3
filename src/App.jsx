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
  const [useThresholdStyle, setUseThresholdStyle] = useState(false);
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
    const rciThreshold = 1.96 * sdiff;
    const rciValue = (x2 - x1) / sdiff;
    const changeScore = Math.abs(x2 - x1);
    const significant = useThresholdStyle ? changeScore > rciThreshold : Math.abs(rciValue) > 1.96;

    setResults({ sem, sdiff, rciThreshold, rciValue, changeScore, significant });
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

    const { sem, sdiff, rciThreshold, rciValue, changeScore, significant } = results;
    const method = useThresholdStyle ? 'NCSS Method (Compare Change to Threshold)' : 'RCI Value Method';

    return (
      <div className="mt-8 p-6 bg-gray-800 rounded-2xl shadow-inner">
        <h3 className="text-2xl font-bold text-center text-teal-300 mb-6">Calculation Results</h3>
        <p className="text-center text-gray-300 mb-4 italic">Method: {method}</p>

        <div className="grid gap-4 text-white text-sm">
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <strong>Step 1:</strong> Standard Deviation (SD) = {stdDev}
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <strong>Step 2:</strong> Reliability Coefficient (r) = {reliability}
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <strong>Step 3:</strong> RCI Threshold = {rciThreshold.toFixed(2)}
            <br />Computed as: 1.96 × √(2 × (SD × √(1 − r))²)
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <strong>Step 4:</strong> Pre = {preScore}, Post = {postScore}, Change = {changeScore.toFixed(2)}
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <strong>Step 5:</strong> Interpretation:<br />
            {useThresholdStyle
              ? `${changeScore.toFixed(2)} ${changeScore > rciThreshold ? '>' : '<='} ${rciThreshold.toFixed(2)} → ${significant ? 'Significant' : 'Not significant'} change`
              : `RCI = ${rciValue.toFixed(2)} → ${Math.abs(rciValue)} > 1.96 → ${significant ? 'Significant' : 'Not significant'} change`}
          </div>
        </div>
      </div>
    );
  }, [results, useThresholdStyle]);

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-teal-300">Reliable Change Index (RCI)</h1>
          <p className="text-lg text-gray-400 mt-2">Evaluate the significance of score changes.</p>
        </header>

        <main className="bg-gray-800/50 border border-gray-700 p-6 md:p-8 rounded-2xl shadow-2xl">
          <form onSubmit={handleSubmit} onReset={handleReset}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="preScore" className="block text-sm font-medium text-gray-300 mb-2">
                  Pre-Test Score (X1)
                </label>
                <input type="number" step="any" id="preScore" value={preScore} onChange={(e) => setPreScore(e.target.value)} className="w-full bg-gray-900 border-2 border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-400" placeholder="e.g., 25" />
              </div>
              <div>
                <label htmlFor="postScore" className="block text-sm font-medium text-gray-300 mb-2">
                  Post-Test Score (X2)
                </label>
                <input type="number" step="any" id="postScore" value={postScore} onChange={(e) => setPostScore(e.target.value)} className="w-full bg-gray-900 border-2 border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-400" placeholder="e.g., 18" />
              </div>
              <div>
                <label htmlFor="stdDev" className="block text-sm font-medium text-gray-300 mb-2">
                  Standard Deviation (SD)
                </label>
                <input type="number" step="any" id="stdDev" value={stdDev} onChange={(e) => setStdDev(e.target.value)} className="w-full bg-gray-900 border-2 border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-400" placeholder="e.g., 8.5" />
              </div>
              <div>
                <label htmlFor="reliability" className="block text-sm font-medium text-gray-300 mb-2">
                  Reliability Coefficient (r)
                </label>
                <input type="number" step="any" id="reliability" value={reliability} onChange={(e) => setReliability(e.target.value)} className="w-full bg-gray-900 border-2 border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-400" placeholder="e.g., 0.88" />
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-300 flex items-center gap-2">
              <input type="checkbox" id="toggleStyle" checked={useThresholdStyle} onChange={() => setUseThresholdStyle(!useThresholdStyle)} />
              <label htmlFor="toggleStyle">Use NCSS style (compare change to threshold)</label>
            </div>

            {error && <div className="mt-6 text-center p-3 rounded-lg bg-red-800/80 text-red-200 font-semibold">{error}</div>}

            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button type="submit" className="w-full sm:w-auto bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-8 rounded-lg flex items-center justify-center gap-2">
                <Calculator className="w-5 h-5" /><span>Calculate RCI</span>
              </button>
              <button type="reset" className="w-full sm:w-auto bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5" /><span>Reset</span>
              </button>
            </div>
          </form>
        </main>

        {ResultsDisplay}
      </div>
    </div>
  );
}
