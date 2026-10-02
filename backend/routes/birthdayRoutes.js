import express from 'express';
import crypto from 'crypto';
import Birthday from '../models/Birthday.js';
import { emailService } from '../services/emailService.js';
import { sendDailyBirthdayWishes } from '../services/scheduler.js';

const router = express.Router();

// Admin Authentication Middleware
function requireAdmin(req, res, next) {
  const adminPass = req.headers['x-admin-password'] || req.query.adminPassword;
  const configuredPass = process.env.ADMIN_PASSWORD || 'admin123';

  if (!adminPass || adminPass !== configuredPass) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Invalid admin password.' });
  }
  next();
}

/**
 * GET /api/birthdays
 * Returns verified birthdays ONLY. NEVER exposes email addresses.
 */
router.get('/', async (req, res) => {
  try {
    const birthdays = await Birthday.find({ emailVerified: true })
      .select('_id name dob createdAt')
      .lean();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    const sorted = birthdays.sort((a, b) => {
      const dateA = new Date(a.dob);
      const dateB = new Date(b.dob);

      const monthA = dateA.getMonth();
      const dayA = dateA.getDate();

      const monthB = dateB.getMonth();
      const dayB = dateB.getDate();

      const getDiff = (m, d) => {
        let diff = (m - currentMonth) * 31 + (d - currentDay);
        if (diff < 0) diff += 372;
        return diff;
      };

      return getDiff(monthA, dayA) - getDiff(monthB, dayB);
    });

    res.json({
      success: true,
      data: sorted,
    });
  } catch (error) {
    console.error('Error fetching birthdays:', error);
    res.status(500).json({ success: false, message: 'Server error fetching birthdays' });
  }
});

/**
 * GET /api/birthdays/count
 * Returns the total count of verified birthdays.
 */
router.get('/count', async (req, res) => {
  try {
    const count = await Birthday.countDocuments({ emailVerified: true });
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error counting birthdays:', error);
    res.status(500).json({ success: false, message: 'Server error counting birthdays' });
  }
});

/**
 * POST /api/birthdays
 * Register a birthday and send verification email.
 */
router.post('/', async (req, res) => {
  try {
    const { name, dob, email } = req.body;

    if (!name || !dob || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name, birthday date, and email are all required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    let birthday = await Birthday.findOne({ email: normalizedEmail });

    if (birthday) {
      if (birthday.emailVerified) {
        return res.status(409).json({
          success: false,
          message: 'This email is already registered on the Birthday Wall.',
        });
      }

      birthday.name = name.trim();
      birthday.dob = new Date(dob);
      birthday.verificationToken = verificationToken;
      birthday.verificationTokenExpires = verificationTokenExpires;
      await birthday.save();
    } else {
      birthday = new Birthday({
        name: name.trim(),
        dob: new Date(dob),
        email: normalizedEmail,
        emailVerified: false,
        verificationToken,
        verificationTokenExpires,
      });
      await birthday.save();
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;

    await emailService.sendVerificationEmail({
      email: normalizedEmail,
      name: birthday.name,
      token: verificationToken,
      clientUrl,
      serverUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    });
  } catch (error) {
    console.error('Error creating birthday entry:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered on the Birthday Wall.',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error processing your birthday submission.',
    });
  }
});

/**
 * GET /api/birthdays/verify/:token
 * Verifies email token and marks the birthday as verified.
 */
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (!token) {
      return res.redirect(`${clientUrl}/?verificationError=missing_token`);
    }

    const birthday = await Birthday.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!birthday) {
      return res.redirect(`${clientUrl}/?verificationError=invalid_or_expired`);
    }

    birthday.emailVerified = true;
    birthday.verificationToken = null;
    birthday.verificationTokenExpires = null;
    await birthday.save();

    // Send immediate birthday wish if their birthday is today
    const now = new Date();
    const dob = new Date(birthday.dob);
    const isToday = (
      (dob.getMonth() === now.getMonth() && dob.getDate() === now.getDate()) ||
      (dob.getUTCMonth() === now.getMonth() && dob.getUTCDate() === now.getDate())
    );

    if (isToday && birthday.lastWishedYear !== now.getFullYear()) {
      await emailService.sendBirthdayGreetingEmail({
        email: birthday.email,
        name: birthday.name,
      });
      birthday.lastWishedYear = now.getFullYear();
      await birthday.save();
    }

    return res.redirect(
      `${clientUrl}/?verified=true&name=${encodeURIComponent(birthday.name)}`
    );
  } catch (error) {
    console.error('Error verifying token:', error);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientUrl}/?verificationError=server_error`);
  }
});

/**
 * GET /api/birthdays/trigger-wishes (Test trigger)
 */
router.get('/trigger-wishes', async (req, res) => {
  try {
    await sendDailyBirthdayWishes();
    res.json({ success: true, message: 'Birthday wish check triggered.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ==========================================================================
   ADMIN ENDPOINTS (Protected with ADMIN_PASSWORD)
   ========================================================================== */

/**
 * POST /api/birthdays/admin/verify-pass
 * Validates admin password.
 */
router.post('/admin/verify-pass', (req, res) => {
  const { password } = req.body;
  const configuredPass = process.env.ADMIN_PASSWORD || 'admin123';
  if (password === configuredPass) {
    return res.json({ success: true, message: 'Password valid' });
  }
  return res.status(401).json({ success: false, message: 'Invalid admin password' });
});

/**
 * GET /api/birthdays/admin/all
 * Returns all birthdays in the database (verified & unverified) with email for moderation.
 */
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const all = await Birthday.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: all });
  } catch (error) {
    console.error('Admin fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/birthdays/admin/:id
 * Permanently deletes any birthday entry by ID.
 */
router.delete('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Birthday.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Birthday not found' });
    }
    console.log(`[ADMIN] Deleted birthday entry: ${deleted.name} (${deleted.email})`);
    res.json({ success: true, message: `Deleted ${deleted.name} successfully.` });
  } catch (error) {
    console.error('Admin delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
