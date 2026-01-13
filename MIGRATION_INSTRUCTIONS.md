# Migration Instructions - Add User Lookup Function

## Quick Diagnosis

If you're getting "User not found" error, follow these steps:

### Step 1: Check if migration is applied

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this query:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_user_id_by_email';
```

- **If it returns NO ROWS**: The migration hasn't been applied yet (proceed to Step 2)
- **If it returns a row**: The function exists, your issue is different (proceed to Step 3)

### Step 2: Apply the Migration

Copy and paste this SQL into Supabase SQL Editor and click **Run**:

```sql
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS UUID AS $$
  SELECT id
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;
```

### Step 3: Verify Users Exist

Check what users exist in your system:

```sql
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;
```

Use one of these email addresses when adding a member!

### Step 4: Test the Function

Test that the function works with an actual user email:

```sql
SELECT get_user_id_by_email('actual-user@example.com');
```

Replace `'actual-user@example.com'` with a real email from Step 3.

---

## What this adds:
- A new database function `get_user_id_by_email()` that allows admins to look up users by their email address
- This is required for the team member invitation functionality
- The function has SECURITY DEFINER to allow reading from auth.users table

## After running the migration:
Your admin users will be able to:
- Add existing users to their company by email
- Change member roles
- Remove members from the company

All from the Settings page Team Members section.

## Troubleshooting

**Error: "Database error: ... Did you run the migration?"**
- The function doesn't exist. Run the SQL from Step 2.

**Error: "User not found. They must sign up first."**
- The user with that email doesn't exist in your system yet
- They need to sign up first at `/sign-up`
- Or check the exact email using the query in Step 3

