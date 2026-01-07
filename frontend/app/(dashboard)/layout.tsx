'use client'

import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/app/providers'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { workflowApi } from '@/lib/api'
import { Workflow } from '@/lib/types'
import {
  Menu, LogOut, Settings, Home, FileText, Building2,
  Activity, ChevronRight, User
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading: authLoading, logout } = useAuthContext()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentPath, setCurrentPath] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname)
    }
  }, [])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/workflows', label: 'Workflows', icon: FileText },
    { href: '/dashboard/organizations', label: 'Organizations', icon: Building2 },
    { href: '/dashboard/activity', label: 'Activity', icon: Activity },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return currentPath === '/dashboard'
    }
    return currentPath.startsWith(href)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-64 bg-white shadow-lg overflow-y-auto flex flex-col">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
              🔄 Workflow Copilot
            </h1>
          </div>

          <nav className="flex-1 px-4 py-6">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setCurrentPath(item.href)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${active
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <Icon size={20} />
                    {item.label}
                    {active && <ChevronRight size={16} className="ml-auto" />}
                  </Link>
                )
              })}
            </div>
          </nav>

          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.user_metadata?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Top Navigation */}
        <nav className="bg-white shadow-sm p-4 flex items-center justify-between border-b">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/settings"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Settings"
            >
              <Settings size={20} />
            </Link>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}