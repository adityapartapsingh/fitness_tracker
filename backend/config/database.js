const mongoose = require('mongoose');

// Read URIs from environment variables. Do NOT hardcode credentials here.
const MONGODB_ATLAS_URI = process.env.MONGODB_ATLAS_URI || null;
const MONGODB_LOCAL_URI = process.env.MONGODB_LOCAL_URI || 'mongodb://localhost:27017/fitness_tracker';

// Allow an explicit MONGODB_URI to override individual URIs
const MONGODB_URI = process.env.MONGODB_URI || MONGODB_ATLAS_URI || MONGODB_LOCAL_URI;

let mongoConnected = false;

const connectMongoDB = () => {
  if (!MONGODB_URI) {
    console.warn('⚠️  No MongoDB URI configured. Set MONGODB_ATLAS_URI or MONGODB_URI in .env');
    return;
  }

  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    w: 'majority',
  })
    .then(() => {
      mongoConnected = true;
      console.log('✅ MongoDB connected successfully');
    })
    .catch((err) => {
      mongoConnected = false;
      console.log('⚠️  MongoDB connection error (will retry):', err.message);
      setTimeout(connectMongoDB, 5000);
    });
};

const disconnectMongoDB = async () => {
  if (mongoConnected) {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

module.exports = {
  connectMongoDB,
  disconnectMongoDB,
  mongoConnected: () => mongoConnected,
};
