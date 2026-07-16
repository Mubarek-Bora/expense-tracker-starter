const express = require('express');
const prisma = require('../prisma');
const requireAuth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { parseTransactionText, generateSpendingInsights, suggestCategory } = require('../services/ai');

const router = express.Router();
router.use(requireAuth);

function serialize(t) {
  return {
    id: t.id,
    description: t.description,
    amount: Number(t.amount),
    type: t.type,
    category: t.category,
    date: t.date.toISOString().split('T')[0],
  };
}

router.get('/', asyncHandler(async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId },
    orderBy: { date: 'desc' },
  });
  res.json(transactions.map(serialize));
}));

router.get('/insights', asyncHandler(async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId },
    orderBy: { date: 'desc' },
  });

  if (transactions.length === 0) {
    return res.json({ insight: 'Add a few transactions to see spending insights here.' });
  }

  let insight;
  try {
    insight = await generateSpendingInsights(transactions);
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: 'Could not generate insights right now. Try again shortly.' });
  }

  res.json({ insight });
}));

router.post('/', asyncHandler(async (req, res) => {
  const { description, amount, type, category, date } = req.body;

  if (!description || !description.trim()) {
    return res.status(400).json({ error: 'Description is required' });
  }
  const parsedAmount = Number(amount);
  if (!parsedAmount || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }
  if (type !== 'income' && type !== 'expense') {
    return res.status(400).json({ error: 'Type must be income or expense' });
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: req.userId,
      description: description.trim(),
      amount: parsedAmount,
      type,
      category: category || 'other',
      date: date ? new Date(date) : new Date(),
    },
  });

  res.status(201).json(serialize(transaction));
}));

router.post('/ai', asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  let parsed;
  try {
    parsed = await parseTransactionText(text.trim());
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: 'Could not understand that transaction. Try rephrasing it.' });
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: req.userId,
      description: parsed.description,
      amount: parsed.amount,
      type: parsed.type,
      category: parsed.category,
      date: new Date(parsed.date),
    },
  });

  res.status(201).json(serialize(transaction));
}));

router.post('/suggest-category', asyncHandler(async (req, res) => {
  const { description } = req.body;

  if (!description || !description.trim()) {
    return res.status(400).json({ error: 'Description is required' });
  }

  let category;
  try {
    category = await suggestCategory(description.trim());
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: 'Could not suggest a category right now.' });
  }

  res.json({ category });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.userId) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  await prisma.transaction.delete({ where: { id } });
  res.status(204).send();
}));

module.exports = router;
