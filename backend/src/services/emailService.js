import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configure Nodemailer SMTP Transporter
 * Supports Gmail SMTP (e.g. using App Password) or custom SMTP.
 * Default sender is spicyroute10@gmail.com
 */
const EMAIL_USER = (process.env.EMAIL_USER || process.env.SMTP_USER || 'spicyroute10@gmail.com').trim();
const rawPass = process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';
const EMAIL_PASS = rawPass.replace(/\s+/g, '').trim();

const getTransporter = () => {
  const user = (process.env.EMAIL_USER || process.env.SMTP_USER || 'spicyroute10@gmail.com').trim();
  const rawPass = process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';
  const pass = rawPass.replace(/\s+/g, '').trim();

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass
    }
  });
};

/**
 * Sends email via Brevo REST API (HTTPS over Port 443)
 * Port 443 is never blocked by Render Free Tier firewalls!
 */
const sendViaBrevoHttpApi = async (to, otp, senderEmail, htmlContent) => {
  const apiKey = (process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY || '').trim();
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Spicy Route Verification', email: senderEmail },
        to: [{ email: to }],
        subject: `Your Spicy Route Verification Code: ${otp}`,
        htmlContent
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(`❌ [Brevo API Error]:`, data);
      return { success: false, error: data.message || 'Brevo HTTP API error' };
    }

    console.log(`✅ [Brevo API] Verification OTP email dispatched via HTTPS to ${to} (Message ID: ${data.messageId})`);
    return { success: true, messageId: data.messageId };
  } catch (err) {
    console.error(`❌ [Brevo API Request Error]:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Sends a professionally styled HTML 6-digit OTP verification email
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit verification code
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendVerificationEmail = async (to, otp) => {
  const senderUser = (process.env.EMAIL_USER || process.env.SMTP_USER || 'spicyroute10@gmail.com').trim();
  const htmlContent = `
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
  `;

  // 1. Try HTTPS API first if Brevo API Key is configured (Bypasses all cloud port restrictions)
  const brevoRes = await sendViaBrevoHttpApi(to, otp, senderUser, htmlContent);
  if (brevoRes && brevoRes.success) {
    return brevoRes;
  }

  // 2. Fallback to standard SMTP Nodemailer
  const activeTransporter = getTransporter();

  if (!activeTransporter) {
    const reason = 'EMAIL_PASS not configured or empty on server';
    console.warn(`⚠️ [Email Service] ${reason}. Simulated delivery to ${to} with code ${otp}`);
    return { success: false, reason };
  }

  const mailOptions = {
    from: `"Spicy Route Verification" <${senderUser}>`,
    to,
    subject: `Your Spicy Route Verification Code: ${otp}`,
    html: htmlContent
  };

  try {
    const info = await activeTransporter.sendMail(mailOptions);
    console.log(`✅ [Email Service] Verification OTP email dispatched to ${to} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ [Email Service] Failed to send email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};
