import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#00fff5', '#ff00aa', '#ffd500', '#00ffb3', '#7c4dff', '#ff8a00', '#8892b0'];

function CategoryChart({ transactions }) {
  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const data = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  if (data.length === 0) {
    return (
      <div className="category-chart">
        <h2>Spending by Category</h2>
        <p>No expenses to chart yet.</p>
      </div>
    );
  }

  return (
    <div className="category-chart">
      <h2>Spending by Category</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `$${value.toFixed(2)}`}
            contentStyle={{ background: '#252b4a', border: '1px solid rgba(0,255,245,0.2)', borderRadius: 0, fontFamily: 'DM Sans, sans-serif' }}
            itemStyle={{ color: '#e8edf5' }}
            labelStyle={{ color: '#e8edf5' }}
          />
          <Legend wrapperStyle={{ color: '#8892b0', fontFamily: 'DM Sans, sans-serif', fontSize: 13 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CategoryChart;
