import { CandidateForm } from '@/components/candidates/candidate-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewCandidatePage({
  params,
}: {
  params: Promise<{ companyId: string }>
}) {
  const { companyId } = await params

  return (
    <div className="max-w-2xl">
      <Link
        href={`/${companyId}/candidates`}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Candidates
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Add New Candidate</CardTitle>
          <CardDescription>
            Add a candidate to your talent pool
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CandidateForm companyId={companyId} />
        </CardContent>
      </Card>
    </div>
  )
}

