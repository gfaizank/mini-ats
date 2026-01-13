-- VERIFICATION STEPS
-- Run these queries in your Supabase SQL Editor:

-- 1. Confirm the function exists (should return 1 row)
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_user_id_by_email';

-- 2. List all users in your system
SELECT id, email, created_at, email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC;

-- 3. Test the function with one of the emails from step 2
-- Replace 'user@example.com' with an actual email from your results
SELECT get_user_id_by_email('user@example.com');

-- This should return a UUID if the user exists, or NULL if they don't

