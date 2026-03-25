# Golf Charity Subscription Platform

A subscription-driven web application that combines golf performance tracking (Stableford scores), monthly draw-based prize pools, and charitable giving.

## 🎯 Project Overview

- **Subscription-based**: Monthly or yearly plans with Stripe integration
- **Score Tracking**: Enter and manage your last 5 Stableford scores (1-45)
- **Monthly Draws**: Participate in 3-tier prize draws (5-match, 4-match, 3-match)
- **Charity Integration**: 10% minimum of subscription goes to your chosen charity
- **Modern UI/UX**: Emotion-driven design focused on impact, not traditional golf aesthetics

## 🛠️ Tech Stack

### Frontend
- React 18
- Tailwind CSS
- shadcn/ui components
- Axios for API calls
- React Router for navigation

### Backend
- Express.js
- Node.js
- JWT authentication
- Stripe payment integration
- Nodemailer for email notifications

### Database
- Supabase PostgreSQL

### Deployment
- Frontend: Vercel
- Backend: Your preferred Node.js hosting

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe account

### Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd golf-charity-platform
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Configure environment variables**

Create `.env` files in both frontend and backend directories (see `.env.example` files)

4. **Set up Supabase database**
- Create a new Supabase project
- Run the SQL scripts in `database/supabase/schema.sql`

5. **Configure Stripe**
- Set up products for Monthly and Yearly subscriptions
- Add webhook endpoint for subscription events

6. **Run development servers**
```bash
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:5000

## 🚀 Deployment

### Frontend (Vercel)
1. Create new Vercel account
2. Import the `frontend` directory
3. Configure environment variables
4. Deploy

### Backend
1. Choose hosting provider (Railway, Render, etc.)
2. Configure environment variables
3. Deploy

## 📋 Features Checklist

- ✅ User authentication (signup/login)
- ✅ Subscription management (monthly/yearly)
- ✅ Score entry system (5 rolling scores)
- ✅ Monthly draw engine (random/algorithmic)
- ✅ Prize pool calculation (40%/35%/25% split)
- ✅ Charity selection and contribution
- ✅ Winner verification flow
- ✅ User dashboard
- ✅ Admin dashboard
- ✅ Email notifications
- ✅ Responsive design

## 🧪 Test Credentials

### User Account
- Email: user@test.com
- Password: TestUser123!

### Admin Account
- Email: admin@test.com
- Password: AdminTest123!

## 📖 Documentation

See `/docs` directory for:
- API documentation
- Database schema
- Deployment guide
- Architecture overview

## 🤝 Contributing

This is a production project. Please follow the established code structure and conventions.

## 📄 License

MIT License
