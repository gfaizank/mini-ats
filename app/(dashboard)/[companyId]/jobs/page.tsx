import { getJobs } from '@/app/actions/jobs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Briefcase, MapPin, Building } from 'lucide-react'

export default async function JobsPage({
  params,
}: {
  params: Promise<{ companyId: string }>
}) {
  const { companyId } = await params
  const result = await getJobs(companyId) as { data?: any[]; error?: string }

  if (result.error) {
    return <div>Error loading jobs: {result.error}</div>
  }

  const jobs = result.data || []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">Jobs</h1>
          <p className="text-[#64748b] mt-1">Manage your job openings</p>
        </div>
        <Button asChild>
          <Link href={`/${companyId}/jobs/new`}>Create Job</Link>
        </Button>
      </div>

      {!jobs || jobs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No jobs yet</CardTitle>
            <CardDescription>
              Create your first job opening to start tracking candidates
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Link key={job.id} href={`/${companyId}/jobs/${job.id}`} className="cursor-pointer">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                          <Briefcase className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-[#64748b]">
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
                          </div>
                        </div>
                      </div>
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
                </CardHeader>
                {job.description && (
                  <CardContent>
                    <p className="text-[#64748b] line-clamp-2">{job.description}</p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

