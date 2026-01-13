# Architecture Documentation

## System Overview

Mini ATS is a multi-tenant SaaS application for applicant tracking. It follows a serverless architecture pattern using Next.js App Router for the frontend and API layer, Supabase PostgreSQL for data storage with Row Level Security for tenant isolation, and AWS S3 for file storage.

## Architecture Diagram

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────────────────┐
│      Vercel Edge Network        │
│  (Next.js 14 App Router)        │
│                                 │
│  ┌──────────────────────────┐  │
│  │   React Server           │  │
│  │   Components             │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │   Server Actions         │  │
│  │   (Mutations)            │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │   API Routes             │  │
│  │   (File Uploads)         │  │
│  └──────────────────────────┘  │
└───────┬─────────────────┬───────┘
        │                 │
        │                 │
        ▼                 ▼
┌────────────────┐  ┌────────────┐
│   Supabase     │  │   AWS S3   │
│   PostgreSQL   │  │  (Resumes) │
│   + Auth       │  └────────────┘
│   + RLS        │
└────────────────┘
```

## Database Schema

### Core Tables

1. **plans** - Subscription tiers
2. **companies** - Tenant organizations
3. **company_members** - User-company relationships with roles
4. **jobs** - Job postings
5. **candidates** - Candidate profiles
6. **applications** - Candidate-job applications

### Relationships

- Companies have many members (users)
- Companies have many jobs
- Companies have many candidates
- Jobs have many applications
- Candidates have many applications
- Applications connect candidates to jobs

## Multi-Tenancy Implementation

### Row Level Security (RLS)

The core security mechanism is Supabase's Row Level Security:

**Principle**: Users can only access data from companies they're members of.

**Implementation**:
```sql
-- Example: Jobs table RLS policy
CREATE POLICY "Users can view jobs from their companies"
ON jobs FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM company_members 
    WHERE user_id = auth.uid()
  )
);
```

**Benefits**:
- Data isolation enforced at database level
- No application code needed for filtering
- Prevents accidental data leakage
- Automatic across all queries

### Authentication Flow

1. User signs up → Supabase creates auth.users record
2. Server action creates company → User becomes admin
3. JWT token includes user_id
4. All database queries filtered by auth.uid()

## Data Flow Patterns

### Server Actions Pattern

Used for all mutations (create, update, delete):

```typescript
// Server action
'use server'
export async function createJob(companyId: string, formData: FormData) {
  const supabase = await createClient()
  // Validate user access
  // Check plan limits
  // Insert data
  // Revalidate paths
}
```

**Advantages**:
- Type-safe
- Co-located with components
- Automatic serialization
- Built-in progressive enhancement

### Server Components Pattern

Used for data fetching:

```typescript
// Page component
export default async function JobsPage({ params }) {
  const { data } = await getJobs(params.companyId)
  return <JobList jobs={data} />
}
```

**Advantages**:
- Server-side rendering
- No client-side JS for data fetching
- Better performance
- Automatic caching

### File Upload Flow

1. Client selects file
2. Client-side validation (type, size)
3. Upload to API route `/api/upload-resume`
4. Server validates user access
5. Upload to S3 with organized key structure
6. Return S3 key to client
7. Save key in database with candidate

## Security Considerations

### Authentication
- JWT tokens managed by Supabase Auth
- Automatic token refresh via middleware
- HttpOnly cookies prevent XSS

### Authorization
- RLS policies enforce company-level access
- Role checks in server actions for admin operations
- No client-side authorization checks

### File Upload Security
- File type validation (MIME type)
- File size limits (5MB)
- S3 pre-signed URLs with expiry
- Organized folder structure prevents conflicts

### CORS Configuration
- S3 bucket allows specific domains
- Supabase Auth allows specific redirect URLs
- API routes validate origin

## Performance Optimizations

### Database
- Indexes on foreign keys and frequently queried columns
- Efficient RLS policies using IN subqueries
- Connection pooling via Supabase

### Caching
- Next.js automatic page caching
- Revalidation after mutations
- Aggressive CDN caching for static assets

### File Storage
- Pre-signed URLs cached for 1 hour
- Files served directly from S3
- No proxying through application

## Plan Limits Implementation

### Enforcement Points

1. **Server Actions**: Check before creation
   ```typescript
   const { count } = await supabase
     .from('jobs')
     .select('*', { count: 'exact', head: true })
     .eq('company_id', companyId)
     .eq('status', 'open')
   
   if (count >= plan.max_jobs) {
     return { error: 'Plan limit reached' }
   }
   ```

2. **UI Display**: Show usage indicators
   - Progress bars in settings
   - Warning messages before limit

### Limit Types

- **Open Jobs**: Only active/open jobs count
- **Total Candidates**: All candidates regardless of status

## Deployment Architecture

### Vercel Platform

- **Edge Network**: Global CDN
- **Serverless Functions**: Auto-scaling API routes
- **Automatic HTTPS**: SSL certificates
- **Environment Variables**: Secure secret management

### External Services

1. **Supabase** (Database + Auth)
   - Hosted PostgreSQL
   - Built-in auth service
   - Real-time subscriptions (not used yet)

2. **AWS S3** (File Storage)
   - Object storage for resumes
   - Pre-signed URLs for access
   - Lifecycle policies (future: auto-delete old files)

## Scalability Considerations

### Current Limitations

1. **Supabase Free Tier**: 500MB database, 1GB file storage
2. **Vercel Free Tier**: 100GB bandwidth, 100 serverless function executions
3. **S3 Costs**: Pay per storage and transfer
4. **No Background Jobs**: Long-running tasks not supported

### Scaling Path

**Phase 1** (100-1000 users):
- Current architecture sufficient
- Upgrade to Supabase Pro
- Use Vercel Pro for better limits

**Phase 2** (1000-10000 users):
- Add Redis for caching
- Implement background job queue
- Use read replicas for database
- CDN for S3 assets

**Phase 3** (10000+ users):
- Microservices for specific domains
- Separate read/write databases
- Dedicated infrastructure for file processing
- Real-time features with WebSockets

## Testing Strategy

### Manual Testing Checklist

1. **Authentication**
   - Sign up new user
   - Sign in existing user
   - Sign out
   - Access protected routes without auth

2. **Multi-tenancy**
   - Create two companies
   - Verify data isolation
   - Test RLS policies manually

3. **Job Management**
   - Create job
   - Hit plan limit
   - Update job
   - Close job

4. **Candidate Management**
   - Add candidate
   - Upload resume
   - Hit plan limit
   - View candidate details

5. **Applications**
   - Create application
   - Update stage
   - View kanban board

### Future Testing

- Unit tests with Jest
- Integration tests with Playwright
- API tests with Supertest
- Database tests with Supabase local

## Known Limitations

### Current Scope

1. **No Email Notifications**: Users don't get emails for events
2. **No Search**: Basic filtering only, no full-text search
3. **No Real-time**: Changes don't appear without refresh
4. **No Analytics**: No dashboard with metrics
5. **Manual User Invitation**: No email invite system
6. **Single Company per Signup**: User creates one company at signup
7. **No Resume Parsing**: Manual entry only
8. **Basic File Support**: PDF, DOC, DOCX only

### Technical Debt

1. **No Validation Library**: Basic form validation only
2. **No Error Boundaries**: Errors shown as simple messages
3. **No Optimistic UI**: Most updates require full refresh
4. **No Rate Limiting**: Could be abused
5. **No Audit Logs**: No tracking of who changed what
6. **Hard-coded Plan IDs**: Uses specific UUIDs from seed data

## Future Improvements

### High Priority

1. **Email Notifications**
   - Application status changes
   - New candidate assignments
   - Job closing reminders

2. **Search & Filters**
   - Full-text search on candidates
   - Advanced job filtering
   - Saved search queries

3. **Real-time Updates**
   - Supabase realtime subscriptions
   - Live kanban board updates
   - Collaborative editing indicators

### Medium Priority

1. **Resume Parsing**
   - Extract candidate info from resume
   - Support more file formats
   - OCR for scanned documents

2. **Analytics Dashboard**
   - Time-to-hire metrics
   - Source tracking
   - Pipeline conversion rates

3. **Interview Scheduling**
   - Calendar integration
   - Availability management
   - Automated reminders

### Low Priority

1. **Offer Management**
   - Offer letter templates
   - Salary negotiations
   - E-signatures

2. **API for Integrations**
   - Public REST API
   - Webhooks
   - Third-party integrations

3. **White Label**
   - Custom branding
   - Custom domains
   - SSO/SAML

## Design Decisions & Tradeoffs

### Next.js App Router vs Pages Router

**Decision**: App Router

**Rationale**:
- Modern, officially recommended
- Better server components support
- Improved routing patterns
- Future-proof

**Tradeoff**: Less mature ecosystem, some libraries not compatible

### Supabase vs Custom Backend

**Decision**: Supabase

**Rationale**:
- Faster development
- Built-in auth
- Excellent RLS support
- Cost-effective

**Tradeoff**: Vendor lock-in, less control over infrastructure

### S3 vs Supabase Storage

**Decision**: AWS S3

**Rationale**:
- More familiar for users
- Better performance at scale
- More features (lifecycle, versioning)
- Industry standard

**Tradeoff**: Additional service to manage, CORS complexity

### Server Actions vs API Routes

**Decision**: Server Actions for mutations

**Rationale**:
- Type-safe
- Simpler code
- Better DX
- Automatic optimizations

**Tradeoff**: Newer pattern, less documented, requires understanding of React Server Components

### shadcn/ui vs Component Library

**Decision**: shadcn/ui

**Rationale**:
- Copy-paste approach
- Full customization
- No runtime dependencies
- Tailwind integration

**Tradeoff**: More code to maintain, manual updates needed

## Conclusion

This architecture prioritizes rapid development, security through RLS, and ease of deployment. It's suitable for small to medium-scale ATS needs (up to ~10k users) and can be scaled vertically by upgrading services or horizontally by adding caching and read replicas.

The use of managed services (Supabase, S3, Vercel) reduces operational overhead while maintaining good performance and security. The serverless approach ensures automatic scaling and cost efficiency for variable workloads typical of SaaS applications.

