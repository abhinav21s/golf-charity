# Test Charity Creation

## Step 1: Restart Backend

**CRITICAL:** You must restart the backend after I added the admin routes!

```bash
# In your backend terminal:
# Press Ctrl+C to stop
# Then run:
cd backend
npm start
```

## Step 2: Check Your Admin Status

Open browser DevTools (F12) → Console tab, then run:

```javascript
// Check your current user data
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('User ID:', payload.userId);
  console.log('Token expires:', new Date(payload.exp * 1000));
}

// Check if you're logged in
fetch('http://localhost:5000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
}).then(r => r.json()).then(console.log);
```

## Step 3: Test Charity Creation Manually

Open browser DevTools (F12) → Console tab, then run:

```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/charities/admin/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Test Charity',
    description: 'This is a test charity',
    logoUrl: '',
    websiteUrl: '',
    contactEmail: '',
    isFeatured: false
  })
})
.then(r => r.json())
.then(data => {
  console.log('Response:', data);
  if (!data.success) {
    console.error('Error:', data.error || data.message);
  }
})
.catch(err => console.error('Network error:', err));
```

## Step 4: Check Backend Logs

Look at your backend terminal for error messages. Common errors:

### Error: "Failed to create charity"
- Check backend logs for database error
- Verify charities table exists: `SELECT * FROM charities LIMIT 1;`

### Error: "Unauthorized" or "Access denied"
- Your role is not 'admin'
- Run: `SELECT id, email, role FROM users;` to verify
- **MUST logout and login again** after changing role

### Error: "Route not found" or 404
- Backend wasn't restarted after adding admin routes
- Restart backend (see Step 1)

### Error: Network error
- Backend is not running
- Check backend terminal is running on port 5000

## Step 5: Verify Database Schema

Run this in Supabase SQL Editor:

```sql
-- Check if charities table exists and see its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'charities'
ORDER BY ordinal_position;

-- Try inserting directly in database
INSERT INTO charities (name, description, status)
VALUES ('Direct Test Charity', 'Testing direct insert', 'active')
RETURNING *;
```

## Quick Checklist

- [ ] Backend is restarted (after adding admin routes)
- [ ] You are logged in as admin (check with DevTools)
- [ ] You logged out and back in after changing role
- [ ] Charities table exists in database
- [ ] Backend shows no errors in terminal
- [ ] Browser console shows no network errors

## If Still Not Working

Share the error from:
1. Backend terminal output
2. Browser console (F12 → Console tab)
3. Browser network tab (F12 → Network tab → look for the failed request)
