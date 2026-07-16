import { useState } from 'react';

function SpendingInsights({ onGenerate }) {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await onGenerate();
      setInsight(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="spending-insights">
      <h2>Spending Insights</h2>
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Analyzing...' : insight ? 'Refresh Insight' : 'Generate Insight'}
      </button>
      {error && <p className="ai-quick-add-error">{error}</p>}
      {insight && <p className="spending-insight-text">{insight}</p>}
    </div>
  );
}

export default SpendingInsights;
