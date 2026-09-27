require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const postRoutes = require('./routes/posts');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const PORT = process.env.PORT || 5050;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lost_and_found';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();

// Middleware
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: '1mb' })); // parse JSON request bodies

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/posts', postRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
