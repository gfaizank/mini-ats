# 🔥 URGENT FIX - Add Service Role Key

## The Problem
The sign-up cleanup wasn't working because it needs **admin permissions** to delete users from Supabase Auth.

## THE FIX (Do this NOW):

### 1. Get Your Service Role Key

1. Go to your **Supabase Dashboard**
2. Select your project
3. Go to: **Settings** (gear icon) → **API**
4. Find the **`service_role`** key (NOT the anon key)
5. Click to reveal and copy it

### 2. Add It to Your .env.local File

Open or create `.env.local` in your mini-ats folder and add:

```bash
# Your existing keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# ADD THIS LINE (the fix):
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C in the terminal)
npm run dev
```

## Now Test Again

1. **Clear your browser cookies** or use **incognito mode**
2. Go to: `http://localhost:3001/sign-up`
3. Try signing up with a new email

### It Should Now Work!

If company creation fails for any reason, the user will be automatically cleaned up and you'll see an error message.

---

## Clean Up Your Current Orphaned User

Since you're stuck with an orphaned user, you need to delete it manually:

### Option 1: Supabase Dashboard (Easiest)
1. Go to: **Authentication** → **Users**
2. Find your email
3. Click **"..."** → **Delete user**

### Option 2: SQL Query
```sql
DELETE FROM auth.users WHERE email = 'your-email@example.com';
```

After deleting, clear cookies and try signing up again!

---

## ⚠️ Security Note

The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security and has full database access.
- ✅ Only use it in **server-side code** (Server Actions, API routes)
- ❌ NEVER expose it to the client
- ✅ Keep `.env.local` in your `.gitignore`

