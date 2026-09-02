import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import { Toaster } from '@/components/ui/sonner'

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
      />
      <main className="min-w-0 flex-1 overflow-hidden bg-page p-6">
        <Outlet />
      </main>
      <Toaster richColors />
    </div>
  )
}
