import { createJob } from '@/app/actions/jobs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import JobForm from './job-form'

export default async function NewJobPage({
  params,
}: {
  params: Promise<{ companyId: string }>
}) {
  const { companyId } = await params

  return (
    <div className="max-w-2xl">
      <Link
        href={`/${companyId}/jobs`}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Job</CardTitle>
          <CardDescription>
            Add a new job opening to start receiving applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobForm companyId={companyId} createJob={createJob} />
        </CardContent>
      </Card>
    </div>
  )
}

