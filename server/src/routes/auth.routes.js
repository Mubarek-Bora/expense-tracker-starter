const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const asyncHandler = require('../middleware/asyncHandler');
const { sendPasswordResetEmail } = require('../services/email');

const router = express.Router();

function isValidEmail(email) {
  return typeof email === 'string' && /^\S+@\S+\.\S+$/.test(email);
}

router.post('/register', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email is required' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash },
  });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: user.id, email: user.email } });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email } });
}));

router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email is required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond the same way, whether or not the email exists, to avoid leaking account existence.
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiresAt },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/?resetToken=${token}`;
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (err) {
      console.error(err);
    }
  }

  res.json({ message: 'If an account exists for that email, a reset link has been sent.' });
}));

router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Reset token is required' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const user = await prisma.user.findUnique({ where: { resetToken: token } });
  if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
    return res.status(400).json({ error: 'This reset link is invalid or has expired' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiresAt: null },
  });

  res.json({ message: 'Password updated. You can now log in.' });
}));

module.exports = router;
