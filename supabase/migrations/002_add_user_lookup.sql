-- Function to look up user ID by email
-- This is needed for admins to invite existing users to their company
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS UUID AS $$
  SELECT id
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

