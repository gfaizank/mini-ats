'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCandidate(companyId: string, formData: FormData) {
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
        max_candidates
      )
    `)
    .eq('id', companyId)
    .single() as { data: { id: string; plans: { max_candidates: number } } | null }

  if (!company) {
    redirect('/')
  }

  // Count candidates
  const { count } = await supabase
    .from('candidates')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)

  const maxCandidates = company.plans?.max_candidates || 0
  if (count !== null && count >= maxCandidates) {
    redirect(`/${companyId}/candidates?error=${encodeURIComponent(`You have reached your plan limit of ${maxCandidates} candidates`)}`)
  }

  // Create candidate
  const { data: candidate, error } = await supabase
    .from('candidates')
    .insert({
      company_id: companyId,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || null,
      linkedin_url: formData.get('linkedin_url') as string || null,
      notes: formData.get('notes') as string || null,
      resume_url: formData.get('resume_url') as string || null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      redirect(`/${companyId}/candidates/new?error=${encodeURIComponent('A candidate with this email already exists in your company')}`)
    }
    redirect(`/${companyId}/candidates/new?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath(`/${companyId}/candidates`)
  redirect(`/${companyId}/candidates/${(candidate as any).id}`)
}

export async function getCandidates(companyId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('candidates')
    .select(`
      *,
      applications (
        id,
        stage,
        jobs (
          id,
          title
        )
      )
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getCandidateById(candidateId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('candidates')
    .select(`
      *,
      applications (
        id,
        stage,
        created_at,
        updated_at,
        jobs (
          id,
          title,
          status
        )
      )
    `)
    .eq('id', candidateId)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function updateCandidate(candidateId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('candidates')
    .update({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || null,
      linkedin_url: formData.get('linkedin_url') as string || null,
      notes: formData.get('notes') as string || null,
    })
    .eq('id', candidateId)

  if (error) {
    return { error: error.message }
  }

  // Get company_id for revalidation
  const { data: candidate } = await supabase
    .from('candidates')
    .select('company_id')
    .eq('id', candidateId)
    .single()

  if (candidate) {
    revalidatePath(`/${candidate.company_id}/candidates`)
    revalidatePath(`/${candidate.company_id}/candidates/${candidateId}`)
  }

  return { success: true }
}

export async function updateCandidateResume(candidateId: string, resumeUrl: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('candidates')
    .update({ resume_url: resumeUrl })
    .eq('id', candidateId)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

