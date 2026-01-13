'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Briefcase, Users, FileText, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { signOut } from '@/app/actions/auth'

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
          <form action={signOut} className="mt-auto">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="w-full text-[#64748b] hover:text-[#1a1a1a] hover:bg-[#f8f9fb]"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2">
                Sign Out
              </TooltipContent>
            </Tooltip>
          </form>
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
      <form action={signOut} className="mt-auto">
        <Button
          type="submit"
          variant="ghost"
          className="w-full justify-start text-[#64748b] hover:text-[#1a1a1a] hover:bg-[#f8f9fb]"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </form>
    </nav>
  )
}

