import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { menuItems } from '@/router/menu'

type SidebarProps = {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col  bg-panel transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="mt-2 flex-1 space-y-1 overflow-y-auto px-2">
        {menuItems.map((item) => (
          <NavLink
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-md py-2 text-sm font-medium transition-colors',
                collapsed ? 'justify-center px-0' : 'gap-3 px-3',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-text-secondary hover:bg-muted hover:text-text-main',
              )
            }
          >
            <item.icon className="size-6" />
            {!collapsed && <span className="text-lg">{item.label}</span>}
          </NavLink>
        ))}
      </div>

      <div
        className={cn(
          'border-t border-border-subtle px-2 py-2',
          collapsed ? 'flex flex-col items-center gap-1' : 'space-y-1.5',
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-muted hover:text-text-main',
            !collapsed && 'ml-auto',
          )}
          aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>
      </div>
    </aside>
  )
}
