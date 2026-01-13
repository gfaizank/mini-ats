# Testing the Sign-Up Bug Fix

## Prerequisites
- Dev server running on `http://localhost:3001`
- Access to Supabase dashboard
- Browser DevTools open (Network tab)

---

## Test 1: Normal Sign-Up (Happy Path) ✅

### Steps:
1. Navigate to `http://localhost:3001/sign-up`
2. Fill in the form:
   - **Company Name**: "Test Company"
   - **Email**: "normal-test@example.com"
   - **Password**: "password123"
3. Click "Sign Up"

### Expected Results:
- ✅ Network tab shows: `POST /sign-up` → **303** redirect to `/`
- ✅ Then: `GET /` → **307** redirect to `/{companyId}/jobs`
- ✅ Dashboard loads successfully
- ✅ Company switcher shows "Test Company"

### Verify in Supabase:
- ✅ User exists in `auth.users` table
- ✅ Company exists in `companies` table
- ✅ Membership exists in `company_members` table

---

## Test 2: Missing "Free" Plan (Simulated Failure) 🐛

### Setup:
1. Go to Supabase Dashboard → SQL Editor
2. Run this query to temporarily remove the Free plan:
```sql
-- Backup the plan first
CREATE TEMP TABLE plans_backup AS SELECT * FROM plans WHERE name = 'Free';

-- Delete the Free plan
DELETE FROM plans WHERE name = 'Free';
```

### Steps:
1. Navigate to `http://localhost:3001/sign-up`
2. Fill in the form:
   - **Company Name**: "Broken Test"
   - **Email**: "broken-test@example.com"
   - **Password**: "password123"
3. Click "Sign Up"

### Expected Results:
- ✅ Network tab shows: `POST /sign-up` → **303** redirect to `/sign-up?error=...`
- ✅ Error message displays: "Failed to find Free plan. Please contact support."
- ✅ User is NOT stuck in broken state

### Verify in Supabase:
- ✅ User should NOT exist in `auth.users` (cleaned up)
- ✅ No orphaned records

### Cleanup:
```sql
-- Restore the Free plan
INSERT INTO plans SELECT * FROM plans_backup;
DROP TABLE plans_backup;
```

---

## Test 3: Company Creation Failure (Permission Error) 🐛

### Setup:
1. Go to Supabase Dashboard → SQL Editor
2. Temporarily revoke insert permission:
```sql
-- Remove insert permission on companies
REVOKE INSERT ON companies FROM authenticated;
```

### Steps:
1. Navigate to `http://localhost:3001/sign-up`
2. Fill in the form:
   - **Company Name**: "Permission Test"
   - **Email**: "permission-test@example.com"
   - **Password**: "password123"
3. Click "Sign Up"

### Expected Results:
- ✅ Network tab shows: `POST /sign-up` → **303** redirect to `/sign-up?error=...`
- ✅ Error message displays: "Failed to create company. Please try again."
- ✅ User is cleaned up from auth table

### Cleanup:
```sql
-- Restore insert permission
GRANT INSERT ON companies TO authenticated;
```

---

## Test 4: Company Member Insert Failure 🐛

### Setup:
1. Go to Supabase Dashboard → SQL Editor
2. Temporarily revoke insert permission:
```sql
-- Remove insert permission on company_members
REVOKE INSERT ON company_members FROM authenticated;
```

### Steps:
1. Navigate to `http://localhost:3001/sign-up`
2. Fill in the form:
   - **Company Name**: "Member Test"
   - **Email**: "member-test@example.com"
   - **Password**: "password123"
3. Click "Sign Up"

### Expected Results:
- ✅ Network tab shows: `POST /sign-up` → **303** redirect to `/sign-up?error=...`
- ✅ Error message displays: "Failed to set up user permissions. Please try again."
- ✅ Both user AND company are cleaned up

### Verify in Supabase:
- ✅ User deleted from `auth.users`
- ✅ Company deleted from `companies` table

### Cleanup:
```sql
-- Restore insert permission
GRANT INSERT ON company_members TO authenticated;
```

---

## Test 5: Edge Case - User Without Company (Fallback) 🛡️

### Setup:
If you somehow have a user without a company (from before the fix), they should see the error page.

### Manual Creation:
```sql
-- Create a test user in auth (do this via Supabase Dashboard → Authentication → Add User)
-- Email: orphan-user@example.com
-- Password: password123

-- Don't create company or membership
```

### Steps:
1. Navigate to `http://localhost:3001/sign-in`
2. Sign in with:
   - **Email**: "orphan-user@example.com"
   - **Password**: "password123"

### Expected Results:
- ✅ Redirected to `/`
- ✅ Sees "Account Setup Incomplete" error page
- ✅ "Sign Out and Try Again" button visible
- ✅ Click button → signs out → redirected to `/sign-in`

---

## Test 6: Network Monitor - Check HTTP Status Codes

### Using Browser DevTools:
1. Open Network tab
2. Preserve log
3. Go through sign-up flow

### Expected Status Codes:
```
GET  /sign-up              → 200 OK
POST [server action]       → 303 See Other → / (on success)
                            303 See Other → /sign-up?error=... (on failure)
GET  /                     → 200 OK or 307 Temporary Redirect
GET  /{companyId}/jobs     → 200 OK
```

---

## Automated Test Script (Optional)

Here's a simple test you can run via terminal to check the database state:

```bash
# After a failed sign-up, verify cleanup happened
psql $SUPABASE_DB_URL -c "SELECT email FROM auth.users WHERE email = 'broken-test@example.com';"
# Should return: (0 rows)

psql $SUPABASE_DB_URL -c "SELECT name FROM companies WHERE name = 'Broken Test';"
# Should return: (0 rows)
```

---

## Quick Verification Checklist

After each test:

- [ ] Check Network tab for correct HTTP status codes
- [ ] Verify error messages are user-friendly
- [ ] Check Supabase for orphaned records
- [ ] Ensure user can try again after failure
- [ ] Confirm successful flow still works

---

## Common Issues to Watch For

1. **Admin API Not Available**: If `supabase.auth.admin.deleteUser()` fails, you might need to use the service role key
2. **RLS Policies**: Make sure your Row Level Security policies allow the cleanup operations
3. **Cascade Deletes**: Check if deleting a company automatically cleans up related records

---

## Success Criteria ✅

The fix is working if:
1. ✅ Normal sign-up works perfectly
2. ✅ Failed sign-ups clean up the auth user
3. ✅ No orphaned records remain in database
4. ✅ Users see helpful error messages
5. ✅ Users can retry sign-up after failure
6. ✅ Edge case (user without company) shows error page

