import { getCandidates } from '@/app/actions/candidates'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { User, Mail, Phone, FileText } from 'lucide-react'

export default async function CandidatesPage({
  params,
}: {
  params: Promise<{ companyId: string }>
}) {
  const { companyId } = await params
  const result = await getCandidates(companyId) as { data?: any[]; error?: string }

  if (result.error) {
    return <div>Error loading candidates: {result.error}</div>
  }

  const candidates = result.data || []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">Candidates</h1>
          <p className="text-[#64748b] mt-1">Manage your candidate pool</p>
        </div>
        <Button asChild>
          <Link href={`/${companyId}/candidates/new`}>Add Candidate</Link>
        </Button>
      </div>

      {!candidates || candidates.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No candidates yet</CardTitle>
            <CardDescription>
              Add candidates to start tracking their applications
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {candidates.map((candidate) => {
            const applicationCount = candidate.applications?.length || 0
            
            return (
              <Link key={candidate.id} href={`/${companyId}/candidates/${candidate.id}`} className="cursor-pointer">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                          <User className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{candidate.name}</CardTitle>
                          <div className="flex flex-col gap-1 mt-2 text-sm text-[#64748b]">
                            <span className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {candidate.email}
                            </span>
                            {candidate.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {candidate.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {candidate.resume_url && (
                          <Badge variant="outline">
                            <FileText className="h-3 w-3 mr-1" />
                            Resume
                          </Badge>
                        )}
                        <Badge variant="secondary">
                          {applicationCount} {applicationCount === 1 ? 'application' : 'applications'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

