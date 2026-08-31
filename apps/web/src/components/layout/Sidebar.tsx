import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Search,
  Sparkles,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useKnowledgeBaseStore } from '@/store/knowledgeBase'

const knowledgeBaseNavItems = [
  { to: '/documents', label: '文档管理', icon: FileText },
  { to: '/chunks', label: '切片管理', icon: Layers },
  { to: '/search', label: '知识检索', icon: Search },
  { to: '/qa', label: '知识问答', icon: MessageSquare },
]

type SidebarProps = {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const knowledgeBases = useKnowledgeBaseStore((state) => state.knowledgeBases)
  const selectedKbId = useKnowledgeBaseStore((state) => state.selectedKbId)
  const selectKb = useKnowledgeBaseStore((state) => state.selectKb)

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col border-r border-border-subtle bg-panel transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div
        className={cn(
          'flex h-14 items-center',
          collapsed ? 'justify-center px-2' : 'gap-2.5 px-4',
        )}
      >
        {!collapsed && (
          <>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-white">
              <Sparkles className="size-4" />
            </div>
            <span className="truncate text-sm font-semibold tracking-tight text-text-main">
              my-rag-agent
            </span>
          </>
        )}
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

      <div className="mt-2 flex-1 space-y-1 overflow-y-auto px-3">
        <NavLink
          to="/knowledge-base"
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
          <LayoutDashboard className="size-4" />
          {!collapsed && <span>知识库</span>}
        </NavLink>

        {!collapsed && (
          <div className="space-y-1.5 py-1">
            <div className="px-3 text-xs text-text-muted">当前知识库</div>
            <Select
              value={selectedKbId}
              onValueChange={(value) => selectKb(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择知识库" />
              </SelectTrigger>
              <SelectContent>
                {knowledgeBases.map((kb) => (
                  <SelectItem key={kb.id} value={kb.id}>
                    {kb.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {!collapsed && selectedKbId && (
          <>
            <div className="my-1 h-px bg-border-subtle" />
            {knowledgeBaseNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md py-2 pl-8 pr-3 text-[13px] font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-text-secondary hover:bg-muted hover:text-text-main',
                  )
                }
              >
                <item.icon className="size-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </div>
    </aside>
  )
}
