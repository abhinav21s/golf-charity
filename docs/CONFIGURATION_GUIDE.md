# Configuration Guide - Step by Step

## Quick Answers to Your Questions

### 1. Stripe Webhook Endpoint

**Endpoint URL:**
```
https://your-backend-url.com/api/subscriptions/webhook
```

**For local testing:**
```
http://localhost:5000/api/subscriptions/webhook
```

**For production (after deployment):**
```
https://your-app.railway.app/api/subscriptions/webhook
```
or
```
https://your-app.onrender.com/api/subscriptions/webhook
```

---

### 2. Stripe Pricing

**Recommended Prices:**

| Plan | Price | Charity (10%) | Prize Pool |
|------|-------|---------------|------------|
| Monthly | $29.99/month | $3.00 | $26.99 |
| Yearly | $299.99/year | $30.00 | $269.99 |

**Yearly saves**: $59.89 (16.7% discount)

---

### 3. Email Configuration

**Yes, you use your own email address.**

**For Gmail (Easiest):**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com          # Your Gmail address
EMAIL_PASSWORD=abcdefghijklmnop           # App password (NOT your regular password)
EMAIL_FROM=noreply@golfcharity.com       # Display name (can be anything)
```

**No API key needed for Gmail** - just an App Password.

---

## Step-by-Step Setup

### Step 1: Stripe Configuration

#### A. Create Products

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Products** in the left menu
3. Click **Add Product**

**Monthly Product:**
- Product name: `Monthly Golf Charity Subscription`
- Description: `Monthly subscription with charitable giving`
- Pricing model: `Recurring`
- Price: `29.99`
- Billing period: `Monthly`
- Currency: `USD`
- Click **Save product**
- **Copy the Price ID** (looks like `price_1ABC123xyz`)

**Yearly Product:**
- Product name: `Yearly Golf Charity Subscription`
- Description: `Yearly subscription with charitable giving (save 16.7%)`
- Pricing model: `Recurring`
- Price: `299.99`
- Billing period: `Yearly`
- Currency: `USD`
- Click **Save product**
- **Copy the Price ID** (looks like `price_1DEF456xyz`)

#### B. Get API Keys

1. Go to **Developers** → **API keys**
2. Copy:
   - **Publishable key** (starts with `pk_test_`) → for frontend
   - **Secret key** (starts with `sk_test_`) → for backend

#### C. Set Up Webhook (Do this AFTER deploying backend)

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://your-backend-url.com/api/subscriptions/webhook`
4. **Description**: `Golf Charity Platform Subscriptions`
5. **Events to send**: Click **Select events** and choose:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
6. Click **Add endpoint**
7. **Copy the Signing secret** (starts with `whsec_`)

---

### Step 2: Gmail Configuration

#### A. Enable 2-Step Verification

1. Go to [Google Account](https://myaccount.google.com)
2. Click **Security** in the left menu
3. Find **2-Step Verification**
4. Click **Get Started** and follow the steps
5. Complete the setup

#### B. Generate App Password

1. Still in **Security** settings
2. Scroll down to **App passwords**
3. Click **App passwords**
4. You might need to sign in again
5. Select:
   - **App**: Mail
   - **Device**: Other (Custom name)
6. Enter name: `Golf Charity Platform`
7. Click **Generate**
8. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)
9. Remove spaces: `abcdefghijklmnop`

#### C. Configure in .env

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com          # Your actual Gmail address
EMAIL_PASSWORD=abcdefghijklmnop           # The 16-char app password (no spaces)
EMAIL_FROM=noreply@golfcharity.com       # Can be any email (just for display)
```

**Important:**
- `EMAIL_USER` = Your real Gmail address
- `EMAIL_PASSWORD` = The app password (NOT your regular Gmail password)
- `EMAIL_FROM` = What recipients see as the sender (can be different)

---

### Step 3: Supabase Configuration

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Wait for it to initialize (~2 minutes)
4. Go to **Settings** → **API**
5. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_KEY`

---

### Step 4: Generate JWT Secret

Run this command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (64 characters) and use it as `JWT_SECRET`.

---

### Step 5: Create Your .env File

Create `backend/.env` with these values:

```env
# Server
PORT=5000
NODE_ENV=development

# Supabase (from Step 3)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_anon_key
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_service_key

# JWT (from Step 4)
JWT_SECRET=your_64_character_random_string_here
JWT_EXPIRES_IN=7d

# Stripe (from Step 1)
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_MONTHLY_PRICE_ID=price_your_monthly_id
STRIPE_YEARLY_PRICE_ID=price_your_yearly_id

# Email (from Step 2)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
EMAIL_FROM=noreply@golfcharity.com

# Frontend
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads/
```

---

### Step 6: Create Frontend .env File

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
VITE_APP_NAME=Golf Charity Platform
VITE_APP_URL=http://localhost:3000
```

---

## Testing Your Configuration

### Test Email

Create a test file `backend/test-email.js`:

```javascript
require('dotenv').config();
const { sendEmail } = require('./src/config/email');

sendEmail({
  to: 'your.email@gmail.com',
  subject: 'Test Email',
  html: '<h1>It works!</h1>',
  text: 'It works!'
}).then(result => {
  console.log('Email sent:', result);
  process.exit(0);
}).catch(error => {
  console.error('Email failed:', error);
  process.exit(1);
});
```

Run:
```bash
cd backend
node test-email.js
```

Check your inbox!

### Test Stripe

1. Start your backend: `npm run dev`
2. Use Postman or curl to test:

```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "success": true,
  "message": "Golf Charity Platform API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Common Issues

### Gmail: "Username and Password not accepted"

**Solution:**
- Make sure 2-Step Verification is enabled
- Use the App Password, not your regular password
- Remove spaces from the app password
- Make sure EMAIL_USER is your full Gmail address

### Stripe: "No such price"

**Solution:**
- Make sure you copied the Price ID, not the Product ID
- Price IDs start with `price_`
- Product IDs start with `prod_`

### Webhook: "Webhook signature verification failed"

**Solution:**
- Make sure STRIPE_WEBHOOK_SECRET is correct
- It should start with `whsec_`
- Make sure you're sending requests to the correct endpoint
- For local testing, use Stripe CLI

---

## Production Checklist

Before going live:

- [ ] Switch Stripe to live mode (use `sk_live_` and `pk_live_`)
- [ ] Update webhook URL to production backend URL
- [ ] Use production email service (SendGrid/Mailgun)
- [ ] Update FRONTEND_URL to production URL
- [ ] Set NODE_ENV=production
- [ ] Never commit .env files to Git
- [ ] Use environment variables in hosting platform

---

## Quick Reference

### Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Requires Auth: 4000 0025 0000 3155
```

### Email Test

Send to yourself first to verify it works.

### Webhook Test

Use Stripe CLI for local testing:
```bash
stripe listen --forward-to localhost:5000/api/subscriptions/webhook
```

---

## Need Help?

1. Check the error logs in your terminal
2. Verify all environment variables are set
3. Test each service individually
4. Check the deployment guide for more details

---

**You're all set! 🎉**

Your configuration is complete and ready for testing.
