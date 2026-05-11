const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1. MongoDB Connection
// Make sure your .env file has MONGODB_URI=your_connection_string
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// 2. Review Schema & Model
const reviewSchema = new mongoose.Schema({
    cafe_name: { type: String, required: true },
    rating: { type: Number, required: true },
    review_text: String,
    date_visited: String,
    companions: String,
    best_dish: String,
    is_public: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);

// 3. API Routes

/**
 * GET /reviews/public
 * Fetches all reviews intended for the community feed
 */
app.get('/reviews/public', async (req, res) => {
    try {
        const reviews = await Review.find({ is_public: true })
            .sort({ created_at: -1 }); // Newest first
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

/**
 * POST /reviews
 * Saves a new guest log to the database
 */
app.post('/reviews', async (req, res) => {
    try {
        const newReview = new Review(req.body);
        const savedReview = await newReview.save();
        res.status(201).json(savedReview);
    } catch (err) {
        res.status(400).json({ error: 'Failed to save review', details: err.message });
    }
});

/**
 * DELETE /reviews/:id
 * Optional: Allows for cleaning up records if needed
 */
app.delete('/reviews/:id', async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Review deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

app.get('/api/osm-proxy', async (req, res) => {
  const { q } = req.query;
  const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=15`, {
    headers: { 'User-Agent': 'MyCafeApp/1.0' }
  });
  const data = await response.json();
  res.json(data);
});

// 4. Server Initialization
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});