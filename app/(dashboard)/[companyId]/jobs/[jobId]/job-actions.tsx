'use client'

import { Button } from '@/components/ui/button'
import { useTransition } from 'react'
import { Loader2 } from 'lucide-react'

interface JobActionsProps {
  jobId: string
  status: string
  closeJob: (jobId: string) => Promise<void>
  reopenJob: (jobId: string) => Promise<void>
  archiveJob: (jobId: string) => Promise<void>
}

export default function JobActions({ jobId, status, closeJob, reopenJob, archiveJob }: JobActionsProps) {
  const [isPending, startTransition] = useTransition()

  const handleCloseJob = () => {
    startTransition(async () => {
      await closeJob(jobId)
    })
  }

  const handleReopenJob = () => {
    startTransition(async () => {
      await reopenJob(jobId)
    })
  }

  const handleArchiveJob = () => {
    startTransition(async () => {
      await archiveJob(jobId)
    })
  }

  return (
    <div className="flex gap-2">
      {status === 'open' && (
        <Button onClick={handleCloseJob} variant="outline" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Closing...
            </>
          ) : (
            'Close Job'
          )}
        </Button>
      )}
      {status === 'closed' && (
        <>
          <Button onClick={handleReopenJob} variant="outline" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reopening...
              </>
            ) : (
              'Reopen Job'
            )}
          </Button>
          <Button onClick={handleArchiveJob} variant="outline" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Archiving...
              </>
            ) : (
              'Archive'
            )}
          </Button>
        </>
      )}
    </div>
  )
}

