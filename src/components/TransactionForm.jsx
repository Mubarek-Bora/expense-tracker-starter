import { useState } from 'react';

function TransactionForm({ categories, onAddTransaction, onSuggestCategory }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState(categories[0]);
  const [submitting, setSubmitting] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  const handleSuggestCategory = async () => {
    if (!description.trim()) return;
    setSuggesting(true);
    try {
      const suggested = await onSuggestCategory(description.trim());
      setCategory(suggested);
    } catch {
      // silently ignore — user can still pick a category manually
    } finally {
      setSuggesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || !parsedAmount || parsedAmount <= 0) return;

    setSubmitting(true);
    try {
      await onAddTransaction({
        description: description.trim(),
        amount: parsedAmount,
        type,
        category,
        date: new Date().toISOString().split('T')[0],
      });
      setDescription("");
      setAmount("");
      setType("expense");
      setCategory(categories[0]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-transaction">
      <h2>Add Transaction</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="0.01"
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          type="button"
          className="suggest-category-btn"
          onClick={handleSuggestCategory}
          disabled={suggesting || !description.trim()}
        >
          {suggesting ? '...' : 'Suggest'}
        </button>
        <button type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add'}</button>
      </form>
    </div>
  );
}

export default TransactionForm;
