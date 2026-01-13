'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const companyName = formData.get('companyName') as string || 'My Company'
  const planId = formData.get('planId') as string

  // Check if company name already exists
  console.log('🔵 Step 0: Checking if company name exists...')
  const { data: existingCompany, error: checkError } = await adminClient
    .from('companies')
    .select('id, name')
    .ilike('name', companyName)
    .limit(1)
    .single()

  if (existingCompany && !checkError) {
    console.log('❌ Company name already exists:', companyName)
    return { error: `Company name "${companyName}" is already taken. Please choose a different name.` }
  }

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sign-in?verified=true`,
      data: {
        company_name: companyName,
        plan_id: planId,
      }
    }
  }

  console.log('🔵 Step 1: Creating auth user...')
  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('❌ Auth signup failed:', error)
    return { error: error.message }
  }

  console.log('✅ Step 1: Auth user created:', authData.user?.id)
  
  // If email confirmation is required, return success without creating company yet
  if (authData.user && !authData.user.email_confirmed_at) {
    console.log('📧 Email confirmation required. Company will be created after verification.')
    return { success: true, emailConfirmationRequired: true }
  }

  if (authData.user && authData.user.email_confirmed_at) {
    // Create a default company for the new user
    const companyName = formData.get('companyName') as string || 'My Company'
    const planId = formData.get('planId') as string
    
    console.log('🔵 Step 2: Validating plan...')
    // Validate the selected plan exists
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('id, name')
      .eq('id', planId)
      .single() as { data: { id: string, name: string } | null, error: any }

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
      return { error: 'Invalid plan selected. Please contact support.' }
    }

    console.log('✅ Step 2: Plan validated:', plan.name, plan.id)
    console.log('🔵 Step 3: Creating company...', { companyName, plan_id: planId })

    // Create company using admin client (bypasses RLS since user session isn't fully established yet)
    const { data: company, error: companyError } = await adminClient
      .from('companies')
      .insert({
        name: companyName,
        plan_id: planId,
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
      return { error: `Failed to create company: ${companyError?.message || 'Unknown error'}` }
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
      return { error: `Failed to set up user permissions: ${memberError.message}` }
    }

    console.log('✅ Step 4: User added as admin')
    console.log('🎉 Sign-up completed successfully!')
    
    revalidatePath('/', 'layout')
    redirect('/')
  }

  return { success: true }
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


