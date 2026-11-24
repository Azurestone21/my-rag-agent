import { useAuthStore } from '@/store/auth'
import { LogOut, Sparkles, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function Header() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    toast.success('已退出登录')
    navigate('/login', { replace: true })
  }

  return (
    <header className="w-full flex justify-between items-center bg-white h-16 p-4">
      <div className="flex items-center gap-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-white">
          <Sparkles className="size-4" />
        </div>
        <span className="truncate text-xl font-semibold tracking-tight text-text-main">
          my-rag-agent
        </span>
      </div>
      <div className="flex items-center">
        <div className="flex items-center gap-2 rounded-md py-1.5">
          <div className="flex size-7 items-center justify-center rounded-full bg-muted">
            <User className="size-3.5 text-text-muted" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-text-main">
              {user?.username ?? '未登录'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-muted transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  )
}
