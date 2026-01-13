-- Function to get company members with their email addresses
-- This allows us to show user emails in the team members list
CREATE OR REPLACE FUNCTION get_company_members_with_emails(company_uuid UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  role member_role,
  created_at TIMESTAMPTZ,
  email VARCHAR(255)
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    cm.user_id,
    cm.role,
    cm.created_at,
    au.email::VARCHAR(255)
  FROM company_members cm
  JOIN auth.users au ON cm.user_id = au.id
  WHERE cm.company_id = company_uuid
  ORDER BY cm.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_company_members_with_emails(UUID) TO authenticated;

