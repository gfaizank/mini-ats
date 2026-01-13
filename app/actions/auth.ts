'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  console.log('🔵 Step 1: Creating auth user...')
  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('❌ Auth signup failed:', error)
    redirect(`/sign-up?error=${encodeURIComponent(error.message)}`)
  }

  console.log('✅ Step 1: Auth user created:', authData.user?.id)

  if (authData.user) {
    // Create a default company for the new user
    const companyName = formData.get('companyName') as string || 'My Company'
    
    console.log('🔵 Step 2: Looking for Free plan...')
    // Get the Free plan ID
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('id')
      .eq('name', 'Free')
      .single() as { data: { id: string } | null, error: any }

    if (planError || !plan) {
      console.error('❌ Plan lookup failed:', planError)
      console.log('🧹 Cleaning up: Deleting auth user...')
      // Clean up: delete the auth user since we can't complete setup
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(authData.user.id)
      if (deleteError) {
        console.error('❌ Failed to delete user:', deleteError)
      } else {
        console.log('✅ Auth user deleted')
      }
      redirect(`/sign-up?error=${encodeURIComponent('Failed to find Free plan. Please contact support.')}`)
    }

    console.log('✅ Step 2: Free plan found:', plan.id)
    console.log('🔵 Step 3: Creating company...', { companyName, plan_id: plan.id })

    // Create company using admin client (bypasses RLS since user session isn't fully established yet)
    const { data: company, error: companyError } = await adminClient
      .from('companies')
      .insert({
        name: companyName,
        plan_id: plan.id,
      })
      .select()
      .single()

    if (companyError || !company) {
      console.error('❌ Company creation failed:', companyError)
      console.log('🧹 Cleaning up: Deleting auth user...')
      // Clean up: delete the auth user since we can't complete setup
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(authData.user.id)
      if (deleteError) {
        console.error('❌ Failed to delete user:', deleteError)
      } else {
        console.log('✅ Auth user deleted')
      }
      redirect(`/sign-up?error=${encodeURIComponent(`Failed to create company: ${companyError?.message || 'Unknown error'}`)}`)
    }

    console.log('✅ Step 3: Company created:', company.id)
    console.log('🔵 Step 4: Adding user as admin...', { user_id: authData.user.id, company_id: company.id })

    // Add user as admin of the company using admin client (bypasses RLS)
    const { error: memberError } = await adminClient
      .from('company_members')
      .insert({
        user_id: authData.user.id,
        company_id: company.id,
        role: 'admin',
      })

    if (memberError) {
      console.error('❌ Member insertion failed:', memberError)
      console.log('🧹 Cleaning up: Deleting auth user and company...')
      // Clean up: delete the auth user and company since we can't complete setup
      await adminClient.auth.admin.deleteUser(authData.user.id)
      await adminClient.from('companies').delete().eq('id', company.id)
      redirect(`/sign-up?error=${encodeURIComponent(`Failed to set up user permissions: ${memberError.message}`)}`)
    }

    console.log('✅ Step 4: User added as admin')
    console.log('🎉 Sign-up completed successfully!')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect(`/sign-in?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/sign-in')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}


