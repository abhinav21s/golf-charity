# Golf Charity Platform - Deployment Guide

Complete step-by-step guide for deploying the Golf Charity Subscription Platform.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Stripe Configuration](#stripe-configuration)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
6. [Post-Deployment](#post-deployment)
7. [Testing](#testing)

---

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- Git installed
- A new Supabase account (not personal)
- A Stripe account
- A new Vercel account (not personal)
- Email service credentials (Gmail, SendGrid, etc.)

---

## Supabase Setup

### Step 1: Create New Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a NEW account (not your personal account)
3. Click "New Project"
4. Fill in project details:
   - **Name**: golf-charity-platform
   - **Database Password**: (generate strong password - save it!)
   - **Region**: Choose closest to your users
5. Wait for project to be created (~2 minutes)

### Step 2: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `database/supabase/schema.sql`
4. Paste into the SQL editor
5. Click "Run" to execute
6. Verify tables were created: Go to **Table Editor** and check for:
   - users
   - subscriptions
   - scores
   - draws
   - charities
   - winners
   - etc.

### Step 3: Get Supabase Credentials

1. Go to **Project Settings** > **API**
2. Copy the following values:
   - **Project URL** (SUPABASE_URL)
   - **anon public** key (SUPABASE_ANON_KEY)
   - **service_role** key (SUPABASE_SERVICE_KEY) - Keep this secret!

### Step 4: Create Admin User

1. Go to **SQL Editor**
2. Run this query to create an admin account:

```sql
-- Create admin user
INSERT INTO users (email, password_hash, first_name, last_name, role, status)
VALUES (
  'admin@golfcharity.com',
  '$2a$10$YourHashedPasswordHere', -- Use bcrypt to hash 'AdminTest123!'
  'Admin',
  'User',
  'admin',
  'active'
);
```

Note: You'll need to hash the password using bcrypt. You can use an online bcrypt generator or run this in Node.js:

```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('AdminTest123!', 10);
console.log(hash);
```

---

## Stripe Configuration

### Step 1: Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up or log in
3. Activate your account

### Step 2: Create Products and Prices

1. Go to **Products** in Stripe Dashboard
2. Click "Add Product"

**Monthly Subscription:**
- Name: Monthly Golf Charity Subscription
- Description: Monthly subscription with charitable giving
- Pricing: Recurring
- Price: $29.99 (or your chosen amount)
- Billing period: Monthly
- Click "Save product"
- Copy the **Price ID** (starts with `price_`)

**Yearly Subscription:**
- Name: Yearly Golf Charity Subscription
- Description: Yearly subscription with charitable giving (discounted)
- Pricing: Recurring
- Price: $299.99 (or your chosen amount - typically 10-20% discount)
- Billing period: Yearly
- Click "Save product"
- Copy the **Price ID** (starts with `price_`)

### Step 3: Get API Keys

1. Go to **Developers** > **API keys**
2. Copy:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### Step 4: Set Up Webhook

1. Go to **Developers** > **Webhooks**
2. Click "Add endpoint"
3. Endpoint URL: `https://your-backend-url.com/api/subscriptions/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)

---

## Backend Deployment

### Option 1: Railway (Recommended)

1. Go to [https://railway.app](https://railway.app)
2. Sign up / Log in
3. Click "New Project" > "Deploy from GitHub repo"
4. Connect your GitHub repository
5. Select the `backend` directory
6. Add environment variables (see below)
7. Deploy

### Option 2: Render

1. Go to [https://render.com](https://render.com)
2. Sign up / Log in
3. Click "New" > "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Root Directory**: backend
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variables (see below)
7. Deploy

### Environment Variables for Backend

```env
# Server
PORT=5000
NODE_ENV=production

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# JWT
JWT_SECRET=your_very_long_random_secret_key_min_32_characters
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_MONTHLY_PRICE_ID=price_your_monthly_price_id
STRIPE_YEARLY_PRICE_ID=price_your_yearly_price_id

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@golfcharity.com

# Frontend URL
FRONTEND_URL=https://your-vercel-app.vercel.app

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads/
```

### Generate JWT Secret

Run this in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Gmail App Password

1. Go to Google Account settings
2. Security > 2-Step Verification (enable if not enabled)
3. App passwords
4. Generate new app password for "Mail"
5. Use this password in EMAIL_PASSWORD

---

## Frontend Deployment (Vercel)

### Step 1: Create New Vercel Account

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with a NEW account (not personal)
3. Choose "Hobby" plan (free)

### Step 2: Deploy Frontend

1. Click "Add New" > "Project"
2. Import your Git repository
3. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: dist
4. Add environment variables:

```env
VITE_API_URL=https://your-backend-url.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_APP_NAME=Golf Charity Platform
VITE_APP_URL=https://your-app.vercel.app
```

5. Click "Deploy"
6. Wait for deployment to complete
7. Copy your Vercel URL

### Step 3: Update Backend FRONTEND_URL

1. Go back to your backend hosting (Railway/Render)
2. Update the `FRONTEND_URL` environment variable with your Vercel URL
3. Redeploy backend

### Step 4: Update Stripe Webhook URL

1. Go to Stripe Dashboard > Developers > Webhooks
2. Edit your webhook endpoint
3. Update URL to: `https://your-backend-url.com/api/subscriptions/webhook`
4. Save

---

## Post-Deployment

### 1. Test Admin Login

1. Go to your deployed frontend URL
2. Click "Login"
3. Use credentials:
   - Email: admin@golfcharity.com
   - Password: AdminTest123!
4. Verify you can access Admin Dashboard

### 2. Create Test User

1. Click "Register"
2. Create a test user account
3. Verify email is sent (check spam folder)
4. Log in with test user

### 3. Test Subscription Flow

1. Log in as test user
2. Go to Pricing page
3. Click "Subscribe" on Monthly plan
4. Use Stripe test card: `4242 4242 4242 4242`
5. Expiry: Any future date
6. CVC: Any 3 digits
7. Complete checkout
8. Verify subscription is active in dashboard

### 4. Add Sample Charities

As admin:
1. Go to Admin Dashboard > Charities
2. Add at least 3 charities
3. Mark 1-2 as "Featured"

### 5. Test Score Entry

As subscribed user:
1. Go to Scores page
2. Add 5 scores (values between 1-45)
3. Verify only 5 scores are kept
4. Add 6th score, verify oldest is removed

---

## Testing

### Test Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Email notifications are sent
- [ ] Subscription checkout works (test mode)
- [ ] Subscription status shows in dashboard
- [ ] Score entry works (5-score limit)
- [ ] Charity selection works
- [ ] Admin can access admin dashboard
- [ ] Admin can create draws
- [ ] Draw simulation works
- [ ] Winner verification flow works
- [ ] All pages are responsive on mobile
- [ ] No console errors

### Test Credentials

**Admin Account:**
- Email: admin@golfcharity.com
- Password: AdminTest123!

**Test User Account:**
- Email: user@test.com
- Password: TestUser123!

**Stripe Test Cards:**
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Requires Auth: 4000 0025 0000 3155

---

## Troubleshooting

### Backend won't start
- Check all environment variables are set
- Verify Supabase credentials are correct
- Check logs for specific errors

### Stripe webhook not working
- Verify webhook URL is correct
- Check webhook signing secret
- Test webhook in Stripe dashboard

### Emails not sending
- Verify email credentials
- Check if 2FA/App Password is required
- Test with a different email service

### Database connection fails
- Verify Supabase URL and keys
- Check if IP is whitelisted (if applicable)
- Verify database schema was created

---

## Support

For issues or questions:
- Check logs in Vercel/Railway/Render dashboard
- Review Supabase logs
- Check Stripe webhook logs
- Contact support: support@golfcharity.com

---

## Security Notes

- Never commit `.env` files to Git
- Keep service role keys secret
- Use HTTPS in production
- Regularly update dependencies
- Monitor Stripe webhook signatures
- Implement rate limiting in production

---

## Next Steps

After successful deployment:
1. Switch Stripe to live mode
2. Configure custom domain
3. Set up monitoring (Sentry, LogRocket)
4. Configure backup strategy
5. Set up CI/CD pipeline
6. Add analytics (Google Analytics, Mixpanel)

---

**Deployment Complete! 🎉**

Your Golf Charity Platform is now live and ready to make an impact!
