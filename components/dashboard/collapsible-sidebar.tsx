'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DashboardNav } from './nav'

interface CollapsibleSidebarProps {
  companyId: string
}

export function CollapsibleSidebar({ companyId }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed')
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true')
    }
  }, [])

  // Save collapsed state to localStorage
  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
  }

  return (
    <>
      <aside
        className={cn(
          'border-r border-[#e8ebed] bg-[#fafbfc] min-h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out relative',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className={cn('p-4', isCollapsed && 'px-2')}>
          <DashboardNav companyId={companyId} isCollapsed={isCollapsed} />
        </div>
        
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            'absolute -right-3 top-6 h-6 w-6 rounded-full border border-[#e8ebed] bg-white shadow-sm hover:bg-[#f8f9fb] z-10',
            'transition-transform duration-300'
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </aside>
    </>
  )
}

