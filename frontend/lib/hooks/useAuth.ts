import { useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuthStore } from '../store/authStore'
import { AuthUser } from '../types'

export function useAuth() {
  const { user, loading, setUser, setLoading, setError } = useAuthStore()

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          user_metadata: session.user.user_metadata,
        }
        setUser(authUser)
      }
      setLoading(false)
    }).catch((error: Error) => {
      setError(error.message)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            user_metadata: session.user.user_metadata,
          }
          setUser(authUser)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
  }, [setUser, setLoading])

  return { user, loading }
}