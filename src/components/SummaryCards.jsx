function SummaryCards({ totalIncome, totalExpenses, balance }) {
  return (
    <div className="summary">
      <div className="summary-card">
        <div className="summary-card-icon income-icon">↑</div>
        <div>
          <h3>Income</h3>
          <p className="income-amount">${totalIncome.toFixed(2)}</p>
        </div>
      </div>
      <div className="summary-card">
        <div className="summary-card-icon expense-icon">↓</div>
        <div>
          <h3>Expenses</h3>
          <p className="expense-amount">${totalExpenses.toFixed(2)}</p>
        </div>
      </div>
      <div className="summary-card">
        <div className="summary-card-icon balance-icon">$</div>
        <div>
          <h3>Balance</h3>
          <p className={balance >= 0 ? "income-amount" : "expense-amount"}>${balance.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

export default SummaryCards;
