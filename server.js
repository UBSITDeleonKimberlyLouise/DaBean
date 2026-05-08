require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ── MODEL ─────────────────────────────
const Logs = mongoose.model('Log', new mongoose.Schema({
  cafe_name: String,
  category: String,
  rating: Number,
  best_dish: String,
  review_text: String,
  address: String,
  image_url: String,
  date_visited: String,
  companions: String,
  is_public: Boolean
}));

// ── GET REVIEWS ───────────────────────
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await Logs.find().sort({ _id: -1 });
    res.json(logs); // MUST return response
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST REVIEW (FIXED CRITICAL PART) ─
app.post('/api/logs', async (req, res) => {
  try {
    const log = new Logs(req.body);
    const saved = await log.save();

    console.log("Saved:", saved);

    res.status(201).json(saved); // 🔥 THIS FIXES YOUR LOADING ISSUE
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ── CONNECT DB ────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch(err => console.error(err));