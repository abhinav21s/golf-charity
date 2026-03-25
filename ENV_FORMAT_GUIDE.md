# Environment Variables Format Guide

## Important: NO QUOTES NEEDED

In `.env` files, you **DO NOT** need quotes around values.

### ✅ CORRECT Format

```env
PORT=5000
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_key_here
JWT_SECRET=my_secret_key_here
EMAIL_USER=myemail@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
FRONTEND_URL=http://localhost:3000
```

### ❌ WRONG Format (Don't use quotes)

```env
PORT="5000"
SUPABASE_URL="https://abcdefgh.supabase.co"
JWT_SECRET="my_secret_key_here"
EMAIL_USER="myemail@gmail.com"
```

## Why No Quotes?

Node.js reads `.env` files and automatically treats everything after `=` as the value. If you add quotes, they become part of the value!

### Example:

```env
# With quotes (WRONG)
EMAIL_USER="test@gmail.com"
# Node.js reads: "test@gmail.com" (includes the quotes!)

# Without quotes (CORRECT)
EMAIL_USER=test@gmail.com
# Node.js reads: test@gmail.com (just the value)
```

## Special Cases

### Values with Spaces

If your value has spaces, you still don't need quotes:

```env
# Correct
APP_NAME=Golf Charity Platform

# Also works, but not needed
APP_NAME="Golf Charity Platform"
```

### Empty Values

```env
# Leave empty (no quotes)
OPTIONAL_VALUE=
```

## Your .env File Should Look Like

```env
PORT=5000
NODE_ENV=development

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_anon_key
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_service_key

JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d

STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
STRIPE_MONTHLY_PRICE_ID=price_your_monthly_id
STRIPE_YEARLY_PRICE_ID=price_your_yearly_id

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM=noreply@golfcharity.com

FRONTEND_URL=http://localhost:3000

MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads/
```

## Summary

✅ **DO:** Write values directly after `=`
❌ **DON'T:** Add quotes around values
✅ **DO:** Copy-paste long keys without modification
❌ **DON'T:** Add spaces before or after `=`

---

**All fixes applied! Your .env.example is now correct.**
