# Email Configuration Guide

## Current Issue
Render's free tier blocks outgoing SMTP connections to Gmail (port 587), causing email timeouts. The app continues to work (emails are non-fatal), but emails aren't being sent.

## Recommended Solutions

### Option 1: SendGrid (Recommended - Free & Reliable)

SendGrid is designed for transactional emails and works perfectly with Render.

**Setup Steps:**

1. **Sign up for SendGrid**
   - Go to https://sendgrid.com
   - Create a free account (100 emails/day)

2. **Get API Key**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name it "Golf Charity Platform"
   - Select "Full Access"
   - Copy the API key (you'll only see it once!)

3. **Verify Sender Email**
   - Go to Settings → Sender Authentication
   - Click "Verify a Single Sender"
   - Enter your email: `tst58709@gmail.com`
   - Check your email and click the verification link

4. **Update Render Environment Variables**
   - Go to https://dashboard.render.com
   - Select your backend service
   - Go to "Environment" tab
   - Update these variables:
   ```
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASSWORD=<paste-your-sendgrid-api-key-here>
   EMAIL_FROM=tst58709@gmail.com
   ```
   - Click "Save Changes" (triggers redeploy)

5. **Test**
   - Register a new account
   - Check your email for the welcome message

---

### Option 2: Mailgun (Alternative - Free & Reliable)

Mailgun offers 5,000 emails/month on the free tier.

**Setup Steps:**

1. **Sign up for Mailgun**
   - Go to https://mailgun.com
   - Create a free account

2. **Get SMTP Credentials**
   - Go to Sending → Domain Settings → SMTP Credentials
   - Note your SMTP hostname, username, and password

3. **Update Render Environment Variables**
   ```
   EMAIL_HOST=smtp.mailgun.org
   EMAIL_PORT=587
   EMAIL_USER=<your-mailgun-smtp-username>
   EMAIL_PASSWORD=<your-mailgun-smtp-password>
   EMAIL_FROM=tst58709@gmail.com
   ```

---

### Option 3: Disable Emails (For Testing Only)

If you don't need emails right now, you can disable them:

1. **Remove Email Variables from Render**
   - Go to Render dashboard
   - Remove `EMAIL_USER` and `EMAIL_PASSWORD`
   - Keep other variables

2. **What Happens**
   - App continues to work normally
   - Logs will show: `[EMAIL SKIPPED] Not configured`
   - No emails will be sent
   - No errors or crashes

---

### Option 4: Try Port 465 (Unlikely to Work)

Some providers allow SSL on port 465. Worth a try:

1. **Update Render Environment Variables**
   ```
   EMAIL_PORT=465
   ```

2. **The code automatically uses secure connection for port 465**

---

## Current Email Configuration

Your local `.env` has:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tst58709@gmail.com
EMAIL_PASSWORD=venqewlxfotablll
EMAIL_FROM=tst58709@gmail.com
```

This works locally but times out on Render due to SMTP port blocking.

---

## Email Logging

The app now has detailed email logging:

- `✓ Email server is ready to send messages` - Email configured successfully
- `[EMAIL SENT] Subject: "..." To: ...` - Email sent successfully
- `[EMAIL SKIPPED] Not configured` - Email env vars missing
- `[EMAIL FAILED] Subject: "..." Error: ...` - Email failed (non-fatal)

Check Render logs to see email status.

---

## Emails Sent by the App

1. **Welcome Email** - When user registers
2. **Winner Verification Approved** - When admin approves winner
3. **Winner Verification Rejected** - When admin rejects winner
4. **Payment Processed** - When admin marks winner as paid

All emails are non-blocking and won't crash the app if they fail.

---

## Recommendation

**Use SendGrid** - It's free, reliable, designed for this use case, and takes 5 minutes to set up.
