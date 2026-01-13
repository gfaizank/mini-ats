-- STEP 1: First, check if the function exists
-- Run this in your Supabase SQL Editor:

SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_user_id_by_email';

-- If the above returns NO ROWS, then run this migration:

-- Function to look up user ID by email
-- This is needed for admins to invite existing users to their company
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS UUID AS $$
  SELECT id
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- STEP 2: Test the function works
-- Replace 'test@example.com' with an email of an existing user:

SELECT get_user_id_by_email('test@example.com');

-- STEP 3: View all users in your system to find valid emails:

SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

