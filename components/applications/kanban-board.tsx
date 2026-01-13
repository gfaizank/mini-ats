'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateApplicationStage } from '@/app/actions/applications'
import { User, Mail } from 'lucide-react'
import Link from 'next/link'
import type { ApplicationStage } from '@/types/database.types'

interface Application {
  id: string
  stage: ApplicationStage
  created_at: string
  candidates: {
    id: string
    name: string
    email: string
  }
  jobs: {
    id: string
    title: string
  }
}

interface KanbanBoardProps {
  applications: Application[]
  companyId: string
}

const stages: { value: ApplicationStage; label: string; color: string }[] = [
  { value: 'applied', label: 'Applied', color: 'bg-blue-50 text-blue-700' },
  { value: 'screening', label: 'Screening', color: 'bg-amber-50 text-amber-700' },
  { value: 'interview', label: 'Interview', color: 'bg-purple-50 text-purple-700' },
  { value: 'offer', label: 'Offer', color: 'bg-green-50 text-green-700' },
  { value: 'hired', label: 'Hired', color: 'bg-emerald-50 text-emerald-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-50 text-red-700' },
]

export function KanbanBoard({ applications, companyId }: KanbanBoardProps) {
  const [optimisticApplications, setOptimisticApplications] = useState(applications)

  async function handleStageChange(applicationId: string, newStage: string) {
    // Optimistic update
    setOptimisticApplications(prev =>
      prev.map(app =>
        app.id === applicationId ? { ...app, stage: newStage as ApplicationStage } : app
      )
    )

    // Server update
    const result = await updateApplicationStage(applicationId, newStage)
    
    if (result.error) {
      // Revert on error
      setOptimisticApplications(applications)
      alert(result.error)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stages.map((stage) => {
        const stageApplications = optimisticApplications.filter(app => app.stage === stage.value)
        
        return (
          <Card key={stage.value} className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>{stage.label}</span>
                <Badge variant="secondary" className="ml-2">
                  {stageApplications.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-2">
              {stageApplications.map((application) => (
                <Card key={application.id} className="p-3 hover:shadow-md transition-shadow bg-white">
                  <div className="space-y-2">
                    <Link
                      href={`/${companyId}/candidates/${application.candidates.id}`}
                      className="block"
                    >
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-[#64748b] mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-[#1a1a1a]">
                            {application.candidates.name}
                          </p>
                          <p className="text-xs text-[#64748b] truncate flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {application.candidates.email}
                          </p>
                        </div>
                      </div>
                    </Link>
                    <Link
                      href={`/${companyId}/jobs/${application.jobs.id}`}
                      className="block"
                    >
                      <p className="text-xs text-[#64748b] truncate">
                        {application.jobs.title}
                      </p>
                    </Link>
                    <Select
                      value={application.stage}
                      onValueChange={(value) => handleStageChange(application.id, value)}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map((s) => (
                          <SelectItem key={s.value} value={s.value} className="text-xs">
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              ))}
              {stageApplications.length === 0 && (
                <p className="text-xs text-[#94a3b8] text-center py-4">No applications</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

