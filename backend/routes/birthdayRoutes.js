import express from 'express';
import crypto from 'crypto';
import Birthday from '../models/Birthday.js';
import { emailService } from '../services/emailService.js';
import { sendDailyBirthdayWishes } from '../services/scheduler.js';

const router = express.Router();

/**
 * Strictly resolves and validates the backend URL (Render API server)
 * Ignores any invalid strings, variable prefixes, or accidental frontend URLs
 */
function resolveBackendUrl(req) {
  const envBackend = process.env.BACKEND_URL || process.env.SERVER_URL;
  
  if (envBackend && typeof envBackend === 'string') {
    let clean = envBackend.trim().replace(/^[A-Z_]+=\s*/, '').replace(/\/+$/, '');
    const match = clean.match(/https?:\/\/[^\s)\]'"]+/);
    if (match) clean = match[0];
    
    // If someone accidentally configured the Vercel frontend URL as backend URL, ignore it
    if (!clean.includes('vercel.app') && clean.startsWith('http')) {
      return clean;
    }
  }

  // Fallback to request host or default deployed Render backend
  if (req && req.get('host')) {
    const host = req.get('host');
    const protocol = req.protocol === 'https' || host.includes('onrender.com') ? 'https' : req.protocol;
    return `${protocol}://${host}`;
  }

  return 'https://birthday-wall-x123.onrender.com';
}

/**
 * Strictly resolves and validates the frontend URL (Vercel client)
 */
function resolveFrontendUrl() {
  const envFrontend = process.env.FRONTEND_URL || process.env.CLIENT_URL;
  
  if (envFrontend && typeof envFrontend === 'string') {
    let clean = envFrontend.trim().replace(/^[A-Z_]+=\s*/, '').replace(/\/+$/, '');
    const match = clean.match(/https?:\/\/[^\s)\]'"]+/);
    if (match) clean = match[0];
    if (clean.startsWith('http')) return clean;
  }

  return 'https://birthday-wall-one.vercel.app';
}

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
 * Register a birthday, generate token, and send verification email.
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

    // 1. Generate secure random verification token (64 hex characters)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Safe debugging logs (does NOT log token value)
    console.log('Verification token generated:', !!verificationToken);
    console.log('Verification token length:', verificationToken?.length);

    // 2. Save token to MongoDB
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

    // 3. Resolve backend URL strictly for constructing the verification route link
    const backendUrl = resolveBackendUrl(req);
    console.log('Verification URL base:', backendUrl);

    // 4. Send verification email with token
    try {
      await emailService.sendVerificationEmail({
        email: normalizedEmail,
        name: birthday.name,
        dob: birthday.dob,
        token: verificationToken,
        backendUrl,
      });
    } catch (emailErr) {
      console.error('[ROUTE] Failed to send verification email:', emailErr.message);
      return res.status(500).json({
        success: false,
        message: 'Could not send verification email. Please check your email address or try again later.',
      });
    }

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
 * Verifies email token and redirects user back to the deployed Vercel frontend.
 */
router.get('/verify/:token', async (req, res) => {
  const frontendUrl = resolveFrontendUrl();

  try {
    const { token } = req.params;

    if (!token) {
      return res.redirect(`${frontendUrl}/?verificationError=missing_token`);
    }

    // Find birthday with this valid, non-expired verificationToken
    const birthday = await Birthday.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!birthday) {
      return res.redirect(`${frontendUrl}/?verificationError=invalid_or_expired`);
    }

    // Mark as verified and clear tokens
    birthday.emailVerified = true;
    birthday.verificationToken = null;
    birthday.verificationTokenExpires = null;
    await birthday.save();

    console.log(`[VERIFICATION] ✓ Birthday successfully verified: ${birthday.name} (${birthday.email})`);

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
        clientUrl: frontendUrl,
      });
      birthday.lastWishedYear = now.getFullYear();
      await birthday.save();
    }

    // Final redirect to deployed frontend with confirmation
    return res.redirect(
      `${frontendUrl}/?verified=true&name=${encodeURIComponent(birthday.name)}`
    );
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.redirect(`${frontendUrl}/?verificationError=server_error`);
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

router.post('/admin/verify-pass', (req, res) => {
  const { password } = req.body;
  const configuredPass = process.env.ADMIN_PASSWORD || 'admin123';
  if (password === configuredPass) {
    return res.json({ success: true, message: 'Password valid' });
  }
  return res.status(401).json({ success: false, message: 'Invalid admin password' });
});

router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const all = await Birthday.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: all });
  } catch (error) {
    console.error('Admin fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

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
