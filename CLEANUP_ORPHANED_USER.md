# Clean Up Orphaned User

## The Problem
You have a user in Supabase Auth that was created without a company. This happened because:
- The sign-up flow created the auth user
- But failed to create the company/membership
- And didn't clean up (this was the bug we just fixed)

## Solution: Delete the Orphaned User

### Option 1: Via Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard
2. Navigate to: **Authentication → Users**
3. Find the user with your email address
4. Click the **"..."** menu on the right
5. Select **"Delete user"**
6. Confirm deletion

### Option 2: Via SQL Query

1. Go to Supabase Dashboard → **SQL Editor**
2. Run this query (replace with your email):

```sql
-- Check if user exists
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Delete the user (replace with the actual user ID)
DELETE FROM auth.users WHERE email = 'your-email@example.com';
```

### Option 3: Via Supabase CLI

```bash
# Get user ID
supabase db query "SELECT id FROM auth.users WHERE email = 'your-email@example.com';"

# Delete user (replace USER_ID with actual ID)
supabase auth users delete USER_ID
```

## After Cleanup

1. Clear your browser cookies for `localhost:3001` (or use incognito mode)
2. Visit: `http://localhost:3001`
3. Try signing up again
4. This time, the fix should prevent any orphaned users from being created

## Verify the Fix is Working

After cleanup, test the new sign-up flow to ensure it works correctly now!

