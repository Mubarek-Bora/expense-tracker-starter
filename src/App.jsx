import { useState } from 'react'
import './App.css'
import { CATEGORIES } from './constants'
import { useLocalStorage } from './useLocalStorage'
import SummaryCards from './components/SummaryCards'
import TransactionForm from './components/TransactionForm'
import TransactionFilters from './components/TransactionFilters'
import TransactionList from './components/TransactionList'
import CategoryChart from './components/CategoryChart'

const INITIAL_TRANSACTIONS = [
  { id: 1, description: "Salary", amount: 5000, type: "income", category: "salary", date: "2025-01-01" },
  { id: 2, description: "Rent", amount: 1200, type: "expense", category: "housing", date: "2025-01-02" },
  { id: 3, description: "Groceries", amount: 150, type: "expense", category: "food", date: "2025-01-03" },
  { id: 4, description: "Freelance Work", amount: 800, type: "expense", category: "salary", date: "2025-01-05" },
  { id: 5, description: "Electric Bill", amount: 95, type: "expense", category: "utilities", date: "2025-01-06" },
  { id: 6, description: "Dinner Out", amount: 65, type: "expense", category: "food", date: "2025-01-07" },
  { id: 7, description: "Gas", amount: 45, type: "expense", category: "transport", date: "2025-01-08" },
  { id: 8, description: "Netflix", amount: 15, type: "expense", category: "entertainment", date: "2025-01-10" },
];

function App() {
  const [transactions, setTransactions] = useLocalStorage("transactions", INITIAL_TRANSACTIONS);
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

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

  const handleAddTransaction = (transaction) => {
    setTransactions([...transactions, transaction]);
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-logo">💰</span>
        <div>
          <h1>Finance Tracker</h1>
          <p className="subtitle">Track your income and expenses</p>
        </div>
      </header>

      <SummaryCards totalIncome={totalIncome} totalExpenses={totalExpenses} balance={balance} />

      <CategoryChart transactions={transactions} />

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
    </div>
  );
}

export default App
