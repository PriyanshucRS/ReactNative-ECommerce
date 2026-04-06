require('dotenv').config();

const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const watchlistRoutes = require('./src/routes/watchlistRouter');

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());

app.use('/api/test', (req, res) => res.status(201).json({ message: 'Hello' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/watchlist', watchlistRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected successfully'))
  .catch(error => console.error('MongoDB connection error:', error));

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
