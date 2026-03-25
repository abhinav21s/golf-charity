# Phase 1: Local Setup Without Stripe

Complete guide to run the Golf Charity Platform locally for development and UI testing.

---

## What You'll Test in Phase 1

✅ User registration and login
✅ Score entry (5-score rolling window)
✅ Charity selection
✅ Draw creation (admin)
✅ Winner management
✅ All UI pages
✅ Email notifications
❌ Stripe subscription (Phase 2)

---

## Step 1: Install Node.js

**Check if you have Node.js:**
```bash
node --version
```

If you see a version number (like `v18.0.0` or higher), you're good!

If not, download from: https://nodejs.org (Download LTS version)

---

## Step 2: Set Up Supabase Database

### A. Create Supabase Project

1. Go to https://supabase.com
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - **Name**: golf-charity-platform
   - **Database Password**: (create a strong password - SAVE IT!)
   - **Region**: Choose closest to you
5. Click "Create new project"
6. Wait 2 minutes for setup

### B. Run Database Schema

1. In Supabase dashboard, click **SQL Editor** (left menu)
2. Click "New Query"
3. Open the file `database/supabase/schema.sql` from your project
4. Copy ALL the content
5. Paste into Supabase SQL Editor
6. Click "Run" (or press Ctrl+Enter)
7. Wait for "Success" message

### C. Get Supabase Credentials

1. Go to **Settings** (gear icon) → **API**
2. Copy these 3 values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
   - **service_role** key (long string starting with `eyJ...`)

**SAVE THESE! You'll need them in Step 4.**

---

## Step 3: Set Up Gmail for Email Notifications

### A. Enable 2-Step Verification

1. Go to https://myaccount.google.com
2. Click **Security** (left menu)
3. Find **2-Step Verification**
4. Click and follow the setup steps
5. Complete verification

### B. Generate App Password

1. Still in **Security** settings
2. Scroll to **App passwords**
3. Click **App passwords**
4. Select:
   - App: **Mail**
   - Device: **Other (Custom name)**
5. Enter: `Golf Charity Platform`
6. Click **Generate**
7. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)
8. Remove spaces: `abcdefghijklmnop`

**SAVE THIS! You'll need it in Step 4.**

---

## Step 4: Configure Environment Variables

### A. Create Backend .env File

1. Navigate to `backend` folder
2. Create a new file named `.env` (exactly, no .txt extension)
3. Copy this content and fill in YOUR values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration (from Step 2C)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_anon_key_here
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_service_key_here

# JWT Secret (generate random string)
JWT_SECRET=my_super_secret_jwt_key_for_local_testing_min_32_chars
JWT_EXPIRES_IN=7d

# Stripe Configuration (DUMMY VALUES for Phase 1)
STRIPE_SECRET_KEY=sk_test_dummy_for_local_testing
STRIPE_WEBHOOK_SECRET=whsec_dummy_for_local_testing
STRIPE_MONTHLY_PRICE_ID=price_dummy_monthly
STRIPE_YEARLY_PRICE_ID=price_dummy_yearly

# Email Configuration (from Step 3B)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM=noreply@golfcharity.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads/
```

**Replace these with YOUR values:**
- `SUPABASE_URL` → Your Supabase project URL
- `SUPABASE_ANON_KEY` → Your anon key
- `SUPABASE_SERVICE_KEY` → Your service role key
- `EMAIL_USER` → Your Gmail address
- `EMAIL_PASSWORD` → Your 16-char app password (no spaces)

**Leave Stripe values as dummy - we'll configure real ones in Phase 2**

### B. Create Frontend .env File

1. Navigate to `frontend` folder
2. Create a new file named `.env`
3. Copy this content:

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_dummy_for_local_testing
VITE_APP_NAME=Golf Charity Platform
VITE_APP_URL=http://localhost:3000
```

**No changes needed - use as is for Phase 1**

---

## Step 5: Create Admin User in Database

We need an admin account to test admin features.

1. Go to Supabase dashboard
2. Click **SQL Editor**
3. Click "New Query"
4. Copy and paste this:

```sql
-- First, we need to hash the password
-- Password will be: AdminTest123!

INSERT INTO users (
  email, 
  password_hash, 
  first_name, 
  last_name, 
  role, 
  status
)
VALUES (
  'admin@golfcharity.com',
  '$2a$10$YourHashedPasswordHere',
  'Admin',
  'User',
  'admin',
  'active'
);
```

**Wait! We need to hash the password first.**

### Generate Password Hash

**Option A: Use Online Tool**
1. Go to: https://bcrypt-generator.com
2. Enter password: `AdminTest123!`
3. Rounds: 10
4. Click "Generate"
5. Copy the hash (starts with `$2a$10$`)

**Option B: Use Node.js**
```bash
node -e "console.log(require('bcryptjs').hashSync('AdminTest123!', 10))"
```

**Now update the SQL:**
Replace `$2a$10$YourHashedPasswordHere` with your generated hash and run the query.

---

## Step 6: Install Dependencies

Open terminal in your project root folder:

```bash
# Install all dependencies
npm run install:all
```

This will install dependencies for both backend and frontend.

**If that doesn't work, install manually:**

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## Step 7: Start the Application

You need **2 terminal windows** open.

### Terminal 1: Start Backend

```bash
cd backend
npm run dev
```

**You should see:**
```
==================================================
🏌️  Golf Charity Platform API
==================================================
Server running on port 5000
Environment: development
Frontend URL: http://localhost:3000
==================================================
```

**Keep this terminal running!**

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

**You should see:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**Keep this terminal running too!**

---

## Step 8: Test the Application

### A. Open in Browser

Go to: http://localhost:3000

You should see the homepage!

### B. Test User Registration

1. Click "Get Started" or "Register"
2. Fill in the form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: TestUser123!
   - Confirm Password: TestUser123!
3. Click "Create Account"
4. Check your email for welcome message
5. You should be redirected to pricing page

**Note:** Subscription won't work yet (that's Phase 2)

### C. Test Admin Login

1. Go to http://localhost:3000/login
2. Login with:
   - Email: admin@golfcharity.com
   - Password: AdminTest123!
3. You should see "Admin" link in navbar
4. Click "Admin" to access admin dashboard

### D. Test Score Entry (After Creating User Account)

1. Login as regular user (test@example.com)
2. Go to "Scores" page
3. Add a score:
   - Score: 36 (between 1-45)
   - Date: Today's date
4. Click "Add Score"
5. Add 5 more scores
6. Notice the 6th score removes the oldest one!

### E. Test Charity Selection

1. Go to "Charities" page
2. Browse the 5 sample charities
3. Click on a charity
4. Click "Select This Charity"
5. Set contribution percentage (10-100%)

### F. Test Admin Features

1. Login as admin
2. Go to Admin Dashboard
3. Test:
   - View users
   - Create a draw (simulation mode)
   - Manage charities
   - View winners

---

## Step 9: What Works and What Doesn't

### ✅ Works in Phase 1

- User registration and login
- Email notifications
- Score entry (5-score rolling window)
- Charity browsing and selection
- Draw creation and simulation (admin)
- Winner management (admin)
- All UI pages and navigation
- Profile management

### ❌ Doesn't Work in Phase 1 (Needs Phase 2)

- Subscription checkout (Stripe)
- Payment processing
- Stripe webhooks
- Subscription status updates
- Automatic charity contributions from subscriptions

**This is expected! We'll fix this in Phase 2.**

---

## Troubleshooting

### Backend won't start

**Error: "Missing environment variables"**
- Check `backend/.env` file exists
- Verify all values are filled in
- No extra spaces or quotes

**Error: "Database connection failed"**
- Check Supabase URL and keys are correct
- Verify Supabase project is active
- Check internet connection

### Frontend won't start

**Error: "Cannot find module"**
- Run `npm install` in frontend folder
- Delete `node_modules` and run `npm install` again

### Can't login

**Error: "Invalid email or password"**
- Check you created the admin user in Step 5
- Verify password hash was generated correctly
- Try creating a new user via registration

### Email not sending

**Error: "Username and Password not accepted"**
- Verify 2-Step Verification is enabled
- Use App Password, not regular Gmail password
- Remove spaces from app password
- Check EMAIL_USER is your full Gmail address

---

## Next Steps

Once you've tested everything and made UI changes:

1. ✅ Test all features listed above
2. ✅ Make any UI/UX changes you want
3. ✅ Complete remaining frontend pages
4. ✅ Tell me when you're ready for Phase 2

**Then we'll move to Phase 2:**
- Deploy backend to Railway
- Configure real Stripe products
- Set up webhook
- Deploy frontend to Vercel
- Test complete subscription flow

---

## Quick Reference

### Test Credentials

**Admin:**
- Email: admin@golfcharity.com
- Password: AdminTest123!

**Regular User:**
- Create via registration form

### URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health

### Stop Servers

Press `Ctrl + C` in each terminal window

---

**You're ready for Phase 1! 🚀**

Start testing and let me know when you're ready for Phase 2 (deployment + Stripe).
