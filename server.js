// ============================================
// Bean There, Done That — Express Server 
// Author: [Student Name]
// Date: 2025
// Assignment: Cafe Tracker Application
// ============================================

'use strict';

require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const jwt        = require('jsonwebtoken'); // Brought in from middleware

const authRouter   = require('./routes/auth.routes');
const reviewRouter = require('./routes/review.routes');
const searchRouter = require('./routes/search.routes');
const userRouter   = require('./routes/user.routes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── General Middleware ────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());


function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user      = decoded;          // { id, username, email, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// ── Database connection ───────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅  MongoDB connected'))
  .catch((err) => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRouter);

// Example: You can now apply verifyToken directly to protect specific routers
// app.use('/api/reviews', verifyToken, reviewRouter);
app.use('/api/reviews', reviewRouter); 

app.use('/api/search',  searchRouter);

// Example: Or protect user routes
// app.use('/api/users', verifyToken, userRouter);
app.use('/api/users',   userRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'Bean There, Done That' });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`☕  Bean There server running on port ${PORT}`);
});