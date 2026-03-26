/**
 * Email Configuration
 * Brevo API for sending transactional emails (works on Render - no SMTP ports blocked)
 */

const brevo = require('@getbrevo/brevo');
require('dotenv').config();

// Initialize Brevo API client
let brevoClient = null;

if (process.env.BREVO_API_KEY) {
  const apiInstance = new brevo.TransactionalEmailsApi();
  const apiKey = apiInstance.authentications['apiKey'];
  apiKey.apiKey = process.env.BREVO_API_KEY;
  brevoClient = apiInstance;
  console.log('✓ Brevo email service is ready');
  console.log(`  From: ${process.env.EMAIL_FROM || 'noreply@golfcharity.com'}`);
} else {
  console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.warn('[EMAIL] Brevo API key not configured');
  console.warn('[EMAIL] Emails will be skipped until BREVO_API_KEY is set');
  console.warn('[EMAIL] Get your API key from: https://app.brevo.com/settings/keys/api');
  console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

/**
 * Send email helper function (non-blocking, won't crash app if email fails)
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content
 */
const sendEmail = async ({ to, subject, html, text }) => {
  // Skip if Brevo not configured
  if (!brevoClient || !process.env.BREVO_API_KEY) {
    console.log(`[EMAIL SKIPPED] Not configured - Subject: "${subject}" To: ${to}`);
    console.log('[EMAIL CONFIG] Set BREVO_API_KEY in .env to enable emails');
    return { success: false, error: 'Brevo API key not configured' };
  }

  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.sender = {
      email: process.env.EMAIL_FROM || 'noreply@golfcharity.com',
      name: 'Golf Charity Platform'
    };
    
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.textContent = text;

    const result = await brevoClient.sendTransacEmail(sendSmtpEmail);
    
    console.log(`[EMAIL SENT] Subject: "${subject}" To: ${to} MessageID: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`[EMAIL FAILED] Subject: "${subject}" To: ${to} Error: ${error.message}`);
    // Don't throw - just log and continue
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail
};
