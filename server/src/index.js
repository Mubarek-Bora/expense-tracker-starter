require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const transactionsRoutes = require('./routes/transactions.routes');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionsRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 3001;
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
}

module.exports = app;
