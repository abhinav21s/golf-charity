# Quick Configuration Answers

## Your Questions Answered

### ❓ Question 1: Webhook Endpoint

**What endpoint do I need to add in Stripe webhook?**

**Answer:**
```
https://your-backend-url.com/api/subscriptions/webhook
```

**Examples:**
- Local: `http://localhost:5000/api/subscriptions/webhook`
- Railway: `https://golf-charity-production.up.railway.app/api/subscriptions/webhook`
- Render: `https://golf-charity-api.onrender.com/api/subscriptions/webhook`

**Where to add it:**
1. Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Paste your URL
4. Select these 5 events:
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed

---

### ❓ Question 2: Monthly and Yearly Prices

**What prices should I set?**

**Answer:**

| Plan | Price | Per Month | Charity | Prize Pool |
|------|-------|-----------|---------|------------|
| **Monthly** | **$29.99/month** | $29.99 | $3.00 | $26.99 |
| **Yearly** | **$299.99/year** | $25.00 | $30.00 | $269.99 |

**Yearly saves $59.89 (16.7% discount)**

**How to create in Stripe:**

1. Go to Products → Add Product

**Monthly:**
- Name: "Monthly Golf Charity Subscription"
- Price: $29.99
- Billing: Monthly
- Copy Price ID: `price_1ABC123xyz`

**Yearly:**
- Name: "Yearly Golf Charity Subscription"  
- Price: $299.99
- Billing: Yearly
- Copy Price ID: `price_1DEF456xyz`

---

### ❓ Question 3: Email Configuration

**Do I need an API key? Do I use my own email?**

**Answer:**

**For Gmail (Recommended for Testing):**

✅ **YES, use your own Gmail address**
✅ **NO API key needed** - just an App Password

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com          # ← Your Gmail
EMAIL_PASSWORD=abcdefghijklmnop           # ← App Password (NOT regular password)
EMAIL_FROM=noreply@golfcharity.com       # ← Display name (can be anything)
```

**How to get App Password:**

1. Google Account → Security
2. Enable 2-Step Verification
3. Go to "App passwords"
4. Generate password for "Mail"
5. Copy the 16-character password
6. Remove spaces: `abcd efgh ijkl mnop` → `abcdefghijklmnop`

**Important:**
- `EMAIL_USER` = Your actual Gmail address
- `EMAIL_PASSWORD` = The 16-char app password (NOT your Gmail password)
- `EMAIL_FROM` = What recipients see (can be different from EMAIL_USER)

---

## Complete .env Example

Here's what your `backend/.env` should look like:

```env
# Server
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_anon_key
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_service_key

# JWT (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_51ABC123xyz...
STRIPE_WEBHOOK_SECRET=whsec_abc123xyz...
STRIPE_MONTHLY_PRICE_ID=price_1ABC123xyz
STRIPE_YEARLY_PRICE_ID=price_1DEF456xyz

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=myemail@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM=noreply@golfcharity.com

# Frontend
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads/
```

---

## Visual Guide

### Stripe Setup Flow

```
1. Create Products
   ↓
2. Copy Price IDs
   ↓
3. Get API Keys (pk_test_, sk_test_)
   ↓
4. Deploy Backend
   ↓
5. Create Webhook
   ↓
6. Copy Webhook Secret (whsec_)
```

### Gmail Setup Flow

```
1. Enable 2-Step Verification
   ↓
2. Go to App Passwords
   ↓
3. Generate Password for "Mail"
   ↓
4. Copy 16-character password
   ↓
5. Remove spaces
   ↓
6. Add to .env as EMAIL_PASSWORD
```

---

## Testing

### Test Email

```bash
cd backend
node -e "
require('dotenv').config();
const { sendEmail } = require('./src/config/email');
sendEmail({
  to: 'your.email@gmail.com',
  subject: 'Test',
  html: '<h1>It works!</h1>',
  text: 'It works!'
}).then(r => console.log('✅ Email sent!', r));
"
```

### Test Stripe

Use test card: `4242 4242 4242 4242`

---

## Summary

| Configuration | Value | Where to Get |
|---------------|-------|--------------|
| **Webhook URL** | `https://your-backend.com/api/subscriptions/webhook` | Your backend URL + `/api/subscriptions/webhook` |
| **Monthly Price** | $29.99/month | Stripe Products |
| **Yearly Price** | $299.99/year | Stripe Products |
| **Email User** | Your Gmail | Your Gmail address |
| **Email Password** | App Password | Google Account → Security → App Passwords |
| **API Key?** | Not needed for Gmail | N/A |

---

## Need More Help?

See detailed guides:
- `docs/CONFIGURATION_GUIDE.md` - Complete step-by-step
- `docs/DEPLOYMENT_GUIDE.md` - Full deployment process
- `backend/.env.example.DETAILED` - Detailed environment variables

---

**You're ready to configure! 🚀**
