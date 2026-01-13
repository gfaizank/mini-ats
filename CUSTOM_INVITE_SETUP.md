# Custom Invite Email Template Setup

## 🎯 What You Need to Do

Configure Supabase to use your custom invite acceptance page.

---

## Step 1: Add Environment Variable

Add this to your `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, set it to your actual domain:
```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## Step 2: Configure Supabase Email Template

Go to: **Supabase Dashboard → Authentication → Email Templates → Invite user**

Replace the template with:

```html
<h2>You've been invited to join Mini ATS!</h2>

<p>You've been invited to join a team on Mini ATS.</p>

<p>Click the button below to accept the invitation and set your password:</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
    Accept Invitation
  </a>
</p>

<p style="color: #6B7280; font-size: 14px;">Or copy and paste this URL into your browser:</p>
<p style="color: #6B7280; font-size: 12px; word-break: break-all;">{{ .ConfirmationURL }}</p>

<p style="margin-top: 32px; color: #6B7280; font-size: 14px;">
  This invitation will expire in 24 hours.
</p>

<p style="color: #6B7280; font-size: 14px;">
  If you didn't expect this invitation, you can safely ignore this email.
</p>
```

---

## Step 3: Configure Redirect URL in Supabase

Go to: **Supabase Dashboard → Authentication → URL Configuration**

Add to **Redirect URLs**:
```
http://localhost:3000/accept-invite
http://localhost:3000/**
```

For production, also add:
```
https://yourdomain.com/accept-invite
https://yourdomain.com/**
```

---

## Step 4: Test the Flow

1. **Restart your dev server** (to load the new env variable):
```bash
npm run dev
```

2. **Delete the previous test user** (if any):
   - Supabase Dashboard → Authentication → Users
   - Find `john@example.com` → Delete

3. **Send a new invitation**:
   - Go to Settings → Team Members
   - Invite: `john@example.com`
   - Check terminal logs

4. **Check the email** (use a real email or check Supabase logs)

5. **Click "Accept Invitation"** in the email

6. **Should redirect to**: `http://localhost:3000/accept-invite?token=...&type=invite`

7. **Enter password** and confirm

8. **Should be signed in** and redirected to dashboard ✅

---

## 🎨 What the User Sees

### Email Content:
```
Subject: You've been invited to join Mini ATS!

You've been invited to join a team on Mini ATS.

[Accept Invitation] (Big blue button)

Or copy and paste this URL...

This invitation will expire in 24 hours.
```

### Accept Invite Page:
```
┌─────────────────────────────────────┐
│  Accept Your Invitation              │
│  You've been invited to join         │
│  [Company Name] on Mini ATS          │
├─────────────────────────────────────┤
│  Email                               │
│  john@example.com [disabled]         │
│                                      │
│  Set Your Password                   │
│  [__________] Minimum 6 characters   │
│                                      │
│  Confirm Password                    │
│  [__________]                        │
│                                      │
│  [Accept Invitation & Join Team]     │
└─────────────────────────────────────┘
```

---

## 🔍 Terminal Logs You'll See

### When Inviting:
```
🔵 [INVITE MEMBER] Step 3: Looking up user by email...
⚠️ [INVITE MEMBER] User not found, creating new user and sending invite email...
✅ [INVITE MEMBER] Step 3: User invited and invitation email sent: {
  email: 'john@example.com',
  userId: 'xxx-xxx-xxx',
  redirectUrl: 'http://localhost:3000/accept-invite'
}
✅ [INVITE MEMBER] Step 5: Member added successfully
🎉 [INVITE MEMBER] Invite completed successfully!
```

### When Accepting Invite:
```
🔵 [ACCEPT INVITE] Step 1: Validating passwords...
✅ [ACCEPT INVITE] Step 1: Passwords valid
🔵 [ACCEPT INVITE] Step 2: Verifying invite token...
✅ [ACCEPT INVITE] Step 2: Token verified, user: xxx-xxx-xxx
🔵 [ACCEPT INVITE] Step 3: Updating user password...
✅ [ACCEPT INVITE] Step 3: Password updated
🔵 [ACCEPT INVITE] Step 4: Signing in user...
✅ [ACCEPT INVITE] Step 4: User signed in successfully
🎉 [ACCEPT INVITE] Invitation accepted successfully!
```

---

## 🐛 Troubleshooting

### Issue: "Invalid or expired invitation link"

**Cause**: Token expired (24 hours) or already used

**Solution**: Send a new invitation

### Issue: Email shows wrong URL

**Cause**: `redirectTo` in invite doesn't match

**Solution**: Check `NEXT_PUBLIC_APP_URL` is set correctly

### Issue: Can't access accept-invite page

**Cause**: URL not in Supabase redirect whitelist

**Solution**: Add URL to Supabase Auth URL Configuration

### Issue: Password update fails

**Cause**: Service role key not configured

**Solution**: Make sure `SUPABASE_SERVICE_ROLE_KEY` is in `.env.local`

---

## ✅ Complete Flow Summary

```
1. Admin invites john@example.com
   └─> Creates user in Supabase Auth (unconfirmed)
   └─> Adds to company_members table
   └─> Sends invite email with link to /accept-invite

2. John receives email
   └─> "You've been invited to join [Company] on Mini ATS"
   └─> Clicks "Accept Invitation" button

3. Redirects to /accept-invite page
   └─> Email prefilled: john@example.com (disabled)
   └─> Shows company name
   └─> John enters password (twice)

4. Submits form
   └─> Verifies invite token
   └─> Updates user password
   └─> Signs user in automatically
   └─> Redirects to / (root page)

5. Root page checks user
   └─> User has company membership ✅
   └─> Redirects to /{companyId}/jobs
   └─> John sees the dashboard! 🎉
```

---

## 🚀 Ready to Test!

1. ✅ Add `NEXT_PUBLIC_APP_URL=http://localhost:3000` to `.env.local`
2. ✅ Configure email template in Supabase
3. ✅ Add `http://localhost:3000/accept-invite` to redirect URLs in Supabase settings
4. ✅ Restart dev server
5. ✅ Send test invitation
6. ✅ Check email and click link
7. ✅ Enter password
8. ✅ Should be signed in!

**The custom onboarding flow is ready!** 🎊

