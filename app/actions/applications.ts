'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createApplication(candidateId: string, jobId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if application already exists
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('candidate_id', candidateId)
    .eq('job_id', jobId)
    .single()

  if (existing) {
    return { error: 'Candidate has already applied to this job' }
  }

  const { data: application, error } = await supabase
    .from('applications')
    .insert({
      candidate_id: candidateId,
      job_id: jobId,
      stage: 'applied',
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Get company_id for revalidation
  const { data: job } = await supabase
    .from('jobs')
    .select('company_id')
    .eq('id', jobId)
    .single() as { data: { company_id: string } | null }

  if (job) {
    revalidatePath(`/${job.company_id}/applications`)
    revalidatePath(`/${job.company_id}/jobs/${jobId}`)
    revalidatePath(`/${job.company_id}/candidates/${candidateId}`)
  }

  return { success: true, data: application }
}

export async function getApplications(companyId: string, filters?: { jobId?: string; stage?: string }) {
  const supabase = await createClient()
  
  let query = supabase
    .from('applications')
    .select(`
      *,
      candidates (
        id,
        name,
        email,
        phone,
        resume_url
      ),
      jobs (
        id,
        title,
        company_id
      )
    `)
    .eq('jobs.company_id', companyId)
    .order('created_at', { ascending: false })

  if (filters?.jobId) {
    query = query.eq('job_id', filters.jobId)
  }

  if (filters?.stage && filters.stage !== 'all') {
    query = query.eq('stage', filters.stage as any)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  // Filter by company_id since we can't directly filter in the query due to nested relation
  const filteredData = data?.filter((app: { jobs: { company_id: string } | null }) => app.jobs?.company_id === companyId) || []

  return { data: filteredData }
}

export async function getApplicationsByJob(jobId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      candidates (
        id,
        name,
        email,
        phone,
        resume_url
      )
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getApplicationsByCandidate(candidateId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      jobs (
        id,
        title,
        status,
        company_id
      )
    `)
    .eq('candidate_id', candidateId)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

import { Database } from '@/types/supabase-generated'

type ApplicationStage = Database['public']['Enums']['application_stage']

export async function updateApplicationStage(applicationId: string, newStage: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('applications')
    .update({
      stage: newStage as ApplicationStage,
    })
    .eq('id', applicationId)

  if (error) {
    return { error: error.message }
  }

  // Get company_id for revalidation
  const { data: application } = await supabase
    .from('applications')
    .select(`
      job_id,
      candidate_id,
      jobs (
        company_id
      )
    `)
    .eq('id', applicationId)
    .single() as { data: { job_id: string; candidate_id: string; jobs: { company_id: string } } | null }

  if (application) {
    const companyId = (application.jobs as { company_id: string }).company_id
    revalidatePath(`/${companyId}/applications`)
    revalidatePath(`/${companyId}/jobs/${application.job_id}`)
    revalidatePath(`/${companyId}/candidates/${application.candidate_id}`)
  }

  return { success: true }
}

export async function getApplicationById(applicationId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      candidates (
        id,
        name,
        email,
        phone,
        resume_url
      ),
      jobs (
        id,
        title,
        company_id
      )
    `)
    .eq('id', applicationId)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

