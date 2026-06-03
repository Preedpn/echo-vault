// backend/app.js


const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const uploadRoutes = require('./routes/upload');



const app = express();

// Enable CORS for all incoming cross-origin frontend requests
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use('/api', uploadRoutes);

async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable is missing from .env');
    return;
  }
  
  // Explicitly track database connection failure or success states
  mongoose.connection.on('connected', () => console.log('Successfully connected to MongoDB Cluster.'));
  mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
  
  await mongoose.connect(uri);
}

async function start() {
  await connectMongo();

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`echo-vault backend listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start backend:', err);
  process.exit(1);
});

module.exports = app;