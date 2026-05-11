const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1. Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

// 2. Define the Schema and Model directly here
const reviewSchema = new mongoose.Schema({
    cafe_name:    String,
    yelp_id:      String,
    rating:       Number,
    review_text:  String,
    date_visited: String,
    companions:   String,
    best_dish:    String,
    is_visited:   { type: Boolean, default: true },
    is_public:    { type: Boolean, default: true },
    category:     String,
    address:      String,
    image_url:    String
});

const Review = mongoose.model('Review', reviewSchema);

// 3. Define the Routes directly here
app.post('/reviews', async (req, res) => {
    try {
        const newReview = new Review(req.body);
        const savedReview = await newReview.save();
        res.status(201).json(savedReview);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/reviews/public', async (req, res) => {
    try {
        // This finds all reviews where is_public is true
        const reviews = await Review.find({ is_public: true });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/reviews', async (req, res) => {
    try {
        const reviews = await Review.find();
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

