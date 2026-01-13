'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { createApplication } from '@/app/actions/applications'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Candidate {
  id: string
  name: string
  email: string
}

interface Job {
  id: string
  title: string
}

interface AddApplicationButtonProps {
  candidates: Candidate[]
  jobs: Job[]
}

export function AddApplicationButton({ candidates, jobs }: AddApplicationButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('')
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!selectedCandidateId || !selectedJobId) return

    setLoading(true)
    const result = await createApplication(selectedCandidateId, selectedJobId)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Application created successfully')
      setOpen(false)
      setSelectedCandidateId('')
      setSelectedJobId('')
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Application
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Application</DialogTitle>
          <DialogDescription>
            Link a candidate to a job to track their application
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="candidate">Candidate</Label>
            <Select value={selectedCandidateId} onValueChange={setSelectedCandidateId}>
              <SelectTrigger id="candidate">
                <SelectValue placeholder="Select a candidate" />
              </SelectTrigger>
              <SelectContent>
                {candidates.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-gray-500">
                    No candidates found. Create a candidate first.
                  </div>
                ) : (
                  candidates.map((candidate) => (
                    <SelectItem key={candidate.id} value={candidate.id}>
                      {candidate.name} ({candidate.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="job">Job</Label>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger id="job">
                <SelectValue placeholder="Select a job" />
              </SelectTrigger>
              <SelectContent>
                {jobs.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-gray-500">
                    No jobs found. Create a job first.
                  </div>
                ) : (
                  jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedCandidateId || !selectedJobId}>
              {loading ? 'Adding...' : 'Add Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

