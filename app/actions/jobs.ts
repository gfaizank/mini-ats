'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createJob(companyId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Check if user is member of company
  const { data: membership } = await supabase
    .from('company_members')
    .select('role')
    .eq('company_id', companyId)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    redirect('/')
  }

  // Get company with plan
  const { data: company } = await supabase
    .from('companies')
    .select(`
      id,
      plans (
        max_jobs
      )
    `)
    .eq('id', companyId)
    .single() as { data: { id: string; plans: { max_jobs: number } } | null }

  if (!company) {
    redirect('/')
  }

  // Count active jobs
  const { count } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'open')

  const maxJobs = company.plans?.max_jobs || 0
  if (count !== null && count >= maxJobs) {
    redirect(`/${companyId}/jobs?error=${encodeURIComponent(`You have reached your plan limit of ${maxJobs} open jobs`)}`)
  }

  // Create job
  const { data: job, error } = await supabase
    .from('jobs')
    .insert({
      company_id: companyId,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      department: formData.get('department') as string,
      status: 'open',
    })
    .select()
    .single()

  if (error) {
    redirect(`/${companyId}/jobs/new?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath(`/${companyId}/jobs`)
  redirect(`/${companyId}/jobs/${(job as any).id}`)
}

export async function getJobs(companyId: string, status?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('jobs')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status as any)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getJobById(jobId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      applications (
        id,
        stage,
        candidates (
          id,
          name,
          email
        )
      )
    `)
    .eq('id', jobId)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function updateJob(jobId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('jobs')
    .update({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      department: formData.get('department') as string,
    })
    .eq('id', jobId)

  if (error) {
    return { error: error.message }
  }

  // Get company_id for revalidation
  const { data: job } = await supabase
    .from('jobs')
    .select('company_id')
    .eq('id', jobId)
    .single()

  if (job) {
    revalidatePath(`/${job.company_id}/jobs`)
    revalidatePath(`/${job.company_id}/jobs/${jobId}`)
  }

  return { success: true }
}

export async function closeJob(jobId: string) {
  const supabase = await createClient()

  const { data: job } = await supabase
    .from('jobs')
    .select('company_id')
    .eq('id', jobId)
    .single()

  const { error } = await supabase
    .from('jobs')
    .update({
      status: 'closed',
      closed_at: new Date().toISOString(),
    })
    .eq('id', jobId)

  if (error) {
    console.error('Error closing job:', error.message)
  }

  if (job) {
    revalidatePath(`/${job.company_id}/jobs`)
    revalidatePath(`/${job.company_id}/jobs/${jobId}`)
  }
}

export async function archiveJob(jobId: string) {
  const supabase = await createClient()

  const { data: job } = await supabase
    .from('jobs')
    .select('company_id')
    .eq('id', jobId)
    .single()

  const { error } = await supabase
    .from('jobs')
    .update({
      status: 'archived',
    })
    .eq('id', jobId)

  if (error) {
    console.error('Error archiving job:', error.message)
  }

  if (job) {
    revalidatePath(`/${job.company_id}/jobs`)
    revalidatePath(`/${job.company_id}/jobs/${jobId}`)
  }
}

export async function reopenJob(jobId: string) {
  const supabase = await createClient()

  const { data: job } = await supabase
    .from('jobs')
    .select('company_id')
    .eq('id', jobId)
    .single()

  const { error } = await supabase
    .from('jobs')
    .update({
      status: 'open',
      closed_at: null,
    })
    .eq('id', jobId)

  if (error) {
    console.error('Error reopening job:', error.message)
  }

  if (job) {
    revalidatePath(`/${job.company_id}/jobs`)
    revalidatePath(`/${job.company_id}/jobs/${jobId}`)
  }
}

