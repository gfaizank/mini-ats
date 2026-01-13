-- Quick Diagnostic: Check if Free plan exists
-- Run this in Supabase SQL Editor

-- 1. Check if plans table has data
SELECT 'Plans in database:' as info;
SELECT * FROM plans;

-- 2. Specifically check for Free plan
SELECT 'Looking for Free plan:' as info;
SELECT * FROM plans WHERE name = 'Free';

-- 3. If no Free plan found, insert it
-- Uncomment and run this if the Free plan is missing:
/*
INSERT INTO plans (id, name, max_jobs, max_candidates) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Free', 5, 50),
  ('00000000-0000-0000-0000-000000000002', 'Starter', 20, 200),
  ('00000000-0000-0000-0000-000000000003', 'Pro', 100, 1000)
ON CONFLICT (id) DO NOTHING;
*/

-- 4. Check if any orphaned users exist
SELECT 'Users without companies:' as info;
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN company_members cm ON u.id = cm.user_id
WHERE cm.id IS NULL
ORDER BY u.created_at DESC;

-- 5. Check RLS policies on companies table
SELECT 'RLS Policies on companies table:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'companies';

