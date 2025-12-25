import { useEffect, useState } from 'react'
import { stepApi } from '../api'
import { WorkflowStep } from '../types'

export function useSteps(workflowId: string) {
  const [steps, setSteps] = useState<WorkflowStep[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSteps = async () => {
    setLoading(true)
    try {
      const response = await stepApi.list(workflowId)
      setSteps(response.data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load steps')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (workflowId) {
      loadSteps()
    }
  }, [workflowId])

  return { steps, loading, error, refetch: loadSteps }
}
