// import { useState } from 'react'
import { Outlet } from 'react-router-dom'
// import Sidebar from '@/components/layout/Sidebar'
import { Toaster } from '@/components/ui/sonner'
import Header from './Header'

export default function AppLayout() {
  // const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 h-full overflow-hidden">
        {/* <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((value) => !value)}
        /> */}
        <main className="min-w-0 flex-1 bg-page p-6 flex flex-col">
          <Outlet />
        </main>

        <Toaster richColors />
      </div>
    </div>
  )
}
