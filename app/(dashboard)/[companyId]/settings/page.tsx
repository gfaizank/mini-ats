import { getCompanyById, getCompanyMembers, getUserRole } from '@/app/actions/companies'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TeamMembersCard } from '@/components/company/team-members-card'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface Member {
  id: string
  user_id: string
  role: 'admin' | 'member'
  created_at: string
  email: string
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ companyId: string }>
}) {
  const { companyId } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const companyResult = await getCompanyById(companyId) as { data?: any; error?: string }
  const membersResult = await getCompanyMembers(companyId) as { data?: Member[]; error?: string }
  const { role: userRole } = await getUserRole(companyId)

  if (companyResult.error || !companyResult.data) {
    notFound()
  }

  const company = companyResult.data
  const members: Member[] = membersResult.data || []

  // Get usage stats
  const { count: jobsCount } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'open')

  const { count: candidatesCount } = await supabase
    .from('candidates')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)

  const maxJobs = company.plans?.max_jobs || 0
  const maxCandidates = company.plans?.max_candidates || 0
  const currentJobs = jobsCount || 0
  const currentCandidates = candidatesCount || 0

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1a1a1a]">Settings</h1>
        <p className="text-[#64748b] mt-1">Manage your company settings and team</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Your company details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#475569]">Company Name</label>
              <p className="text-lg">{company.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#475569]">Plan</label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{company.plans?.name}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage & Limits</CardTitle>
            <CardDescription>Track your plan usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-[#475569]">Open Jobs</label>
                <span className="text-sm text-[#64748b]">
                  {currentJobs} / {maxJobs}
                </span>
              </div>
              <Progress value={(currentJobs / maxJobs) * 100} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-[#475569]">Candidates</label>
                <span className="text-sm text-[#64748b]">
                  {currentCandidates} / {maxCandidates}
                </span>
              </div>
              <Progress value={(currentCandidates / maxCandidates) * 100} />
            </div>
          </CardContent>
        </Card>

        <TeamMembersCard 
          members={members} 
          companyId={companyId}
          userRole={userRole || 'member'}
          currentUserId={user?.id || ''}
        />
      </div>
    </div>
  )
}

