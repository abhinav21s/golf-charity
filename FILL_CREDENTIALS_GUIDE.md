# Fill Your Credentials - Step by Step

## ✅ Files Renamed

- `backend/.env.example` → `backend/.env` ✅
- `frontend/.env.example` → `frontend/.env` ✅

---

## 📝 Backend `.env` - Fill These Values

Open `backend/.env` and fill in your credentials:

### 1. Supabase Credentials

Go to Supabase Dashboard → Settings → API

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_anon_key
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_service_key
```

**NO QUOTES - Just paste the values directly**

### 2. JWT Secret

Generate a random string (32+ characters):

**Option A - Online:**
Go to: https://randomkeygen.com
Copy a "CodeIgniter Encryption Key"

**Option B - Command:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```env
JWT_SECRET=your_generated_random_string_here
```

### 3. Email Credentials

Use your Gmail and App Password:

```env
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your16charapppassword
```

**NO QUOTES - No spaces in the app password**

### 4. Stripe (Leave as dummy for Phase 1)

```env
STRIPE_SECRET_KEY=sk_test_dummy_for_phase1
STRIPE_WEBHOOK_SECRET=whsec_dummy_for_phase1
STRIPE_MONTHLY_PRICE_ID=price_dummy_monthly
STRIPE_YEARLY_PRICE_ID=price_dummy_yearly
```

**We'll add real Stripe keys in Phase 2**

---

## 📝 Frontend `.env` - Already Set

Open `frontend/.env` - it's already configured for Phase 1:

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_dummy_for_phase1
VITE_APP_NAME=Golf Charity Platform
VITE_APP_URL=http://localhost:3000
```

**No changes needed for Phase 1!**

---

## ✅ Complete Backend `.env` Example

Here's what your `backend/.env` should look like when filled:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODAwMDAwMDAsImV4cCI6MTk5NTU3NjAwMH0.abc123xyz
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4MDAwMDAwMCwiZXhwIjoxOTk1NTc2MDAwfQ.def456xyz

# JWT Configuration
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# Stripe Configuration (dummy for Phase 1)
STRIPE_SECRET_KEY=sk_test_dummy_for_phase1
STRIPE_WEBHOOK_SECRET=whsec_dummy_for_phase1
STRIPE_MONTHLY_PRICE_ID=price_dummy_monthly
STRIPE_YEARLY_PRICE_ID=price_dummy_yearly

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=myemail@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM=noreply@golfcharity.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads/
```

---

## 🚨 Important Rules

### ❌ DON'T Use Quotes

```env
# WRONG
SUPABASE_URL="https://abcdefgh.supabase.co"
EMAIL_USER="test@gmail.com"

# CORRECT
SUPABASE_URL=https://abcdefgh.supabase.co
EMAIL_USER=test@gmail.com
```

### ❌ DON'T Add Spaces

```env
# WRONG
EMAIL_USER = test@gmail.com
EMAIL_USER= test@gmail.com

# CORRECT
EMAIL_USER=test@gmail.com
```

### ✅ DO Copy-Paste Directly

Just copy from Supabase/Gmail and paste directly after the `=` sign.

---

## 📋 Checklist

Fill in these values in `backend/.env`:

- [ ] SUPABASE_URL (from Supabase Dashboard)
- [ ] SUPABASE_ANON_KEY (from Supabase Dashboard)
- [ ] SUPABASE_SERVICE_KEY (from Supabase Dashboard)
- [ ] JWT_SECRET (generate random string)
- [ ] EMAIL_USER (your Gmail address)
- [ ] EMAIL_PASSWORD (your 16-char app password)
- [ ] Leave Stripe values as dummy

Frontend `.env` is already set - no changes needed!

---

## ✅ Next Steps

After filling credentials:

1. Save both `.env` files
2. Continue with `PHASE1_LOCAL_SETUP.md` Step 5 (Create Admin User)
3. Install dependencies
4. Start the servers

---

**Remember: NO QUOTES around any values!**
