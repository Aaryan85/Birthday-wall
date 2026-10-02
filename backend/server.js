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

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
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

    // Seed initial verified mock birthdays if database is completely empty
    const count = await Birthday.countDocuments();
    if (count === 0) {
      console.log('Seeding initial verified birthdays...');
      const seedData = [
        { name: 'Arjun Kapoor', dob: new Date(1996, 9, 2), email: 'arjun@example.com', emailVerified: true },
        { name: 'Maya Lin', dob: new Date(1998, 9, 2), email: 'maya@example.com', emailVerified: true },
        { name: 'Rahul Sharma', dob: new Date(1995, 9, 5), email: 'rahul@example.com', emailVerified: true },
        { name: 'Sneha Patil', dob: new Date(1997, 9, 8), email: 'sneha@example.com', emailVerified: true },
        { name: 'Aditya Mehta', dob: new Date(1994, 9, 15), email: 'aditya@example.com', emailVerified: true },
        { name: 'Ananya Iyer', dob: new Date(1996, 9, 20), email: 'ananya@example.com', emailVerified: true },
        { name: 'Vikram Singhania', dob: new Date(1993, 9, 24), email: 'vikram@example.com', emailVerified: true },
        { name: 'Pooja Deshmukh', dob: new Date(1997, 9, 31), email: 'pooja@example.com', emailVerified: true },
      ];
      await Birthday.insertMany(seedData);
      console.log('✓ Initial verified birthdays seeded');
    }

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
