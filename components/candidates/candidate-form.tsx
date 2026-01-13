'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload } from 'lucide-react'
import { createCandidate } from '@/app/actions/candidates'

export function CandidateForm({ companyId }: { companyId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleSubmit(formData: FormData) {
    let resumeKey = null

    // If file selected, upload it first
    if (file) {
      setUploading(true)
      try {
        // First create a temporary candidate ID
        const tempId = crypto.randomUUID()
        
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)
        uploadFormData.append('companyId', companyId)
        uploadFormData.append('candidateId', tempId)

        const response = await fetch('/api/upload-resume', {
          method: 'POST',
          body: uploadFormData,
        })

        if (!response.ok) {
          throw new Error('Failed to upload resume')
        }

        const { key } = await response.json()
        resumeKey = key
      } catch (error) {
        console.error('Upload error:', error)
        alert('Failed to upload resume')
        setUploading(false)
        return
      }
      setUploading(false)
    }

    // Add resume URL to form data
    if (resumeKey) {
      formData.append('resume_url', resumeKey)
    }

    // Submit form
    await createCandidate(companyId, formData)
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          name="name"
          placeholder="John Doe"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="john@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkedin_url">LinkedIn URL</Label>
        <Input
          id="linkedin_url"
          name="linkedin_url"
          type="url"
          placeholder="https://linkedin.com/in/johndoe"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="resume">Resume (PDF, DOC, DOCX)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="resume"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="cursor-pointer"
          />
          {file && (
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Upload className="h-4 w-4" />
              {file.name}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any additional notes about the candidate..."
          rows={4}
        />
      </div>

      <Button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Add Candidate'}
      </Button>
    </form>
  )
}

