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
      // API may return either an array or an object { workflows: [...] }
      const raw = response.data as Workflow[] | { workflows?: Workflow[] } | undefined
      let list: Workflow[] = []
      if (Array.isArray(raw)) {
        list = raw
      } else if (raw && Array.isArray((raw as any).workflows)) {
        list = (raw as any).workflows
      } else {
        list = []
      }
      setWorkflows(list)
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
