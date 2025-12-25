import { useEffect } from 'react'
import { workflowApi } from '../api'
import { useWorkflowStore } from '../store/workflowStore'
import { Workflow } from '../types'

export function useWorkflows(organizationId: string) {
  const { workflows, loading, setWorkflows, setLoading, setError } = useWorkflowStore()

  const loadWorkflows = async () => {
    setLoading(true)
    try {
      const response = await workflowApi.list(organizationId)
      setWorkflows(response.data)
      setError(null)
    } catch (error: any) {
      setError(error.message || 'Failed to load workflows')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (organizationId) {
      loadWorkflows()
    }
  }, [organizationId])

  return { workflows, loading, refetch: loadWorkflows }
}
