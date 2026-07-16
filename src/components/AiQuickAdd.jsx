import { useState } from 'react';

function AiQuickAdd({ onAddTransaction }) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      await onAddTransaction(text.trim());
      setText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ai-quick-add">
      <h2>Quick Add with AI</h2>
      <form onSubmit={handleSubmit} className="ai-quick-add-form">
        <input
          type="text"
          placeholder='Try "spent $12 on lunch yesterday" or "paid rent $1400"'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" disabled={submitting || !text.trim()}>
          {submitting ? 'Thinking...' : 'Add'}
        </button>
      </form>
      {error && <p className="ai-quick-add-error">{error}</p>}
    </div>
  );
}

export default AiQuickAdd;
