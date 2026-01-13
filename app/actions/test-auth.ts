'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

/**
 * TEST VERSION OF SIGNUP - Simulates failure scenarios
 * This is for testing the bug fix only. Delete this file after testing.
 */

export async function signUpWithFailure(formData: FormData, failurePoint: string) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect(`/sign-up?error=${encodeURIComponent(error.message)}`)
  }

  if (authData.user) {
    const companyName = formData.get('companyName') as string || 'My Company'
    
    // SIMULATE FAILURE AT PLAN LOOKUP
    if (failurePoint === 'plan') {
      console.log('🔴 TEST: Simulating plan lookup failure')
      // Pretend plan lookup failed
      await supabase.auth.admin.deleteUser(authData.user.id)
      redirect(`/sign-up?error=${encodeURIComponent('[TEST] Failed to find Free plan. Please contact support.')}`)
    }

    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('id')
      .eq('name', 'Free')
      .single() as { data: { id: string } | null, error: any }

    if (planError || !plan) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      redirect(`/sign-up?error=${encodeURIComponent('Failed to find Free plan. Please contact support.')}`)
    }

    // SIMULATE FAILURE AT COMPANY CREATION
    if (failurePoint === 'company') {
      console.log('🔴 TEST: Simulating company creation failure')
      await supabase.auth.admin.deleteUser(authData.user.id)
      redirect(`/sign-up?error=${encodeURIComponent('[TEST] Failed to create company. Please try again.')}`)
    }

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: companyName,
        plan_id: plan.id,
      })
      .select()
      .single()

    if (companyError || !company) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      redirect(`/sign-up?error=${encodeURIComponent('Failed to create company. Please try again.')}`)
    }

    // SIMULATE FAILURE AT MEMBER INSERTION
    if (failurePoint === 'member') {
      console.log('🔴 TEST: Simulating member insertion failure')
      await supabase.auth.admin.deleteUser(authData.user.id)
      await supabase.from('companies').delete().eq('id', company.id)
      redirect(`/sign-up?error=${encodeURIComponent('[TEST] Failed to set up user permissions. Please try again.')}`)
    }

    const { error: memberError } = await supabase
      .from('company_members')
      .insert({
        user_id: authData.user.id,
        company_id: company.id,
        role: 'admin',
      })

    if (memberError) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      await supabase.from('companies').delete().eq('id', company.id)
      redirect(`/sign-up?error=${encodeURIComponent('Failed to set up user permissions. Please try again.')}`)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

/**
 * Helper to check if a user exists (for verification)
 */
export async function checkUserExists(email: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  return {
    exists: !!user,
    email: user?.email,
  }
}

