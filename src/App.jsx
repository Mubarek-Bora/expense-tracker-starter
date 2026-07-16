import { useState, useEffect } from 'react'
import './App.css'
import { CATEGORIES } from './constants'
import { useAuth } from './AuthContext'
import AuthForm from './components/AuthForm'
import SummaryCards from './components/SummaryCards'
import AiQuickAdd from './components/AiQuickAdd'
import TransactionForm from './components/TransactionForm'
import TransactionFilters from './components/TransactionFilters'
import TransactionList from './components/TransactionList'
import CategoryChart from './components/CategoryChart'
import { getTransactions, createTransaction, createTransactionFromText, deleteTransaction } from './services/transactions.service'

function App() {
  const { token, user, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    if (!token) return;
    getTransactions(token)
      .then((data) => {
        setTransactions(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  if (!token) {
    return <AuthForm />;
  }

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const filteredTransactions = transactions.filter((t) => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    return true;
  });

  const handleAddTransaction = async (transaction) => {
    const created = await createTransaction(token, transaction);
    setTransactions((prev) => [created, ...prev]);
  };

  const handleAiAddTransaction = async (text) => {
    const created = await createTransactionFromText(token, text);
    setTransactions((prev) => [created, ...prev]);
  };

  const handleDeleteTransaction = async (id) => {
    await deleteTransaction(token, id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-logo">💰</span>
        <div className="app-header-text">
          <h1>Finance Tracker</h1>
          <p className="subtitle">Track your income and expenses</p>
        </div>
        <div className="app-header-actions">
          <span className="user-email">{user?.email}</span>
          <button className="logout-btn" onClick={logout}>Log out</button>
        </div>
      </header>

      {error && <div className="auth-error">{error}</div>}
      {loading ? (
        <p>Loading your transactions...</p>
      ) : (
        <>
          <SummaryCards totalIncome={totalIncome} totalExpenses={totalExpenses} balance={balance} />

          <CategoryChart transactions={transactions} />

          <AiQuickAdd onAddTransaction={handleAiAddTransaction} />

          <TransactionForm categories={CATEGORIES} onAddTransaction={handleAddTransaction} />

          <div className="transactions">
            <h2>Transactions</h2>
            <TransactionFilters
              filterType={filterType}
              onFilterTypeChange={setFilterType}
              filterCategory={filterCategory}
              onFilterCategoryChange={setFilterCategory}
              categories={CATEGORIES}
            />
            <TransactionList transactions={filteredTransactions} onDeleteTransaction={handleDeleteTransaction} />
          </div>
        </>
      )}
    </div>
  );
}

export default App
