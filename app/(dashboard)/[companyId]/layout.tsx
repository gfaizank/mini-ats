import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CompanySwitcher } from '@/components/company/company-switcher'
import { CollapsibleSidebar } from '@/components/dashboard/collapsible-sidebar'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ companyId: string }>
}) {
  const { companyId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Verify user has access to this company
  const { data: membership } = await supabase
    .from('company_members')
    .select('role')
    .eq('company_id', companyId)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    redirect('/')
  }

  // Get all companies user belongs to
  const { data: companies } = await supabase
    .from('company_members')
    .select('companies(id, name)')
    .eq('user_id', user.id) as { data: Array<{ companies: { id: string; name: string } | null }> | null }

  const companyList = companies?.map(c => c.companies).filter(Boolean) as Array<{ id: string; name: string }> || []

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <header className="border-b border-[#e8ebed] bg-white">
        <div className="flex h-16 items-center px-6">
          <CompanySwitcher companies={companyList} currentCompanyId={companyId} />
        </div>
      </header>
      <div className="flex">
        <CollapsibleSidebar companyId={companyId} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

