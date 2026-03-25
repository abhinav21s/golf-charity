# Testing Guide - Golf Charity Platform

## Quick Setup for Testing

### Step 1: Make Yourself Admin

Run this in Supabase SQL Editor (replace with YOUR email):

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify it worked
SELECT id, email, role FROM users;
```

### Step 2: Logout and Login Again

**IMPORTANT:** You must logout and login again for the admin role to take effect!

1. Click the logout button (top right)
2. Login again with same credentials
3. You'll now see "Admin" link in the navbar

### Step 3: Add Sample Data

Run this in Supabase SQL Editor:

```sql
-- Add sample charities
INSERT INTO charities (name, description, is_featured, is_active)
VALUES 
  ('Save the Children', 'Helping children worldwide with education, health, and emergency aid.', true, true),
  ('Red Cross', 'Providing emergency assistance, disaster relief, and disaster preparedness education.', true, true),
  ('Doctors Without Borders', 'Delivering medical care where it is needed most.', false, true);

-- Add manual subscription for testing (replace with your user_id)
-- First, find your user_id:
SELECT id, email FROM users WHERE email = 'your-email@example.com';

-- Then insert subscription (replace 'your-user-id-here'):
INSERT INTO subscriptions (user_id, plan_type, status, start_date, end_date, stripe_subscription_id)
VALUES 
  ('your-user-id-here', 'monthly', 'active', NOW(), NOW() + INTERVAL '1 month', 'manual_test_sub');
```

## Complete User Flow (Without Stripe)

### 1. Admin Setup (Do First)
1. **Login as admin** (after running SQL above and re-logging in)
2. **Add charities:** Admin → Manage Charities → + Add Charity
3. **Create draw:** Admin → Manage Draws → + Create Draw → Simulate → Publish

### 2. Regular User Flow
1. **Register:** Create new account
2. **Login:** Sign in
3. **Select charity:** Charities page → Pick one → Set contribution % (10-100%)
4. **Add scores:** Scores page → Add up to 5 scores (1-45)
5. **Wait for draw:** Admin creates monthly draw
6. **Check results:** Draws page → See if you matched winning numbers
7. **If you won:** Winnings page → Upload proof → Admin verifies → Get paid

### 3. Admin Monthly Tasks
1. **Create draw:** Admin → Manage Draws → + Create Draw
2. **Simulate:** Preview winners and prizes
3. **Publish:** Make draw official
4. **Verify winners:** Admin → Manage Winners → View Proof → Approve/Reject
5. **Process payments:** Mark as Paid after verification

## How to Access Admin Features

**Admin Panel Location:**
- Look for "Admin" link in the top navigation bar (only visible to admin users)
- Click "Admin" → Goes to Admin Dashboard
- From there, access all admin pages:
  - Manage Users
  - Manage Charities
  - Manage Draws
  - Manage Winners

## Testing Without Stripe

**What works WITHOUT Stripe:**
- ✅ User registration/login
- ✅ Charity selection
- ✅ Score submission
- ✅ Draw creation and results
- ✅ Winner verification
- ✅ All admin features
- ⚠️ Subscription payment (shows "coming soon" - use manual SQL insert)

**Manual Subscription for Testing:**
Since Stripe isn't integrated, manually add subscriptions using the SQL above.

## Common Issues

### "Admin link not showing"
- Make sure you ran the UPDATE users SQL
- **MUST logout and login again** for role to update in JWT token
- Check browser console for any errors

### "Unable to load draws"
- No draws exist yet
- Admin needs to create first draw
- Go to Admin → Manage Draws → + Create Draw

### "Can't add charity"
- Backend was restarted after adding admin routes
- Restart backend: `cd backend && npm start`

### "No subscription"
- Stripe not integrated yet (Phase 2)
- Manually add subscription using SQL above
- Or skip subscription check for testing

## Restart Backend

After adding the admin routes, restart your backend:

```bash
# Stop the backend (Ctrl+C)
# Then restart:
cd backend
npm start
```

## Testing Checklist

- [ ] Made yourself admin in database
- [ ] Logged out and logged in again
- [ ] Can see "Admin" link in navbar
- [ ] Added sample charities (via SQL or admin panel)
- [ ] Added manual subscription (via SQL)
- [ ] Selected a charity
- [ ] Added 5 golf scores
- [ ] Created and published a draw (as admin)
- [ ] Checked draw results
- [ ] Tested winner verification (if you won)

## Next Steps (Phase 2)

After local testing is complete:
1. Deploy to production
2. Integrate Stripe for real payments
3. Configure email notifications
4. Set up automated monthly draws
