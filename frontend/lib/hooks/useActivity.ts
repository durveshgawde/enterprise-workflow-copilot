import { useEffect, useState } from 'react'
import { activityApi } from '../api'
import { ActivityLog } from '../types'

export function useActivity(organizationId: string) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadActivity = async () => {
    setLoading(true)
    try {
      const response = await activityApi.list(organizationId)
      setActivities(response.data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load activity')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (organizationId) {
      loadActivity()
    }
  }, [organizationId])

  // Refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(loadActivity, 10000)
    return () => clearInterval(interval)
  }, [organizationId])

  return { activities, loading, error, refetch: loadActivity }
}
