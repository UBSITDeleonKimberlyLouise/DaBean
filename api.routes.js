// ============================================
// Bean There, Done That — Master API Routes
// Author: [Student Name]
// Date: 2025
// Assignment: Cafe Tracker Application
// ============================================

'use strict';

const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const mongoose = require('mongoose');
const fetch    = require('node-fetch');

const router = express.Router();

// ============================================================================
// 1. MIDDLEWARE
// ============================================================================

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user      = decoded; // { id, username, email, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// ============================================================================
// 2. MONGOOSE SCHEMAS
// ============================================================================

const userSchema = new mongoose.Schema({
  username:        { type: String, required: true, unique: true, trim: true },
  email:           { type: String, required: true, unique: true, lowercase: true, trim: true },
  hashed_password: { type: String, required: true },
  date_joined:     { type: Date,   default: Date.now }
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const reviewSchema = new mongoose.Schema({
  user_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  username:     { type: String, default: 'guest' },
  cafe_name:    { type: String, required: true, trim: true },
  yelp_id:      { type: String, default: '' },
  address:      { type: String, default: '' },
  category:     { type: String, default: '' },
  image_url:    { type: String, default: '' },
  rating:       { type: Number, min: 1, max: 5, required: true },
  review_text:  { type: String, default: '' },
  date_visited: { type: String, default: '' },
  companions:   { type: String, default: '' },
  best_dish:    { type: String, default: '' },
  is_visited:   { type: Boolean, default: true },
  is_public:    { type: Boolean, default: true },
  created_at:   { type: Date, default: Date.now }
});
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

// Helper: sign a JWT
function signToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ============================================================================
// 3. AUTH ROUTES
// ============================================================================

router.post('/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) return res.status(400).json({ message: 'All fields are required.' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

  try {
    if (await User.findOne({ email })) return res.status(409).json({ message: 'Email already exists.' });
    if (await User.findOne({ username })) return res.status(409).json({ message: 'Username is taken.' });

    const hashed_password = await bcrypt.hash(password, 12);
    const user            = await User.create({ username, email, hashed_password });
    const token           = signToken(user);

    res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email, date_joined: user.date_joined } });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.hashed_password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user);
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, date_joined: user.date_joined } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// ============================================================================
// 4. REVIEW ROUTES
// ============================================================================

router.get('/reviews/public', async (req, res) => {
  const { rating, type } = req.query;
  const query = { is_public: true };

  if (rating) query.rating = Number(rating);
  if (type)   query.category = { $regex: type, $options: 'i' };

  try {
    const reviews = await Review.find(query).sort({ created_at: -1 }).limit(60).lean();
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: 'Could not load reviews.' });
  }
});

router.get('/reviews/mine', verifyToken, async (req, res) => {
  try {
    const reviews = await Review.find({ user_id: req.user.id }).sort({ created_at: -1 }).lean();
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: 'Could not load your reviews.' });
  }
});

router.get('/reviews/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, user_id: req.user.id }).lean();
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    res.json({ review });
  } catch (err) {
    res.status(500).json({ message: 'Could not load review.' });
  }
});

router.post('/reviews', async (req, res) => {
  const { cafe_name, rating, review_text, date_visited, companions, best_dish, is_public } = req.body;
  if (!cafe_name || !rating) return res.status(400).json({ message: 'cafe_name and rating are required.' });

  try {
    const review = await Review.create({
      user_id:      new mongoose.Types.ObjectId(),
      username:     'guest',
      cafe_name,
      yelp_id:      '',
      rating,
      review_text:  review_text  || '',
      date_visited: date_visited || '',
      companions:   companions   || '',
      best_dish:    best_dish    || '',
      is_visited:   true,
      is_public:    is_public !== undefined ? is_public : true,
      category:     '',
      address:      '',
      image_url:    ''
    });
    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ message: 'Could not save review.' });
  }
});

router.put('/reviews/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean();
    if (!review) return res.status(404).json({ message: 'Review not found or not authorised.' });
    res.json({ review });
  } catch (err) {
    res.status(500).json({ message: 'Could not update review.' });
  }
});

router.delete('/reviews/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    if (!review) return res.status(404).json({ message: 'Review not found or not authorised.' });
    res.json({ message: 'Review removed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete review.' });
  }
});

// ============================================================================
// 5. SEARCH ROUTES (YELP PROXY)
// ============================================================================

router.get('/search', async (req, res) => {
  const { term = 'coffee', location = 'Manila', limit = 20 } = req.query;
  if (!location) return res.status(400).json({ message: 'Location is required.' });

  const params = new URLSearchParams({
    term, location, limit: Math.min(Number(limit), 50),
    categories: 'coffee,cafes,bakeries,breakfast_brunch', sort_by: 'best_match'
  });

  try {
    const yelpRes = await fetch(`https://api.yelp.com/v3/businesses/search?${params.toString()}`, {
      headers: { Authorization: `Bearer ${process.env.YELP_API_KEY}`, 'Accept': 'application/json' }
    });

    if (!yelpRes.ok) {
      const errBody = await yelpRes.json().catch(() => ({}));
      return res.status(yelpRes.status).json({ message: errBody.error?.description || 'Yelp API error.' });
    }

    const data = await yelpRes.json();
    const businesses = (data.businesses || []).map(b => ({
      id: b.id, name: b.name, image_url: b.image_url || '', url: b.url || '',
      rating: b.rating || 0, review_count: b.review_count || 0, price: b.price || '',
      categories: b.categories || [], location: { address1: b.location?.address1 || '', city: b.location?.city || '', display_address: b.location?.display_address || [] }
    }));
    res.json({ businesses });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reach Yelp. Please try again.' });
  }
});

// ============================================================================
// 6. USER BADGE ROUTES
// ============================================================================

const BADGE_DEFS = [
  { id: 'first_log', name: 'First Sip', icon: '☕', description: 'Logged your very first cafe', check: (reviews) => reviews.length >= 1 },
  { id: 'five_logs', name: 'Regular', icon: '🏠', description: 'Logged 5 cafes', check: (reviews) => reviews.filter(r => r.is_visited).length >= 5 },
  { id: 'ten_logs', name: 'Dedicated Drinker', icon: '🌟', description: 'Logged 10 visited cafes', check: (reviews) => reviews.filter(r => r.is_visited).length >= 10 },
  { id: 'local_expert', name: 'Local Expert', icon: '📍', description: '5+ cafes visited in one city', check: (reviews) => {
      const cityCounts = {};
      reviews.filter(r => r.is_visited && r.address).forEach(r => {
        const parts = r.address.split(',');
        const city  = parts.length > 1 ? parts[parts.length - 2].trim() : parts[0].trim();
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      });
      return Object.values(cityCounts).some(count => count >= 5);
    }
  },
  { id: 'five_star_fan', name: 'Five Star Fan', icon: '⭐', description: 'Given 5 stars to 3 different cafes', check: (reviews) => reviews.filter(r => r.rating === 5).length >= 3 },
  { id: 'wishlist_dreamer', name: 'Dreamer', icon: '♡', description: 'Added 5 spots to your wishlist', check: (reviews) => reviews.filter(r => !r.is_visited).length >= 5 }
];

router.get('/users/badges', verifyToken, async (req, res) => {
  try {
    const reviews = await Review.find({ user_id: req.user.id }).select('cafe_name address rating is_visited created_at').lean();
    const earned = BADGE_DEFS.filter(def => def.check(reviews)).map(({ id, name, icon, description }) => ({ id, name, icon, description }));
    res.json({ badges: earned });
  } catch (err) {
    res.status(500).json({ message: 'Could not load badges.' });
  }
});

// ============================================================================
// EXPORT MASTER ROUTER
// ============================================================================
module.exports = router;