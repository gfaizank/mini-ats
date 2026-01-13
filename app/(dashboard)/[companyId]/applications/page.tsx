import { getApplications } from '@/app/actions/applications'
import { getCandidates } from '@/app/actions/candidates'
import { getJobs } from '@/app/actions/jobs'
import { KanbanBoard } from '@/components/applications/kanban-board'
import { AddApplicationButton } from '@/components/applications/add-application-button'

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ companyId: string }>
}) {
  const { companyId } = await params
  
  // Fetch all data needed for the page
  const [applicationsResult, candidatesResult, jobsResult] = await Promise.all([
    getApplications(companyId),
    getCandidates(companyId),
    getJobs(companyId)
  ])

  if (applicationsResult.error) {
    return <div>Error loading applications: {applicationsResult.error}</div>
  }

  const applications = (applicationsResult.data || []) as any[]
  const candidates = (candidatesResult.data || []) as any[]
  const jobs = (jobsResult.data || []) as any[]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">Applications</h1>
          <p className="text-[#64748b] mt-1">Track candidates through your hiring pipeline</p>
        </div>
        <AddApplicationButton candidates={candidates} jobs={jobs} />
      </div>

      {!applications || applications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#64748b]">No applications yet</p>
          <p className="text-sm text-[#94a3b8] mt-2">
            Applications will appear here when candidates apply to your jobs
          </p>
        </div>
      ) : (
        <KanbanBoard applications={applications} companyId={companyId} />
      )}
    </div>
  )
}

