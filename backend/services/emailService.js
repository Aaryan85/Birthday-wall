import nodemailer from 'nodemailer';

/**
 * Email Service Abstraction
 * Handles verification emails and automated birthday wishes.
 */
class EmailService {
  constructor() {
    this.transporter = null;
  }

  getTransporter() {
    if (this.transporter) return this.transporter;

    const user = process.env.SMTP_USER;
    const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const isGmail = host.includes('gmail') || (user && user.includes('@gmail.com'));

    if (user && pass) {
      if (isGmail) {
        // Direct SSL Port 465 configuration for Gmail (avoids cloud outbound timeout on port 587)
        this.transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true, // SSL
          auth: {
            user,
            pass,
          },
          tls: {
            rejectUnauthorized: false,
          },
          family: 4, // Force IPv4 to prevent cloud networking timeouts
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        });
      } else {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465 || process.env.SMTP_SECURE === 'true',
          auth: {
            user,
            pass,
          },
          tls: {
            rejectUnauthorized: false,
          },
          family: 4,
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        });
      }
    }
    return this.transporter;
  }

  async sendVerificationEmail({ email, name, token, clientUrl, serverUrl }) {
    const verificationUrl = `${serverUrl}/api/birthdays/verify/${token}`;
    const senderName = process.env.SENDER_NAME || 'Aaryan Yadav';

    console.log('\n======================================================');
    console.log(`✉️ [EMAIL SERVICE] Verification Email Triggered`);
    console.log(`To: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log('======================================================\n');

    const transporter = this.getTransporter();

    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || `"${senderName}" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Confirm your birthday on the Birthday Wall',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; color: #111111; background-color: #FBFBFA; border: 1px solid #E7E7E2;">
              <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 12px; letter-spacing: -0.5px;">Birthday Wall</h1>
              <p style="font-size: 15px; line-height: 1.6; color: #555555; margin-bottom: 24px;">
                Hi ${name},<br/><br/>
                Please verify your email to confirm your birthday on the public Birthday Wall.
              </p>
              <div style="margin: 28px 0;">
                <a href="${verificationUrl}" style="background-color: #111111; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: 500; display: inline-block;">
                  Confirm My Birthday →
                </a>
              </div>
              <p style="font-size: 12px; color: #888888; margin-top: 32px; border-top: 1px solid #E7E7E2; padding-top: 16px;">
                If the button above doesn't work, copy and paste this link into your browser:<br/>
                <a href="${verificationUrl}" style="color: #111111; word-break: break-all;">${verificationUrl}</a>
              </p>
            </div>
          `,
        });
        console.log(`✓ Verification email sent successfully to ${email}`);
      } catch (err) {
        console.error('Error sending email through transporter:', err.message);
      }
    }

    return { success: true, verificationUrl };
  }

  async sendBirthdayGreetingEmail({ email, name, clientUrl }) {
    const senderName = process.env.SENDER_NAME || 'Aaryan Yadav';

    console.log('\n======================================================');
    console.log(`🎉 [EMAIL SERVICE] Automated Birthday Wish Sending...`);
    console.log(`To: ${email}`);
    console.log(`Celebrant: ${name}`);
    console.log(`Sender: ${senderName}`);
    console.log('======================================================\n');

    const transporter = this.getTransporter();
    const siteUrl = clientUrl || process.env.CLIENT_URL || 'https://birthday-wall-one.vercel.app';

    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || `"${senderName}" <${process.env.SMTP_USER}>`,
          to: email,
          subject: `Happy Birthday, ${name}! 🎂🎉 — from ${senderName}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 36px 28px; color: #111111; background-color: #FBFBFA; border: 1px solid #E7E7E2;">
              <span style="font-size: 12px; font-family: monospace; letter-spacing: 2px; color: #888888; text-transform: uppercase;">Birthday Wall</span>
              <h1 style="font-size: 28px; font-weight: 700; margin: 12px 0; letter-spacing: -0.5px;">Happy Birthday, ${name}! 🎂</h1>
              
              <p style="font-size: 16px; line-height: 1.6; color: #444444; margin-bottom: 20px;">
                Hi ${name},<br/><br/>
                Wishing you a very Happy Birthday! May your day be filled with happiness, celebration, and lots of great memories.
              </p>

              <div style="margin: 24px 0; padding: 20px; background-color: #F4F4EE; border: 1px solid #E55DE;">
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
        console.log(`✓ Birthday greeting sent successfully to ${email}`);
      } catch (err) {
        console.error('Error sending birthday wish:', err.message);
      }
    }
  }
}

export const emailService = new EmailService();
