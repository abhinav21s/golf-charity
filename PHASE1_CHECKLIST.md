# Phase 1 Setup Checklist

Quick checklist to get your local environment running.

---

## ☐ Step 1: Prerequisites

- [ ] Node.js installed (v18+)
- [ ] Code editor (VS Code recommended)
- [ ] Gmail account for email testing

---

## ☐ Step 2: Supabase Setup

- [ ] Created Supabase account
- [ ] Created new project
- [ ] Ran `database/supabase/schema.sql` in SQL Editor
- [ ] Copied Project URL
- [ ] Copied anon key
- [ ] Copied service_role key

---

## ☐ Step 3: Gmail Setup

- [ ] Enabled 2-Step Verification
- [ ] Generated App Password
- [ ] Saved 16-character password (no spaces)

---

## ☐ Step 4: Environment Files

- [ ] Created `backend/.env` file
- [ ] Filled in Supabase credentials
- [ ] Filled in Gmail credentials
- [ ] Created `frontend/.env` file

---

## ☐ Step 5: Admin User

- [ ] Generated password hash for `AdminTest123!`
- [ ] Ran SQL to create admin user
- [ ] Verified admin user exists in Supabase

---

## ☐ Step 6: Install Dependencies

- [ ] Ran `npm run install:all` (or manual install)
- [ ] No errors during installation

---

## ☐ Step 7: Start Servers

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] No errors in terminal

---

## ☐ Step 8: Test Features

### User Features
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] Welcome email received
- [ ] User login works
- [ ] Can add scores (test 5-score limit)
- [ ] Can view charities
- [ ] Can select charity

### Admin Features
- [ ] Admin login works
- [ ] Can access admin dashboard
- [ ] Can view users
- [ ] Can create draw (simulation)
- [ ] Can manage charities

---

## ✅ Phase 1 Complete!

When all checkboxes are checked, you're ready to:
1. Make UI changes
2. Complete remaining pages
3. Move to Phase 2 (deployment + Stripe)

---

## Need Help?

See `PHASE1_LOCAL_SETUP.md` for detailed instructions.

**Common Issues:**
- Backend won't start → Check `.env` file
- Can't login → Check admin user was created
- Email not sending → Check app password
- Database error → Check Supabase credentials
