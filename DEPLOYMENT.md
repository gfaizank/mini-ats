# Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. ✅ A Supabase project with migrations applied
2. ✅ An AWS S3 bucket configured
3. ✅ A Vercel account
4. ✅ All environment variables ready

## Step 1: Prepare Supabase

### Run Migrations

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Execute the query
5. Copy and paste the contents of `supabase/seed.sql`
6. Execute to create default plans

### Configure Authentication

1. Go to Authentication > URL Configuration
2. Add your Vercel domain to Site URL
3. Add your Vercel domain to Redirect URLs:
   - `https://your-domain.vercel.app/**`
   - `http://localhost:3000/**` (for local development)

### Get Credentials

1. Go to Settings > API
2. Copy:
   - Project URL
   - Project API keys (anon public)
   - Service role key (keep secret!)

## Step 2: Configure AWS S3

### Create Bucket

```bash
# Using AWS CLI
aws s3 mb s3://your-ats-bucket-name
```

Or create via AWS Console.

### Set Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-ats-bucket-name/*"
    }
  ]
}
```

### Configure CORS

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-domain.vercel.app"
    ],
    "ExposeHeaders": []
  }
]
```

### Create IAM User

1. Create new IAM user: `mini-ats-uploader`
2. Attach policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-ats-bucket-name/*"
    }
  ]
}
```

3. Generate access keys

## Step 3: Deploy to Vercel

### Option A: Via GitHub (Recommended)

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/mini-ats.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

6. Add Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name
```

7. Click "Deploy"

### Option B: Via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow prompts
5. Add environment variables when prompted

### Option C: Manual Deployment

1. Build locally:
```bash
npm run build
```

2. Upload to Vercel via dashboard

## Step 4: Post-Deployment

### Test Authentication

1. Visit your deployed URL
2. Click "Sign Up"
3. Create an account
4. Verify you can log in

### Test File Upload

1. Go to Candidates
2. Add a candidate with resume
3. Verify file uploads to S3
4. Check you can download resume

### Update CORS

1. Update S3 CORS to include your Vercel domain
2. Update Supabase redirect URLs

### Set Custom Domain (Optional)

1. Go to Vercel project settings
2. Add custom domain
3. Configure DNS:
   - Type: A
   - Name: @
   - Value: 76.76.21.21
   
   Or CNAME:
   - Type: CNAME
   - Name: www
   - Value: cname.vercel-dns.com

## Step 5: Monitoring

### Check Logs

```bash
vercel logs
```

Or view in Vercel dashboard.

### Monitor Errors

1. Vercel Dashboard > Analytics
2. Check error rates
3. Review function logs

### Database Usage

1. Supabase Dashboard > Database
2. Monitor connections
3. Check table sizes

## Troubleshooting

### Build Errors

**Error**: TypeScript errors

**Solution**: 
```bash
npm run build
```
Fix any type errors locally first.

**Error**: Missing environment variables

**Solution**: Ensure all env vars are set in Vercel dashboard.

### Runtime Errors

**Error**: "Not authenticated"

**Solution**: 
- Clear cookies
- Check Supabase URL/keys
- Verify Auth redirect URLs

**Error**: File upload fails

**Solution**:
- Check S3 CORS policy
- Verify IAM permissions
- Check file size limit
- Verify AWS credentials

**Error**: Database queries fail

**Solution**:
- Check RLS policies
- Verify user has company membership
- Review Supabase logs

### Performance Issues

**Issue**: Slow page loads

**Solutions**:
- Enable Vercel Analytics
- Check database query performance
- Add indexes if needed
- Optimize images

**Issue**: High database load

**Solutions**:
- Add database indexes
- Implement caching
- Optimize queries
- Upgrade Supabase plan

## Scaling Considerations

### Free Tier Limits

- **Vercel Free**: 100GB bandwidth, 100 function executions
- **Supabase Free**: 500MB database, 1GB file storage, 50K monthly active users
- **AWS S3**: Pay-as-you-go (very cheap for small usage)

### When to Upgrade

Upgrade Vercel when:
- Exceeding bandwidth limits
- Need more function execution time
- Want custom domains on team plan

Upgrade Supabase when:
- Database size > 500MB
- Need more than 2 concurrent connections
- Want daily backups
- Need better performance

### Optimization Tips

1. **Images**: Use Next.js Image component
2. **Caching**: Implement Redis for frequent queries
3. **CDN**: Use Vercel's built-in CDN
4. **Database**: Add indexes on frequently queried columns
5. **File Storage**: Implement CDN for S3 assets

## Security Checklist

- [ ] All environment variables stored in Vercel (not in code)
- [ ] S3 bucket not publicly writable
- [ ] IAM user has minimal permissions
- [ ] Supabase RLS policies enabled on all tables
- [ ] Auth redirect URLs restricted to your domain
- [ ] CORS policies restricted to your domain
- [ ] Service role key never exposed to client
- [ ] File upload size limits enforced
- [ ] File types validated

## Rollback Procedure

If deployment fails:

1. Go to Vercel Dashboard
2. Find previous successful deployment
3. Click "Promote to Production"

Or via CLI:
```bash
vercel rollback
```

## Backup Strategy

### Database

Supabase Pro includes daily backups. For Free tier:

1. Export regularly:
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Export
supabase db dump -f backup.sql
```

2. Store backups securely (S3, Google Drive, etc.)

### Files

S3 versioning:
```bash
aws s3api put-bucket-versioning \
  --bucket your-ats-bucket-name \
  --versioning-configuration Status=Enabled
```

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

To disable auto-deploy:
1. Go to Project Settings
2. Git > Production Branch
3. Uncheck "Automatic Production Deployments"

## Environment-Specific Settings

### Development
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
# ... local Supabase
```

### Staging
```env
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
# ... staging Supabase
```

### Production
```env
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
# ... production Supabase
```

## Cost Estimation

Monthly costs for typical usage (100-500 active users):

- **Vercel**: $0-20 (Free to Pro)
- **Supabase**: $0-25 (Free to Pro)
- **AWS S3**: $1-5 (storage + transfer)
- **Total**: $1-50/month

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)

## Maintenance Tasks

### Weekly
- [ ] Review error logs
- [ ] Check API response times
- [ ] Monitor database size

### Monthly
- [ ] Review usage metrics
- [ ] Check for security updates
- [ ] Update dependencies
- [ ] Review and optimize slow queries

### Quarterly
- [ ] Full security audit
- [ ] Performance optimization review
- [ ] Cost optimization review
- [ ] Backup restoration test

## Success Metrics

Track these after deployment:

1. **Uptime**: Target 99.9%
2. **Page Load Time**: < 2 seconds
3. **Error Rate**: < 0.1%
4. **Database Query Time**: < 100ms average
5. **File Upload Success Rate**: > 99%

Use Vercel Analytics and Supabase metrics to monitor these.

