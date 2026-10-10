import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configure Nodemailer SMTP Transporter
 * Supports Gmail SMTP (e.g. using App Password) or custom SMTP.
 * Default sender is spicyroute10@gmail.com
 */
const EMAIL_USER = process.env.EMAIL_USER || process.env.SMTP_USER || 'spicyroute10@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

let transporter = null;

if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });
  console.log(`📧 [Email Service] Initialized Gmail SMTP for sender: ${EMAIL_USER}`);
} else {
  console.warn(`⚠️ [Email Service] No EMAIL_PASS/GMAIL_APP_PASSWORD found in environment variables. Real email dispatch will attempt fallback or log.`);
}

/**
 * Sends a professionally styled HTML 6-digit OTP verification email
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit verification code
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendVerificationEmail = async (to, otp) => {
  if (!transporter) {
    console.warn(`⚠️ [Email Service] Transporter not ready (missing EMAIL_PASS). Simulated delivery to ${to} with code ${otp}`);
    return { success: false, reason: 'SMTP credentials not configured on server' };
  }

  const mailOptions = {
    from: `"Spicy Route Verification" <${EMAIL_USER}>`,
    to,
    subject: `Your Spicy Route Verification Code: ${otp}`,
    html: `
      <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">🌶️ Spicy Route</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px; font-weight: 500;">Campus Food Delivery & Dining</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 28px;">
          <h2 style="color: #1e293b; font-size: 18px; font-weight: 800; margin: 0 0 12px;">Email Verification Code</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            Thank you for registering with <strong>Spicy Route</strong>. Please use the 6-digit verification code below to confirm your account:
          </p>

          <!-- OTP Box -->
          <div style="background-color: #fff1f2; border: 2px dashed #f43f5e; border-radius: 16px; padding: 20px; text-align: center; margin: 0 0 24px;">
            <span style="font-family: monospace, Courier; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #be123c;">${otp}</span>
            <p style="margin: 8px 0 0; font-size: 11px; font-weight: 600; color: #9f1239;">Valid for 5 minutes only. Do not share this code.</p>
          </div>

          <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0 0 16px;">
            If you did not request this verification code, please ignore this email. No account changes have been made.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 18px 24px; text-align: center; border-top: 1px solid #f1f5f9;">
          <p style="color: #94a3b8; font-size: 11px; margin: 0;">
            Sent by <strong>Spicy Route System</strong> &bull; Contact: spicyroute10@gmail.com
          </p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Email Service] Verification OTP email dispatched to ${to} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ [Email Service] Failed to send email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};
