'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { useTransition } from 'react'
import { Loader2 } from 'lucide-react'

interface JobFormProps {
  companyId: string
  createJob: (companyId: string, formData: FormData) => Promise<void>
}

export default function JobForm({ companyId, createJob }: JobFormProps) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      await createJob(companyId, formData)
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Job Title *</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Senior Software Engineer"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          placeholder="e.g. San Francisco, CA or Remote"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          name="department"
          placeholder="e.g. Engineering"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Job Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe the role, responsibilities, and requirements..."
          rows={8}
          disabled={isPending}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Job'
          )}
        </Button>
        <Button type="button" variant="outline" asChild disabled={isPending}>
          <Link href={`/${companyId}/jobs`}>Cancel</Link>
        </Button>
      </div>
    </form>
  )
}

