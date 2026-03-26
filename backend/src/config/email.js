/**
 * Email Configuration
 * Nodemailer setup for sending transactional emails
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  connectionTimeout: 5000, // 5 second timeout
  greetingTimeout: 5000
});

// Verify transporter configuration (non-blocking)
transporter.verify((error) => {
  if (error) {
    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.warn('[EMAIL] Transporter not configured or unavailable');
    console.warn('[EMAIL] Error:', error.message);
    console.warn('[EMAIL] Emails will be skipped until EMAIL_* env variables are configured');
    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } else {
    console.log('✓ Email server is ready to send messages');
    console.log(`  Host: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}`);
    console.log(`  User: ${process.env.EMAIL_USER}`);
  }
});

/**
 * Send email helper function (non-blocking, won't crash app if email fails)
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content
 */
const sendEmail = async ({ to, subject, html, text }) => {
  // Skip if email not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log(`[EMAIL SKIPPED] Not configured - Subject: "${subject}" To: ${to}`);
    console.log('[EMAIL CONFIG] Set EMAIL_USER and EMAIL_PASSWORD in .env to enable emails');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Golf Charity Platform" <noreply@golfcharity.com>',
      to,
      subject,
      text,
      html
    });
    
    console.log(`[EMAIL SENT] Subject: "${subject}" To: ${to} MessageID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL FAILED] Subject: "${subject}" To: ${to} Error: ${error.message}`);
    // Don't throw - just log and continue
    return { success: false, error: error.message };
  }
};

module.exports = {
  transporter,
  sendEmail
};
