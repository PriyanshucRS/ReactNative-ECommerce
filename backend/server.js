const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1']);

const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const { verifySmtpOnStartup } = require('./src/controllers/auth.controller');
const { connectMongo } = require('./src/service/mongoService');
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

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectMongo();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (MongoDB connected)`);
    verifySmtpOnStartup();
  });
};

startServer().catch(error => {
  console.error('Failed to start server:', error?.message || error);
  process.exit(1);
});
