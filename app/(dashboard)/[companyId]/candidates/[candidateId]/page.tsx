import { getCandidateById } from '@/app/actions/candidates'
import { getJobs } from '@/app/actions/jobs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AddApplicationDialog } from '@/components/applications/add-application-dialog'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Linkedin, FileText, ExternalLink } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getResumeUrl } from '@/lib/s3'

interface ApplicationWithDetails {
  id: string
  stage: string
  created_at: string
  jobs: {
    id: string
    title: string
    status: string
  }
}

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ companyId: string; candidateId: string }>
}) {
  const { companyId, candidateId } = await params
  const candidateResult = await getCandidateById(candidateId) as { data?: any; error?: string }
  const jobsResult = await getJobs(companyId, 'open') as { data?: any[]; error?: string }

  if (!candidateResult.data || candidateResult.error) {
    notFound()
  }

  const candidate = candidateResult.data
  const jobs = jobsResult.data || []

  const applicationCount = candidate.applications?.length || 0
  const availableJobs = jobs.filter(job => 
    !candidate.applications?.some((app: ApplicationWithDetails) => app.jobs.id === job.id)
  )
  
  let resumeDownloadUrl = null
  if (candidate.resume_url) {
    try {
      resumeDownloadUrl = await getResumeUrl(candidate.resume_url)
    } catch (e) {
      console.error('Failed to generate resume URL:', e)
    }
  }

  return (
    <div className="max-w-4xl">
      <Link
        href={`/${companyId}/candidates`}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Candidates
      </Link>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{candidate.name}</CardTitle>
            <div className="flex flex-col gap-2 text-gray-600">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {candidate.email}
              </span>
              {candidate.phone && (
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {candidate.phone}
                </span>
              )}
              {candidate.linkedin_url && (
                <a
                  href={candidate.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline cursor-pointer"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn Profile
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {resumeDownloadUrl && (
                <a
                  href={resumeDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  Download Resume
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </CardHeader>
          {candidate.notes && (
            <CardContent>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{candidate.notes}</p>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Applications ({applicationCount})</CardTitle>
                <CardDescription>
                  Jobs this candidate has applied for
                </CardDescription>
              </div>
              {availableJobs.length > 0 && (
                <AddApplicationDialog 
                  candidateId={candidateId} 
                  companyId={companyId}
                  jobs={availableJobs}
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {applicationCount === 0 ? (
              <p className="text-gray-600">No applications yet</p>
            ) : (
              <div className="space-y-3">
                {candidate.applications?.map((application: ApplicationWithDetails) => (
                  <Link
                    key={application.id}
                    href={`/${companyId}/jobs/${application.jobs.id}`}
                    className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{application.jobs.title}</p>
                        <p className="text-sm text-gray-600">
                          Applied {new Date(application.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{application.stage}</Badge>
                        <Badge variant={application.jobs.status === 'open' ? 'default' : 'secondary'}>
                          {application.jobs.status}
                        </Badge>
                      </div>
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

