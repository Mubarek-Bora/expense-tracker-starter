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

module.exports = { parseTransactionText, CATEGORIES };
