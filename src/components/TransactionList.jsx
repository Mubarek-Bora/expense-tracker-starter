function TransactionList({ transactions, onDeleteTransaction }) {
  if (transactions.length === 0) {
    return <p>No transactions match the current filters.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Category</th>
          <th>Amount</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t) => (
          <tr key={t.id}>
            <td>{t.date}</td>
            <td>{t.description}</td>
            <td>{t.category}</td>
            <td className={t.type === "income" ? "income-amount" : "expense-amount"}>
              {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
            </td>
            <td>
              <button className="delete-btn" onClick={() => onDeleteTransaction(t.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TransactionList;
