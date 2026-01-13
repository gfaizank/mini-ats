# Mini ATS - Applicant Tracking System

A modern, multi-tenant applicant tracking system built with Next.js 14, Supabase, and AWS S3.

## Features

- 🏢 **Multi-tenant Architecture** - Complete data isolation between companies using Supabase RLS
- 👥 **Role-Based Access Control** - Admin and Member roles with appropriate permissions
- 💼 **Job Management** - Create, view, update, and close job openings
- 👤 **Candidate Management** - Track candidates with resume uploads to AWS S3
- 📋 **Application Pipeline** - Kanban board to track candidates through hiring stages
- 📊 **Usage Limits** - Plan-based limits for jobs and candidates
- 🔒 **Secure Authentication** - Built on Supabase Auth with JWT tokens

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth
- **File Storage**: AWS S3
- **UI Components**: shadcn/ui + Tailwind CSS
- **Deployment**: Vercel (optimized)

## Prerequisites

- Node.js 18+ 
- A Supabase project
- An AWS account with S3 bucket
- npm or yarn

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo>
cd mini-ats
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration file:
   - Execute `supabase/migrations/001_initial_schema.sql`
   - Execute `supabase/seed.sql` to create default plans
3. Get your project URL and anon key from Settings > API

### 3. Set Up AWS S3

1. Create a new S3 bucket in AWS Console
2. Create an IAM user with these permissions:
   - `s3:PutObject`
   - `s3:GetObject`
   - `s3:DeleteObject`
3. Generate access keys for the IAM user
4. Configure CORS on your S3 bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
    "ExposeHeaders": []
  }
]
```

### 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_s3_bucket_name
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
mini-ats/
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Protected dashboard routes
│   ├── actions/             # Server actions
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── applications/        # Application-specific components
│   ├── candidates/          # Candidate components
│   ├── company/             # Company components
│   └── dashboard/           # Dashboard components
├── lib/
│   ├── supabase/            # Supabase client configuration
│   ├── s3.ts                # AWS S3 utilities
│   └── utils.ts             # Utility functions
├── supabase/
│   ├── migrations/          # Database migrations
│   └── seed.sql             # Seed data
└── types/
    └── database.types.ts    # TypeScript database types
```

## Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add all environment variables from `.env.local`
4. Deploy!

### Option 2: Deploy via Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts and add your environment variables when asked.

### Post-Deployment

1. Update S3 CORS policy to include your Vercel domain
2. Update Supabase Auth settings to allow your Vercel domain
3. Test authentication flow and file uploads

## Key Features Explained

### Multi-Tenancy

The system uses Supabase Row Level Security (RLS) to ensure complete data isolation:
- All queries are automatically filtered by company membership
- Users can only access data from companies they belong to
- No application code needed for data isolation

### Role-Based Access Control

Two roles are supported:
- **Admin**: Can manage company settings, invite members, and manage all data
- **Member**: Can manage jobs, candidates, and applications

### Plan Limits

Companies are assigned plans (Free, Starter, Pro) with limits on:
- Number of open jobs
- Total number of candidates

The system checks these limits before creating new jobs or candidates.

### Resume Storage

Resumes are uploaded to AWS S3 with:
- Organized folder structure: `resumes/{companyId}/{candidateId}/{filename}`
- Pre-signed URLs for secure downloads (1-hour expiry)
- Automatic cleanup when candidates are deleted

## Usage

### First Time Setup

1. Sign up at `/sign-up` with your email and company name
2. You'll be automatically logged in and assigned as admin
3. Start by creating job openings at `/{companyId}/jobs`

### Creating Jobs

1. Navigate to Jobs section
2. Click "Create Job"
3. Fill in job details (title, location, department, description)
4. Job is created if you haven't reached your plan limit

### Adding Candidates

1. Navigate to Candidates section
2. Click "Add Candidate"
3. Fill in candidate information
4. Optionally upload resume (PDF, DOC, DOCX)
5. Candidate is created if you haven't reached your plan limit

### Managing Applications

1. Go to candidate detail page
2. Click "Add to Job" to create an application
3. View all applications in Applications section (Kanban view)
4. Drag cards or use dropdown to update application stage

## Development

### Running Tests

```bash
npm run test
```

### Linting

```bash
npm run lint
```

### Building for Production

```bash
npm run build
npm run start
```

## Troubleshooting

### Authentication Issues

- Ensure Supabase URL and keys are correct
- Check that your domain is allowed in Supabase Auth settings
- Clear cookies and try again

### File Upload Issues

- Verify AWS credentials are correct
- Check S3 bucket CORS policy
- Ensure IAM user has correct permissions
- Check file size (5MB limit)

### Database Errors

- Ensure migrations have been run
- Check RLS policies are enabled
- Verify user has company membership

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues first
- Provide detailed reproduction steps

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Database and Auth by [Supabase](https://supabase.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Deployed on [Vercel](https://vercel.com)
