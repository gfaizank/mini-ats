import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { signOut } from '@/app/actions/auth'

export default async function Home() {
  const supabase = await createClient()
  const adminClient = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is authenticated, get their companies
  if (user) {
    const { data: memberships } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('user_id', user.id)
      .limit(1)

    // Redirect to first company dashboard
    if (memberships && memberships.length > 0) {
      redirect(`/${memberships[0].company_id}/jobs`)
    }

    // User is authenticated but has no company - check if we need to complete setup
    const companyName = user.user_metadata?.company_name
    const planId = user.user_metadata?.plan_id

    if (companyName && planId) {
      console.log('🔵 Completing company setup for verified user:', user.id)
      
      // Validate plan exists
      const { data: plan } = await supabase
        .from('plans')
        .select('id, name')
        .eq('id', planId)
        .single()

      if (plan) {
        // Create company
        const { data: company, error: companyError } = await adminClient
          .from('companies')
          .insert({
            name: companyName,
            plan_id: planId,
          })
          .select()
          .single()

        if (company && !companyError) {
          // Add user as admin
          const { error: memberError } = await adminClient
            .from('company_members')
            .insert({
              user_id: user.id,
              company_id: company.id,
              role: 'admin',
            })

          if (!memberError) {
            console.log('✅ Company setup completed!')
            redirect(`/${company.id}/jobs`)
          }
        }
      }
    }

    // User is authenticated but has no company and no metadata - show error state
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Account Setup Incomplete
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Your account exists, but no company was created during sign-up.
              This might be due to a technical issue.
            </p>
            <p className="text-md text-gray-500 mb-8">
              Please sign out and try signing up again, or contact support if the issue persists.
            </p>
            <form action={signOut}>
              <Button type="submit" size="lg">
                Sign Out and Try Again
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Mini ATS
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A simple, powerful applicant tracking system for modern teams.
          Manage jobs, track candidates, and streamline your hiring process.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/sign-up">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
