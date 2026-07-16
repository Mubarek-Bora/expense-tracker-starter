const Anthropic = require('@anthropic-ai/sdk');

const CATEGORIES = ['food', 'housing', 'utilities', 'transport', 'entertainment', 'salary', 'other'];

const client = new Anthropic();

const TRANSACTION_SCHEMA = {
  type: 'object',
  properties: {
    description: { type: 'string', description: 'Short human-readable description of the transaction' },
    amount: { type: 'number', description: 'Positive number, the transaction amount' },
    type: { type: 'string', enum: ['income', 'expense'] },
    category: { type: 'string', enum: CATEGORIES },
    date: { type: 'string', format: 'date', description: 'ISO date (YYYY-MM-DD) the transaction occurred' },
  },
  required: ['description', 'amount', 'type', 'category', 'date'],
  additionalProperties: false,
};

async function parseTransactionText(text) {
  const today = new Date().toISOString().split('T')[0];

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 512,
    system: `Extract a single financial transaction from the user's message. Today's date is ${today}; resolve relative dates ("yesterday", "last Friday") against it. Pick the closest matching category from the allowed list; use "other" if nothing fits.`,
    messages: [{ role: 'user', content: text }],
    output_config: { format: { type: 'json_schema', schema: TRANSACTION_SCHEMA } },
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return JSON.parse(textBlock.text);
}

function buildMonthlyStats(transactions) {
  const byMonth = {};

  for (const t of transactions) {
    const month = t.date.toISOString().slice(0, 7);
    if (!byMonth[month]) byMonth[month] = { income: 0, expense: 0, byCategory: {} };

    const amount = Number(t.amount);
    if (t.type === 'income') {
      byMonth[month].income += amount;
    } else {
      byMonth[month].expense += amount;
      byMonth[month].byCategory[t.category] = (byMonth[month].byCategory[t.category] || 0) + amount;
    }
  }

  return Object.entries(byMonth)
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .slice(0, 6)
    .map(([month, stats]) => ({
      month,
      income: Math.round(stats.income * 100) / 100,
      expense: Math.round(stats.expense * 100) / 100,
      byCategory: Object.fromEntries(
        Object.entries(stats.byCategory).map(([cat, amt]) => [
          cat,
          {
            amount: Math.round(amt * 100) / 100,
            pctOfExpense: stats.expense > 0 ? Math.round((amt / stats.expense) * 1000) / 10 : 0,
          },
        ]),
      ),
    }));
}

async function generateSpendingInsights(transactions) {
  const monthlyStats = buildMonthlyStats(transactions);

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 300,
    system: 'You are a personal finance assistant. Given a user\'s monthly spending data (most recent month first, with each category\'s amount and its pre-computed pctOfExpense), write a short, specific insight — 2 to 4 sentences, plain text, no markdown. Use only the numbers and percentages given in the data — do not calculate your own percentages or totals. Call out month-over-month changes where the data allows it. If there is only one month of data, just summarize that month simply instead of comparing.',
    messages: [{ role: 'user', content: JSON.stringify(monthlyStats) }],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock.text;
}

const CATEGORY_SCHEMA = {
  type: 'object',
  properties: {
    category: { type: 'string', enum: CATEGORIES },
  },
  required: ['category'],
  additionalProperties: false,
};

async function suggestCategory(description) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 100,
    system: 'Pick the single best-fitting category for this transaction description from the allowed list. Use "other" if nothing fits well.',
    messages: [{ role: 'user', content: description }],
    output_config: { format: { type: 'json_schema', schema: CATEGORY_SCHEMA } },
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return JSON.parse(textBlock.text).category;
}

module.exports = { parseTransactionText, generateSpendingInsights, suggestCategory, CATEGORIES };
