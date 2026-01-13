# Deploy Mini ATS to Vercel

## Prerequisites
- ✅ Code pushed to GitHub: https://github.com/gfaizank/mini-ats.git
- ✅ Supabase project set up
- ✅ All migrations run in Supabase

---

## Step 1: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with your GitHub account
3. Click **"Add New..."** → **"Project"**
4. **Import** your repository: `gfaizank/mini-ats`
5. Vercel will auto-detect it's a Next.js project ✅

---

## Step 2: Configure Environment Variables

In the Vercel project setup, add these environment variables:

### Required Variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App URL (will be your Vercel domain)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# AWS S3 (if using file uploads)
AWS_REGION=your_region
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=your_bucket_name
```

### Where to Find These Values:

**Supabase Values:**
- Go to: Supabase Dashboard → Settings → API
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key (⚠️ Keep secret!)

**App URL:**
- After deployment, Vercel will give you a URL like: `https://mini-ats-xxx.vercel.app`
- You can add a custom domain later

---

## Step 3: Build & Deploy

1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies (`npm install`)
   - Build your app (`npm run build`)
   - Deploy to production
3. Wait 2-3 minutes for deployment ⏳

---

## Step 4: Post-Deployment Configuration

### A. Update Supabase Redirect URLs

1. Go to: **Supabase Dashboard → Authentication → URL Configuration**
2. Add your Vercel URL to **Redirect URLs**:

```
https://your-app.vercel.app/accept-invite
https://your-app.vercel.app/**
```

3. Update **Site URL** to: `https://your-app.vercel.app`

### B. Update NEXT_PUBLIC_APP_URL in Vercel

1. Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Update `NEXT_PUBLIC_APP_URL` to your actual Vercel URL
3. **Redeploy** (Vercel → Deployments → Three dots → Redeploy)

---

## Step 5: Test Your Deployment

### Test Checklist:

1. **Visit your Vercel URL**: `https://your-app.vercel.app`
   - ✅ Should see landing page

2. **Test Sign Up**:
   - Go to `/sign-up`
   - Create account with email, password, company name
   - Should redirect to dashboard

3. **Test Sign In**:
   - Sign out
   - Sign in with your credentials
   - Should access dashboard

4. **Test Invite Flow**:
   - Go to Settings → Team Members
   - Invite a test email
   - Check email and click invite link
   - Should redirect to accept-invite page
   - Set password and join

5. **Check Team Members**:
   - Settings → Team Members
   - Should see all members with emails

---

## Troubleshooting

### Issue: Build fails with "Module not found"

**Solution:** Check that all dependencies are in `package.json`

```bash
# Run locally to verify
npm install
npm run build
```

### Issue: "Invalid Supabase URL"

**Solution:** Double-check environment variables in Vercel
- Settings → Environment Variables
- Make sure no trailing slashes in URLs

### Issue: Invite emails not sending

**Solution:** Configure SMTP in Supabase (see EMAIL_TROUBLESHOOTING.md)

### Issue: 500 error on certain pages

**Solution:** Check Vercel logs
- Vercel Dashboard → Your Project → Logs
- Look for specific error messages

### Issue: Database connection fails

**Solution:** 
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
2. Check Supabase project is running
3. Verify all migrations are run

---

## Custom Domain Setup (Optional)

### Add Your Own Domain:

1. **Buy a domain** (Namecheap, GoDaddy, etc.)
2. In Vercel:
   - Project → Settings → Domains
   - Add domain: `yourdomain.com`
3. Update DNS records (Vercel will show you what to add)
4. Update Supabase redirect URLs to use your domain
5. Update `NEXT_PUBLIC_APP_URL` to your domain

---

## Environment Variables Summary

Here's what you need in Vercel:

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase → Settings → API (⚠️ Secret!) |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL | After first deploy |
| `AWS_REGION` | AWS region (if using S3) | AWS Console |
| `AWS_ACCESS_KEY_ID` | AWS access key | AWS Console |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | AWS Console |
| `AWS_S3_BUCKET_NAME` | S3 bucket name | AWS Console |

---

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created and connected to GitHub repo
- [ ] All environment variables added to Vercel
- [ ] First deployment successful
- [ ] Supabase redirect URLs updated with Vercel domain
- [ ] `NEXT_PUBLIC_APP_URL` updated in Vercel and redeployed
- [ ] SMTP configured in Supabase (for invite emails)
- [ ] Sign-up flow tested on production
- [ ] Sign-in flow tested on production
- [ ] Invite flow tested on production
- [ ] Team members displaying correctly

---

## Continuous Deployment

From now on, every time you push to the `main` branch on GitHub:
1. Vercel automatically detects the changes
2. Builds and deploys the new version
3. Your app updates automatically! 🎉

---

## Quick Deploy Commands

If you prefer using Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd /Users/faizankhan/Desktop/personal/mini-ats
vercel

# For production deployment
vercel --prod
```

---

## Next Steps After Deployment

1. ✅ Test all features on production
2. ✅ Set up custom domain (optional)
3. ✅ Configure email templates in Supabase
4. ✅ Set up monitoring/alerts in Vercel
5. ✅ Add your production URL to allowed origins if needed

---

## Your App is Ready! 🚀

**Production URL**: Will be shown after deployment (like `https://mini-ats-xxx.vercel.app`)

Visit it and start using your Mini ATS!

