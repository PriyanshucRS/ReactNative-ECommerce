const mongoose = require('mongoose');

let isConnecting = false;

const connectMongo = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (isConnecting) return mongoose.connection;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing in backend/.env');
  }

  isConnecting = true;
  try {
    await mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DB_NAME || 'awesomeproject',
    });
    return mongoose.connection;
  } finally {
    isConnecting = false;
  }
};

module.exports = { connectMongo };
