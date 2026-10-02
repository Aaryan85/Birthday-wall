import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import birthdayRoutes from './routes/birthdayRoutes.js';
import Birthday from './models/Birthday.js';
import { initBirthdayScheduler } from './services/scheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/birthday_wall';

// Open CORS for all frontend clients (Vercel, Localhost, Custom Domains)
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/birthdays', birthdayRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Database Connection & Server Initialization
async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB successfully');

    // Initialize automated 12:00 AM daily birthday wishes scheduler
    initBirthdayScheduler();

    app.listen(PORT, () => {
      console.log(`✓ Birthday Wall backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    app.listen(PORT, () => {
      console.log(`✓ Birthday Wall server running on http://localhost:${PORT} (without active DB connection)`);
    });
  }
}

startServer();
