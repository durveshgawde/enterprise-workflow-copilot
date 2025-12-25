'use client'

import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/app/providers'
import { Menu, LogOut, Settings } from 'lucide-react'
import Link from 'next/link'

import { useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, logout } = useAuthContext()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-64 bg-white shadow-md overflow-y-auto">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-blue-600">🔄 Copilot</h1>
          </div>

          <nav className="px-4 py-8 space-y-2">
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/workflows"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
            >
              Workflows
            </Link>
            <Link
              href="/dashboard/activity"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
            >
              Activity
            </Link>
            <Link
              href="/dashboard/settings"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
            >
              Settings
            </Link>
          </nav>

          <div className="px-4 py-8 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Navigation */}
        <nav className="bg-white shadow-md p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/settings" className="p-2 hover:bg-gray-100 rounded-lg">
              <Settings size={20} />
            </Link>
          </div>
        </nav>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}