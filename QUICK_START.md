# Golf Charity Platform - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- Git installed

### Step 1: Install Dependencies (2 minutes)

```bash
# Clone or navigate to project directory
cd golf-charity-platform

# Install all dependencies
npm run install:all
```

### Step 2: Set Up Environment Variables (2 minutes)

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development

# Supabase (get from supabase.com)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# JWT Secret (generate random string)
JWT_SECRET=your_random_secret_min_32_chars

# Stripe (get from stripe.com)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
STRIPE_MONTHLY_PRICE_ID=price_monthly
STRIPE_YEARLY_PRICE_ID=price_yearly

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@golfcharity.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
VITE_APP_NAME=Golf Charity Platform
VITE_APP_URL=http://localhost:3000
```

### Step 3: Set Up Database (1 minute)

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Copy contents of `database/supabase/schema.sql`
4. Paste and run

### Step 4: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 5: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health

---

## 🧪 Test Credentials

### Admin Account
```
Email: admin@golfcharity.com
Password: AdminTest123!
```

### Test User
```
Email: user@test.com
Password: TestUser123!
```

### Stripe Test Card
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```

---

## 📁 Project Structure

```
golf-charity-platform/
├── backend/           # Express.js API (✅ 100% Complete)
├── frontend/          # React App (⏳ 30% Complete)
├── database/          # SQL Schema (✅ Complete)
├── docs/              # Documentation (✅ Complete)
└── README.md
```

---

## 🎯 What's Working

### Backend (100% Complete)
✅ User authentication (register/login)
✅ Subscription management (Stripe)
✅ Score entry (5-score rolling window)
✅ Draw system (random + algorithmic)
✅ Charity selection and contributions
✅ Winner verification workflow
✅ Admin APIs for all features
✅ Email notifications

### Frontend (30% Complete)
✅ Routing and navigation
✅ Authentication context
✅ API service layer
✅ Design system (Tailwind)
✅ HomePage (emotion-driven design)
✅ LoginPage
⏳ 12 pages remaining (structure ready)

---

## 📚 Documentation

- **Deployment Guide**: `docs/DEPLOYMENT_GUIDE.md`
- **Project Status**: `docs/PROJECT_STATUS.md`
- **Final Summary**: `docs/FINAL_SUMMARY.md`
- **API Endpoints**: See comments in `frontend/src/services/api.js`

---

## 🔧 Common Issues

### Backend won't start
- Check `.env` file exists in `backend/` directory
- Verify all environment variables are set
- Check Supabase credentials

### Frontend won't start
- Check `.env` file exists in `frontend/` directory
- Verify `VITE_API_URL` points to backend
- Run `npm install` in frontend directory

### Database connection fails
- Verify Supabase URL and keys
- Check if database schema was run
- Ensure Supabase project is active

---

## 🎨 Design System

### Colors (Emotion-Driven)
- **Primary**: Blue (sky, ocean) - Trust, calm
- **Accent**: Purple/Pink - Excitement, energy
- **Success**: Green - Growth, achievement
- **NOT**: Traditional golf greens, plaid, clubs

### Components
- Buttons: `.btn`, `.btn-primary`, `.btn-secondary`
- Cards: `.card`, `.card-gradient`
- Inputs: `.input`
- Badges: `.badge`, `.badge-primary`

---

## 🚀 Next Steps

1. **Complete Frontend Pages** (4-6 hours)
   - Use HomePage and LoginPage as templates
   - Follow patterns in `docs/PROJECT_STATUS.md`
   - All API endpoints are ready

2. **Test Locally**
   - Test all user flows
   - Test admin workflows
   - Verify responsive design

3. **Deploy to Production**
   - Follow `docs/DEPLOYMENT_GUIDE.md`
   - Deploy backend (Railway/Render)
   - Deploy frontend (Vercel)
   - Configure Stripe webhooks

---

## 💡 Key Features

### 5-Score Rolling Window
- Users can only have 5 scores
- Adding 6th score auto-deletes oldest
- Enforced at database level

### Draw System
- Random or algorithmic generation
- 3-tier prizes (5/4/3 match)
- Fixed distribution (40%/35%/25%)
- Jackpot rollover

### Charity Integration
- 10% minimum contribution
- Automatic on each subscription
- User can increase percentage
- Full tracking and reporting

### Winner Verification
- Upload proof of scores
- Admin review workflow
- Payment tracking
- Email notifications

---

## 📞 Support

For detailed information:
- **Deployment**: See `docs/DEPLOYMENT_GUIDE.md`
- **Features**: See `docs/PROJECT_STATUS.md`
- **Summary**: See `docs/FINAL_SUMMARY.md`

---

## ✅ Checklist

Before deploying:
- [ ] Database schema created in Supabase
- [ ] Stripe products created (monthly + yearly)
- [ ] Environment variables configured
- [ ] Admin user created in database
- [ ] Sample charities added
- [ ] Email service configured
- [ ] Stripe webhook configured
- [ ] All frontend pages completed
- [ ] Local testing passed
- [ ] Responsive design verified

---

**Ready to make an impact! 🏌️❤️**

Play. Win. Give.
