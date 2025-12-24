'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { AuthUser } from '@/lib/types'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    setIsInitialized(true)
  }, [])

  const logout = async () => {
    const { supabase } = await import('@/lib/supabase')
    await supabase.auth.signOut()
  }

  if (!isInitialized) {
    return <div>Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
