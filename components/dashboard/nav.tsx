'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Briefcase, Users, FileText, Settings, LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { signOut } from '@/app/actions/auth'
import { useTransition } from 'react'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface DashboardNavProps {
  companyId: string
  isCollapsed?: boolean
}

export function DashboardNav({ companyId, isCollapsed = false }: DashboardNavProps) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const handleSignOut = async () => {
    startTransition(async () => {
      await signOut()
    })
  }

  const navItems: NavItem[] = [
    {
      title: 'Jobs',
      href: `/${companyId}/jobs`,
      icon: Briefcase,
    },
    {
      title: 'Candidates',
      href: `/${companyId}/candidates`,
      icon: Users,
    },
    {
      title: 'Applications',
      href: `/${companyId}/applications`,
      icon: FileText,
    },
    {
      title: 'Settings',
      href: `/${companyId}/settings`,
      icon: Settings,
    },
  ]

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname?.startsWith(item.href)
            
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center justify-center rounded-lg p-2 text-sm transition-colors',
                      isActive
                        ? 'bg-[#f1f5f9] text-[#1a1a1a] font-medium'
                        : 'text-[#64748b] hover:bg-[#f8f9fb] hover:text-[#1a1a1a]'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            )
          })}
          <div className="mt-auto">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="icon"
                  className="w-full text-[#64748b] hover:text-[#1a1a1a] hover:bg-[#f8f9fb]"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <LogOut className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2">
                {isPending ? 'Signing out...' : 'Sign Out'}
              </TooltipContent>
            </Tooltip>
          </div>
        </nav>
      </TooltipProvider>
    )
  }

  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname?.startsWith(item.href)
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-[#f1f5f9] text-[#1a1a1a] font-medium'
                : 'text-[#64748b] hover:bg-[#f8f9fb] hover:text-[#1a1a1a]'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
      <Button
        onClick={handleSignOut}
        variant="ghost"
        className="mt-auto w-full justify-start text-[#64748b] hover:text-[#1a1a1a] hover:bg-[#f8f9fb]"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-3 h-4 w-4 animate-spin" />
            Signing out...
          </>
        ) : (
          <>
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </>
        )}
      </Button>
    </nav>
  )
}

