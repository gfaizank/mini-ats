'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCompany(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name') as string

  // Get the Free plan
  const { data: plan } = await supabase
    .from('plans')
    .select('id')
    .eq('name', 'Free')
    .single()

  if (!plan) {
    return { error: 'Default plan not found' }
  }

  // Create company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({
      name,
      plan_id: plan.id,
    })
    .select()
    .single()

  if (companyError) {
    return { error: companyError.message }
  }

  // Add user as admin
  const { error: memberError } = await supabase
    .from('company_members')
    .insert({
      user_id: user.id,
      company_id: company.id,
      role: 'admin',
    })

  if (memberError) {
    return { error: memberError.message }
  }

  revalidatePath('/')
  return { success: true, company }
}

export async function getCompanies() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('company_members')
    .select(`
      role,
      companies (
        id,
        name,
        created_at,
        plans (
          name,
          max_jobs,
          max_candidates
        )
      )
    `)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getCompanyById(companyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      plans (
        name,
        max_jobs,
        max_candidates
      )
    `)
    .eq('id', companyId)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getCompanyMembers(companyId: string) {
  const supabase = await createClient()

  console.log('🔵 [GET MEMBERS] Fetching company members with emails...', { companyId })

  const { data, error } = await supabase
    .rpc('get_company_members_with_emails' as any, { company_uuid: companyId }) as {
      data: Array<{
        id: string
        user_id: string
        role: 'admin' | 'member'
        created_at: string
        email: string
      }> | null
      error: any
    }

  if (error) {
    console.error('❌ [GET MEMBERS] Failed to fetch members:', error)
    return { error: error.message }
  }

  console.log('✅ [GET MEMBERS] Found members:', data?.length || 0)

  return { data }
}

export async function inviteMember(companyId: string, email: string, role: 'admin' | 'member') {
  const supabase = await createClient()
  const adminClient = createAdminClient()
  
  console.log('🔵 [INVITE MEMBER] Step 1: Getting current user...')
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('❌ [INVITE MEMBER] Not authenticated')
    return { error: 'Not authenticated' }
  }

  console.log('✅ [INVITE MEMBER] Step 1: Current user:', user.id)
  console.log('🔵 [INVITE MEMBER] Step 2: Checking if current user is admin...', { companyId, userId: user.id })

  // Check if current user is admin
  const { data: membership } = await supabase
    .from('company_members')
    .select('role')
    .eq('company_id', companyId)
    .eq('user_id', user.id)
    .single()

  if (membership?.role !== 'admin') {
    console.error('❌ [INVITE MEMBER] User is not admin:', membership?.role)
    return { error: 'Only admins can invite members' }
  }

  console.log('✅ [INVITE MEMBER] Step 2: User is admin')
  console.log('🔵 [INVITE MEMBER] Step 3: Looking up user by email...', { email })

  // Look up user by email in auth.users
  const { data: authUsers, error: lookupError } = await supabase
    .rpc('get_user_id_by_email' as any, { user_email: email }) as { data: string | null, error: any }

  let targetUserId: string

  if (lookupError) {
    console.error('❌ [INVITE MEMBER] RPC lookup failed:', lookupError)
    return { error: `Database error: ${lookupError.message}. Did you run the migration?` }
  }

  if (!authUsers) {
    console.log('⚠️ [INVITE MEMBER] User not found, creating new user and sending invite email...')
    
    // Get the base URL for the app
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    
    // Invite user using admin client - this sends an invitation email automatically
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        invited_by: user.id,
        invited_to_company: companyId,
      },
      redirectTo: `${baseUrl}/accept-invite`
    })

    if (inviteError || !inviteData.user) {
      console.error('❌ [INVITE MEMBER] Failed to invite user:', inviteError)
      return { error: `Failed to send invitation: ${inviteError?.message || 'Unknown error'}` }
    }

    targetUserId = inviteData.user.id
    console.log('✅ [INVITE MEMBER] Step 3: User invited and invitation email sent:', { 
      email, 
      userId: targetUserId,
      redirectUrl: `${baseUrl}/accept-invite`
    })
  } else {
    targetUserId = authUsers
    console.log('✅ [INVITE MEMBER] Step 3: Existing user found:', { email, userId: targetUserId })
  }

  console.log('🔵 [INVITE MEMBER] Step 4: Checking if user is already a member...', { companyId, targetUserId })

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('company_members')
    .select('id')
    .eq('company_id', companyId)
    .eq('user_id', targetUserId)
    .single()

  if (existingMember) {
    console.error('❌ [INVITE MEMBER] User is already a member:', existingMember)
    return { error: 'User is already a member of this company' }
  }

  console.log('✅ [INVITE MEMBER] Step 4: User is not a member yet')
  console.log('🔵 [INVITE MEMBER] Step 5: Adding user to company...', { 
    user_id: targetUserId, 
    company_id: companyId, 
    role 
  })

  // Add user to company using admin client (bypasses RLS)
  const { error: insertError } = await adminClient
    .from('company_members')
    .insert({
      user_id: targetUserId,
      company_id: companyId,
      role: role,
    })

  if (insertError) {
    console.error('❌ [INVITE MEMBER] Failed to insert member:', insertError)
    return { error: insertError.message }
  }

  console.log('✅ [INVITE MEMBER] Step 5: Member added successfully')
  console.log('🎉 [INVITE MEMBER] Invite completed successfully!')

  revalidatePath(`/${companyId}/settings`)
  return { success: true }
}

export async function updateMemberRole(companyId: string, memberId: string, role: 'admin' | 'member') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if current user is admin
  const { data: membership } = await supabase
    .from('company_members')
    .select('role')
    .eq('company_id', companyId)
    .eq('user_id', user.id)
    .single()

  if (membership?.role !== 'admin') {
    return { error: 'Only admins can update member roles' }
  }

  const { error } = await supabase
    .from('company_members')
    .update({ role })
    .eq('id', memberId)
    .eq('company_id', companyId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/${companyId}/settings`)
  return { success: true }
}

export async function removeMember(companyId: string, memberId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if current user is admin
  const { data: membership } = await supabase
    .from('company_members')
    .select('role')
    .eq('company_id', companyId)
    .eq('user_id', user.id)
    .single()

  if (membership?.role !== 'admin') {
    return { error: 'Only admins can remove members' }
  }

  const { error } = await supabase
    .from('company_members')
    .delete()
    .eq('id', memberId)
    .eq('company_id', companyId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/${companyId}/settings`)
  return { success: true }
}

export async function getUserRole(companyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('company_members')
    .select('role')
    .eq('company_id', companyId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { role: data.role }
}

