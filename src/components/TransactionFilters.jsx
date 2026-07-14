function TransactionFilters({ filterType, onFilterTypeChange, filterCategory, onFilterCategoryChange, categories }) {
  return (
    <div className="filters">
      <select value={filterType} onChange={(e) => onFilterTypeChange(e.target.value)}>
        <option value="all">All Types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <select value={filterCategory} onChange={(e) => onFilterCategoryChange(e.target.value)}>
        <option value="all">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
    </div>
  );
}

export default TransactionFilters;
