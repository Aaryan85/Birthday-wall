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

// Clean production frontend URL (guaranteed NO trailing slash)
const FRONTEND_URL = (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://birthday-wall-one.vercel.app').trim().replace(/\/+$/, '');

const allowedOrigins = [
  FRONTEND_URL,
  'https://birthday-wall-one.vercel.app',
  'https://birthday.aaryanbuilds.in',
  'http://localhost:5173',
  'http://localhost:3000',
];

// Production CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.trim().replace(/\/+$/, '');
    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, cleanOrigin);
    }
    return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'OPTIONS', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-password'],
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Explicit preflight OPTIONS handler
app.options('*', cors());

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
      console.log(`✓ Birthday Wall backend server running on port ${PORT}`);
      console.log(`✓ CORS configured for origin: ${FRONTEND_URL}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    app.listen(PORT, () => {
      console.log(`✓ Birthday Wall server running on port ${PORT} (without active DB connection)`);
    });
  }
}

startServer();
