import { getJobById, closeJob, reopenJob, archiveJob } from '@/app/actions/jobs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, MapPin, Building, Users } from 'lucide-react'
import { notFound } from 'next/navigation'
import JobActions from './job-actions'

interface ApplicationWithCandidate {
  id: string
  stage: string
  candidates: {
    id: string
    name: string
    email: string
  }
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ companyId: string; jobId: string }>
}) {
  const { companyId, jobId } = await params
  const jobResult = await getJobById(jobId) as { data?: any; error?: string }
  
  if (!jobResult.data || jobResult.error) {
    notFound()
  }

  const job = jobResult.data

  const applicationCount = job.applications?.length || 0

  return (
    <div className="max-w-4xl">
      <Link
        href={`/${companyId}/jobs`}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  <Badge
                    variant={
                      job.status === 'open'
                        ? 'default'
                        : job.status === 'closed'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {job.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                  )}
                  {job.department && (
                    <span className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {job.department}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {applicationCount} {applicationCount === 1 ? 'application' : 'applications'}
                  </span>
                </div>
              </div>
              <JobActions 
                jobId={jobId} 
                status={job.status} 
                closeJob={closeJob} 
                reopenJob={reopenJob} 
                archiveJob={archiveJob} 
              />
            </div>
          </CardHeader>
          {job.description && (
            <CardContent>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>
              Candidates who have applied for this position
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applicationCount === 0 ? (
              <p className="text-gray-600">No applications yet</p>
            ) : (
              <div className="space-y-3">
                {job.applications?.map((application: ApplicationWithCandidate) => (
                  <Link
                    key={application.id}
                    href={`/${companyId}/candidates/${application.candidates.id}`}
                    className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{application.candidates.name}</p>
                        <p className="text-sm text-gray-600">{application.candidates.email}</p>
                      </div>
                      <Badge variant="outline">{application.stage}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

