import { Resend } from 'resend';

/**
 * Helper to format date for email display (e.g. "October 5")
 */
function formatBirthdayForEmail(dateInput) {
  if (!dateInput) return '';
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  if (typeof dateInput === 'string' && dateInput.includes('-')) {
    const parts = dateInput.split('T')[0].split('-');
    if (parts.length >= 3) {
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      return `${months[m]} ${d}`;
    }
  }

  const d = new Date(dateInput);
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

/**
 * Resend HTTPS Email Delivery Service
 */
class EmailService {
  constructor() {
    this.resend = null;
  }

  getResendClient() {
    if (!this.resend && process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY.trim());
    }
    return this.resend;
  }

  /**
   * Sends the birthday confirmation verification email
   */
  async sendVerificationEmail({ email, name, dob, token, serverUrl }) {
    const verificationUrl = `${serverUrl}/api/birthdays/verify/${token}`;
    const formattedBirthday = formatBirthdayForEmail(dob);
    const fromAddress = process.env.EMAIL_FROM || 'Birthday Wall <onboarding@resend.dev>';

    console.log(`[EMAIL SERVICE] Attempting to send verification email to: ${email} (Name: ${name})`);

    const resend = this.getResendClient();

    if (!resend) {
      const errorMsg = 'RESEND_API_KEY is not configured in environment variables.';
      console.error(`[EMAIL SERVICE] Send failed: ${errorMsg}`);
      throw new Error(errorMsg);
    }

    try {
      const response = await resend.emails.send({
        from: fromAddress,
        to: email,
        subject: '🎂 Confirm your birthday',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 36px 24px; color: #111111; background-color: #FBFBFA; border: 1px solid #E7E7E2;">
            <div style="font-size: 11px; font-family: monospace; letter-spacing: 2px; color: #888888; text-transform: uppercase; margin-bottom: 8px;">
              Birthday Wall
            </div>
            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 20px 0; letter-spacing: -0.5px;">
              🎂 Confirm your birthday
            </h1>
            
            <p style="font-size: 15px; line-height: 1.6; color: #333333; margin: 0 0 16px 0;">
              Hey <strong>${name}</strong>!
            </p>

            <p style="font-size: 15px; line-height: 1.6; color: #555555; margin: 0 0 16px 0;">
              You recently added your birthday to the <strong>Birthday Wall</strong>.
            </p>

            <div style="margin: 20px 0; padding: 16px 20px; background-color: #F4F4EE; border: 1px solid #E5E5DE;">
              <span style="font-size: 13px; font-family: monospace; text-transform: uppercase; color: #777777; display: block; margin-bottom: 4px;">Birthday</span>
              <span style="font-size: 18px; font-weight: 700; color: #111111;">${formattedBirthday}</span>
            </div>

            <p style="font-size: 15px; line-height: 1.6; color: #555555; margin: 0 0 24px 0;">
              Click below to confirm that this birthday belongs to you.
            </p>

            <div style="margin: 28px 0;">
              <a href="${verificationUrl}" style="background-color: #111111; color: #ffffff; text-decoration: none; padding: 12px 28px; font-size: 14px; font-weight: 500; display: inline-block; letter-spacing: 0.2px;">
                Confirm My Birthday →
              </a>
            </div>

            <p style="font-size: 13px; line-height: 1.5; color: #888888; margin: 28px 0 0 0; border-top: 1px solid #E7E7E2; padding-top: 20px;">
              If you didn't submit this birthday, you can safely ignore this email.
            </p>
          </div>
        `,
      });

      if (response.error) {
        console.error(`[EMAIL SERVICE] Resend provider returned an error:`, response.error.message);
        throw new Error(response.error.message || 'Resend API failed to deliver email.');
      }

      console.log(`[EMAIL SERVICE] ✓ Verification email successfully sent via Resend (ID: ${response.data?.id})`);
      return { success: true, id: response.data?.id };
    } catch (err) {
      console.error(`[EMAIL SERVICE] Email send failure for ${email}:`, err.message);
      throw err;
    }
  }

  /**
   * Sends the automated birthday wish greeting on the celebrant's birthday
   */
  async sendBirthdayGreetingEmail({ email, name, clientUrl }) {
    const senderName = process.env.SENDER_NAME || 'Aaryan Yadav';
    const fromAddress = process.env.EMAIL_FROM || 'Birthday Wall <onboarding@resend.dev>';
    const siteUrl = clientUrl || process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://birthday-wall-one.vercel.app';

    console.log(`[EMAIL SERVICE] Attempting to send birthday greeting to: ${email} (Celebrant: ${name})`);

    const resend = this.getResendClient();
    if (!resend) {
      console.error(`[EMAIL SERVICE] Cannot send wish: RESEND_API_KEY is not configured.`);
      return;
    }

    try {
      const response = await resend.emails.send({
        from: fromAddress,
        to: email,
        subject: `Happy Birthday, ${name}! 🎂🎉 — from ${senderName}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 36px 28px; color: #111111; background-color: #FBFBFA; border: 1px solid #E7E7E2;">
            <span style="font-size: 11px; font-family: monospace; letter-spacing: 2px; color: #888888; text-transform: uppercase;">Birthday Wall</span>
            <h1 style="font-size: 28px; font-weight: 700; margin: 12px 0 20px 0; letter-spacing: -0.5px;">Happy Birthday, ${name}! 🎂</h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #444444; margin-bottom: 20px;">
              Hi ${name},<br/><br/>
              Wishing you a very Happy Birthday! May your day be filled with happiness, celebration, and lots of great memories.
            </p>

            <div style="margin: 24px 0; padding: 20px; background-color: #F4F4EE; border: 1px solid #E5E5DE;">
              <p style="margin: 0; font-size: 15px; color: #222222; font-style: italic; line-height: 1.5;">
                "Wishing you another year of great adventures, success, and good health!"
              </p>
              <p style="margin: 12px 0 0 0; font-size: 13px; font-weight: 600; color: #111111;">
                — ${senderName}
              </p>
            </div>

            <div style="margin-top: 30px;">
              <a href="${siteUrl}" style="background-color: #111111; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 500; display: inline-block;">
                View Your Birthday on the Wall →
              </a>
            </div>

            <p style="font-size: 12px; color: #888888; margin-top: 36px; border-top: 1px solid #E7E7E2; padding-top: 16px;">
              Warmest wishes from <strong>${senderName}</strong> & Birthday Wall.
            </p>
          </div>
        `,
      });

      if (response.error) {
        console.error(`[EMAIL SERVICE] Birthday wish error:`, response.error.message);
      } else {
        console.log(`[EMAIL SERVICE] ✓ Birthday greeting sent successfully via Resend (ID: ${response.data?.id})`);
      }
    } catch (err) {
      console.error(`[EMAIL SERVICE] Failed to send birthday greeting to ${email}:`, err.message);
    }
  }
}

export const emailService = new EmailService();
