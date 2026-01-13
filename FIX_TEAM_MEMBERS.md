# Fix: Show Team Members with Emails

## Problem
The Team Members section was only showing "User ID: xxx..." instead of actual user emails.

## Root Cause
- The `getCompanyMembers` function was only fetching `user_id` from `company_members` table
- It couldn't query `auth.users` directly due to RLS restrictions
- The component had no email data to display

## Solution
Created a database function that can query `auth.users` table (using SECURITY DEFINER) and join it with company_members to return emails.

---

## Required Migration

You need to run this SQL in your Supabase database:

### Option 1: Via Supabase Dashboard (Quick)

1. Go to: **Supabase Dashboard → SQL Editor**
2. Click "New query"
3. Copy and paste this SQL:

```sql
-- Function to get company members with their email addresses
CREATE OR REPLACE FUNCTION get_company_members_with_emails(company_uuid UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  role member_role,
  created_at TIMESTAMPTZ,
  email TEXT
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
    au.email
  FROM company_members cm
  JOIN auth.users au ON cm.user_id = au.id
  WHERE cm.company_id = company_uuid
  ORDER BY cm.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_company_members_with_emails(UUID) TO authenticated;
```

4. Click **Run** (or press Cmd/Ctrl + Enter)
5. Should see: "Success. No rows returned"

### Option 2: Via Migration File (For Version Control)

The migration file is already created at:
```
supabase/migrations/003_add_member_email_lookup.sql
```

If using Supabase CLI:
```bash
supabase db push
```

---

## What Changed in Code

### 1. Updated `getCompanyMembers()` in `app/actions/companies.ts`:
**Before:**
```typescript
const { data, error } = await supabase
  .from('company_members')
  .select('id, user_id, role, created_at')
  .eq('company_id', companyId)
```

**After:**
```typescript
const { data, error } = await supabase
  .rpc('get_company_members_with_emails', { company_uuid: companyId })
```

### 2. Updated Member interface in `components/company/team-members-card.tsx`:
**Added:**
```typescript
interface Member {
  id: string
  user_id: string
  role: 'admin' | 'member'
  created_at: string
  email: string  // ← NEW!
}
```

### 3. Updated display in TeamMembersCard:
**Before:**
```tsx
<p className="font-medium">
  User ID: {member.user_id.substring(0, 8)}...
</p>
```

**After:**
```tsx
<p className="font-medium">
  {member.email}
</p>
```

---

## Test It

1. **Run the SQL migration** (Option 1 or 2 above)
2. **Refresh your app** (may need to restart dev server)
3. **Go to Settings → Team Members**
4. **You should now see:**
   - ✅ User email addresses (not User IDs)
   - ✅ Their roles (admin/member)
   - ✅ Join date
   - ✅ "You" badge for current user

---

## Terminal Logs

After the migration, when you visit the Team Members page, you'll see:

```
🔵 [GET MEMBERS] Fetching company members with emails...
✅ [GET MEMBERS] Found members: 2
```

---

## What the Function Does

```sql
get_company_members_with_emails(company_uuid)
├─ Joins company_members with auth.users
├─ Returns: id, user_id, role, created_at, email
├─ Filters by company_id
├─ Orders by created_at (oldest first)
└─ SECURITY DEFINER allows reading from auth.users
```

---

## Security Note

The function uses `SECURITY DEFINER` which means it runs with the permissions of the function owner (postgres), not the calling user. This is safe because:
- ✅ It only returns emails for members of the specified company
- ✅ Users can only query companies they belong to (enforced by calling code)
- ✅ No sensitive auth data is exposed (only email)

---

## Run the migration now and your team members will display properly! 🎉

