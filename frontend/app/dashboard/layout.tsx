'use client'

import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/app/providers'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Menu, LogOut, Settings, Home, FileText, Building2,
  Activity, ChevronRight, User, X, Zap
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden transition-all duration-300 flex flex-col shadow-2xl`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Zap className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Workflow Copilot</h1>
              <p className="text-xs text-slate-400">Enterprise Edition</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">Main Menu</p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setCurrentPath(item.href)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Icon size={20} className={active ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} />
                  <span className="font-medium">{item.label}</span>
                  {active && <ChevronRight size={16} className="ml-auto" />}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <User size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user.user_metadata?.name || 'User'}
              </p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 font-medium"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Top Navigation */}
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2.5 hover:bg-gray-100 rounded-xl transition text-gray-600"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center gap-3">

            <Link
              href="/dashboard/settings"
              className="p-2.5 hover:bg-gray-100 rounded-xl transition text-gray-600"
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