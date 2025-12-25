import { useEffect, useState } from 'react'
import { commentApi } from '../api'
import { Comment } from '../types'

export function useComments(workflowId: string, stepId?: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadComments = async () => {
    setLoading(true)
    try {
      const response = stepId
        ? await commentApi.listForStep(workflowId, stepId)
        : await commentApi.list(workflowId)
      setComments(response.data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (workflowId) {
      loadComments()
    }
  }, [workflowId, stepId])

  return { comments, loading, error, refetch: loadComments }
}

