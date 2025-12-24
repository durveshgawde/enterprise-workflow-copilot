import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { AuthUser } from '../types'

export function useAuth() {
  const { user, loading, setUser, setLoading, setError } = useAuthStore()

  useEffect(() => {
    let subscription: any = null

    const init = async () => {
      try {
        const { supabase } = await import('../supabase')

        // Check if user is logged in
        const sessionResp = await supabase.auth.getSession()
        const session = sessionResp?.data?.session
        if (session) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            user_metadata: session.user.user_metadata,
          }
          setUser(authUser)
        }
        setLoading(false)

        // Listen for auth changes
        const { data } = await supabase.auth.onAuthStateChange((event, session) => {
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
        })

        subscription = data?.subscription
      } catch (err) {
        setError?.(err as Error)
        setLoading(false)
      }
    }

    init()

    return () => subscription?.unsubscribe?.()
  }, [setUser, setLoading, setError])

  return { user, loading }
}