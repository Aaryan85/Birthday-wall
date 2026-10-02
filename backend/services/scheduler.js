import Birthday from '../models/Birthday.js';
import { emailService } from './emailService.js';

/**
 * Checks for verified birthdays occurring today that haven't received a wish this year,
 * and sends them a personalized birthday greeting email.
 */
export async function sendDailyBirthdayWishes() {
  try {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentDay = now.getDate();     // 1-31
    const currentYear = now.getFullYear();

    console.log(`\n⏰ [MIDNIGHT SCHEDULER] Checking birthdays for today: ${now.toLocaleDateString()} (Month: ${currentMonth + 1}, Day: ${currentDay})...`);

    const allBirthdays = await Birthday.find({});
    const verifiedBirthdays = allBirthdays.filter(b => b.emailVerified);

    // Match birthdays for today (checking both Local and UTC dates to prevent timezone mismatches)
    const celebrants = verifiedBirthdays.filter((b) => {
      const d = new Date(b.dob);
      const matchLocal = d.getMonth() === currentMonth && d.getDate() === currentDay;
      const matchUTC = d.getUTCMonth() === currentMonth && d.getUTCDate() === currentDay;
      const notWishedThisYear = b.lastWishedYear !== currentYear;

      return (matchLocal || matchUTC) && notWishedThisYear;
    });

    if (celebrants.length === 0) {
      console.log('[SCHEDULER] No pending birthday wishes to send right now.');
      return;
    }

    console.log(`[SCHEDULER] 🎉 Found ${celebrants.length} celebrant(s) today! Sending 12:00 AM birthday greetings...`);

    for (const celebrant of celebrants) {
      console.log(`[SCHEDULER] Sending birthday wish to: ${celebrant.name} (${celebrant.email})`);
      await emailService.sendBirthdayGreetingEmail({
        email: celebrant.email,
        name: celebrant.name,
      });

      // Mark as wished this year so we don't send duplicate wishes
      celebrant.lastWishedYear = currentYear;
      await celebrant.save();
    }

    console.log('[SCHEDULER] ✓ All birthday greetings processed successfully.');
  } catch (error) {
    console.error('[SCHEDULER] Error processing birthday wishes:', error.message);
  }
}

/**
 * Schedules the task to fire precisely at 12:00 AM midnight every day.
 */
function scheduleMidnightTrigger() {
  const now = new Date();
  
  // Calculate next 12:00:00 AM midnight
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 5, 0
  );

  const msUntilMidnight = nextMidnight.getTime() - now.getTime();
  const hoursRemaining = (msUntilMidnight / (1000 * 60 * 60)).toFixed(2);

  console.log(`[SCHEDULER] Next 12:00 AM midnight run scheduled in ${hoursRemaining} hours (${nextMidnight.toLocaleString()})`);

  setTimeout(async () => {
    await sendDailyBirthdayWishes();
    scheduleMidnightTrigger();
  }, msUntilMidnight);
}

/**
 * Starts the exact 12:00 AM daily scheduler
 */
export function initBirthdayScheduler() {
  // Check once 3 seconds after server startup
  setTimeout(() => {
    sendDailyBirthdayWishes();
  }, 3000);

  // Set up the precise 12:00 AM trigger
  scheduleMidnightTrigger();

  console.log('✓ Precise 12:00 AM Midnight Birthday Wish Scheduler active.');
}
