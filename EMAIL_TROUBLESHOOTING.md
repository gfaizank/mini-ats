# Email Not Sending - Troubleshooting Guide

## ✅ Fix Applied

Changed from `admin.createUser()` to `admin.inviteUserByEmail()` which properly sends invitation emails.

---

## 🔍 Why Emails Might Not Send

### 1. **Development Environment - Supabase Uses Inbucket**

In local development with Supabase CLI, emails go to **Inbucket** (a test email server).

**To check emails in local dev:**
```
http://localhost:54324/inbucket
```

### 2. **Hosted Supabase - SMTP Not Configured**

For hosted Supabase projects, you need to configure SMTP or emails won't send.

**Check if SMTP is configured:**
1. Go to: **Supabase Dashboard → Project Settings → Auth**
2. Scroll to: **SMTP Settings**
3. Check if "Enable Custom SMTP" is ON

**If not configured**, Supabase has limitations:
- Free tier: Limited emails per hour
- No custom SMTP: Uses Supabase's default (rate limited)

---

## 🚀 How to Configure SMTP (Recommended for Production)

### Option 1: Use Gmail SMTP

1. Go to: **Supabase Dashboard → Project Settings → Auth → SMTP Settings**
2. Enable "Custom SMTP"
3. Fill in:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: your-email@gmail.com
   Password: [App Password - not your regular password]
   Sender email: your-email@gmail.com
   Sender name: Mini ATS
   ```

**To get Gmail App Password:**
- Google Account → Security → 2-Step Verification → App passwords
- Generate password for "Mail"

### Option 2: Use SendGrid (Better for production)

1. Sign up at: https://sendgrid.com (Free tier: 100 emails/day)
2. Create API Key
3. In Supabase SMTP Settings:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Your SendGrid API Key]
   Sender email: noreply@yourdomain.com
   Sender name: Mini ATS
   ```

### Option 3: Use Resend (Modern & Easy)

1. Sign up at: https://resend.com (Free tier: 100 emails/day)
2. Get API key
3. Configure in Supabase SMTP settings

---

## 🧪 Testing Right Now (Without SMTP)

### Quick Test - Check Supabase Logs

Even without SMTP configured, you can verify the invite was created:

**1. Check Auth Logs:**
```
Supabase Dashboard → Logs → Auth Logs
```

Look for: `inviteUserByEmail` event

**2. Check Users Table:**
```
Supabase Dashboard → Authentication → Users
```

Find the invited email - Status should show "Invited" or "Waiting for verification"

**3. Manually Generate Magic Link:**

Go to: **Supabase Dashboard → Authentication → Users**
- Find the invited user
- Click "..." menu
- Select "Send magic link" or "Generate link"
- Copy the link and send it manually for testing

---

## 🔧 For Local Development Testing

### Option A: Use Supabase Local (with Inbucket)

```bash
# Start Supabase locally
supabase start

# Emails will appear at:
http://localhost:54324/inbucket
```

### Option B: Use a Real Test Email

For quick testing, use a disposable email service:
- https://temp-mail.org
- https://10minutemail.com
- https://guerrillamail.com

Invite that email address and check the inbox.

---

## 📧 Email Template Configuration

Make sure email templates are enabled:

**Supabase Dashboard → Authentication → Email Templates**

Check these templates are enabled:
- ✅ **Invite user** (This is the one we're using!)
- ✅ **Confirm signup**
- ✅ **Magic Link**

### Customize the "Invite user" template:

```html
<h2>You've been invited to join a team on Mini ATS</h2>

<p>Click the link below to accept the invitation and set your password:</p>

<p><a href="{{ .ConfirmationURL }}">Accept Invitation</a></p>

<p>This link will expire in 24 hours.</p>

<p>If you didn't expect this invitation, you can safely ignore this email.</p>
```

---

## ✅ Verification Checklist

After configuring SMTP, test:

- [ ] SMTP settings configured in Supabase
- [ ] Email templates are enabled
- [ ] Invite a test email address
- [ ] Check terminal logs show success
- [ ] Check email inbox (or spam folder)
- [ ] Click invitation link
- [ ] Set password
- [ ] Sign in successfully

---

## 🐛 Still Not Working?

### Check Terminal Logs

When you invite someone, you should see:

```
✅ [INVITE MEMBER] Step 3: User invited and invitation email sent
```

If you see an error instead, share it with me.

### Check Supabase Dashboard

**Authentication → Users** should show:
- Email address listed
- Status: "Invited" or "Waiting"
- An "Invited at" timestamp

### Temporary Workaround

For immediate testing without email setup:

1. Use `admin.createUser()` with a known password:
```javascript
await adminClient.auth.admin.createUser({
  email: email,
  password: 'temp-password-123', // They can change it later
  email_confirm: true
})
```

2. Share the password with the user directly
3. They sign in and change their password

---

## 🎯 Recommended Setup for Production

```
1. ✅ Configure SMTP (SendGrid or Resend recommended)
2. ✅ Customize email templates with your branding
3. ✅ Set proper redirect URLs
4. ✅ Test with real email addresses
5. ✅ Enable rate limiting to prevent abuse
```

Let me know what you see in the Supabase logs!

