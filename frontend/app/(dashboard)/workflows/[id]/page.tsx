'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { workflowApi, stepApi, commentApi, activityApi } from '@/lib/api'
import { Workflow, WorkflowStep, Comment, ActivityLog } from '@/lib/types'
import { ChevronDown, MessageCircle, History, Plus, X, Check, Trash2, Edit, Send } from 'lucide-react'
import Link from 'next/link'

export default function WorkflowDetailPage() {
  const params = useParams()
  const router = useRouter()
  const workflowId = params.id as string

  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [steps, setSteps] = useState<WorkflowStep[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedSteps, setExpandedSteps] = useState<string[]>([])

  // Modal states
  const [showAddStepModal, setShowAddStepModal] = useState(false)
  const [showEditWorkflowModal, setShowEditWorkflowModal] = useState(false)
  const [stepTitle, setStepTitle] = useState('')
  const [stepDescription, setStepDescription] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [savingStep, setSavingStep] = useState(false)
  const [savingWorkflow, setSavingWorkflow] = useState(false)

  // Comment state
  const [newComment, setNewComment] = useState('')
  const [savingComment, setSavingComment] = useState(false)

  // Delete confirmation
  const [deleteStepId, setDeleteStepId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [workflowId])

  const loadData = async () => {
    try {
      const [wfRes, stepsRes, commentsRes, activityRes] = await Promise.all([
        workflowApi.get(workflowId),
        stepApi.list(workflowId),
        commentApi.list(workflowId),
        activityApi.forWorkflow(workflowId),
      ])

      setWorkflow(wfRes.data)
      setSteps(Array.isArray(stepsRes.data) ? stepsRes.data : [])
      setComments(Array.isArray(commentsRes.data) ? commentsRes.data : [])
      setActivity(Array.isArray(activityRes.data) ? activityRes.data : [])
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load workflow')
    } finally {
      setLoading(false)
    }
  }

  const toggleStepExpand = (stepId: string) => {
    setExpandedSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    )
  }

  const handleCompleteStep = async (stepId: string) => {
    try {
      await stepApi.complete(workflowId, stepId, { status: 'completed' })
      setSteps((prev) =>
        prev.map((s) =>
          s.id === stepId
            ? { ...s, status: 'completed', completed_at: new Date().toISOString() }
            : s
        )
      )
      // Reload activity
      const activityRes = await activityApi.forWorkflow(workflowId)
      setActivity(Array.isArray(activityRes.data) ? activityRes.data : [])
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to complete step')
    }
  }

  const handleAddStep = async () => {
    if (!stepTitle.trim()) return

    setSavingStep(true)
    try {
      const response = await stepApi.create(workflowId, {
        title: stepTitle.trim(),
        description: stepDescription.trim(),
        status: 'pending',
      })

      if (response.data) {
        setSteps((prev) => [...prev, response.data])
        setStepTitle('')
        setStepDescription('')
        setShowAddStepModal(false)
        // Reload activity
        const activityRes = await activityApi.forWorkflow(workflowId)
        setActivity(Array.isArray(activityRes.data) ? activityRes.data : [])
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to add step')
    } finally {
      setSavingStep(false)
    }
  }

  const handleDeleteStep = async (stepId: string) => {
    try {
      await stepApi.delete(workflowId, stepId)
      setSteps((prev) => prev.filter((s) => s.id !== stepId))
      setDeleteStepId(null)
      // Reload activity
      const activityRes = await activityApi.forWorkflow(workflowId)
      setActivity(Array.isArray(activityRes.data) ? activityRes.data : [])
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete step')
    }
  }

  const handleEditWorkflow = async () => {
    if (!editTitle.trim()) return

    setSavingWorkflow(true)
    try {
      await workflowApi.update(workflowId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      })
      setWorkflow((prev) => prev ? { ...prev, title: editTitle.trim(), description: editDescription.trim() } : null)
      setShowEditWorkflowModal(false)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to update workflow')
    } finally {
      setSavingWorkflow(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setSavingComment(true)
    try {
      const response = await commentApi.create(workflowId, { content: newComment.trim() })
      if (response.data) {
        setComments((prev) => [response.data, ...prev])
        setNewComment('')
        // Reload activity
        const activityRes = await activityApi.forWorkflow(workflowId)
        setActivity(Array.isArray(activityRes.data) ? activityRes.data : [])
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to add comment')
    } finally {
      setSavingComment(false)
    }
  }

  const handleStatusChange = async (newStatus: 'active' | 'completed' | 'archived' | 'draft') => {
    try {
      await workflowApi.update(workflowId, { status: newStatus })
      setWorkflow((prev) => prev ? { ...prev, status: newStatus } : null)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to update status')
    }
  }

  const openEditModal = () => {
    setEditTitle(workflow?.title || '')
    setEditDescription(workflow?.description || '')
    setShowEditWorkflowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && !workflow) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Link href="/dashboard/workflows" className="text-blue-600 hover:underline">
          Back to Workflows
        </Link>
      </div>
    )
  }

  if (!workflow) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 mb-4">Workflow not found</div>
        <Link href="/dashboard/workflows" className="text-blue-600 hover:underline">
          Back to Workflows
        </Link>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    archived: 'bg-gray-100 text-gray-800',
    draft: 'bg-yellow-100 text-yellow-800',
  }

  const stepStatusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    blocked: 'bg-red-100 text-red-800',
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')}><X size={18} /></button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{workflow.title}</h1>
                <p className="text-gray-600 mb-4">{workflow.description || 'No description'}</p>
              </div>
              <button
                onClick={openEditModal}
                className="text-blue-600 hover:text-blue-700 p-2"
                title="Edit workflow"
              >
                <Edit size={20} />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={workflow.status}
                onChange={(e) => handleStatusChange(e.target.value as 'active' | 'completed' | 'archived' | 'draft')}
                className={`px-3 py-1 rounded-full text-sm font-semibold cursor-pointer border-0 ${statusColors[workflow.status] || 'bg-gray-100'}`}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
              <span className="text-sm text-gray-500">
                Created {new Date(workflow.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Steps */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Steps ({steps.length})</h2>
              <button
                onClick={() => setShowAddStepModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={20} />
                Add Step
              </button>
            </div>

            {steps.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="mb-4">No steps yet. Add your first step to get started.</p>
                <button
                  onClick={() => setShowAddStepModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add First Step
                </button>
              </div>
            ) : (
              <div className="divide-y">
                {steps.map((step, idx) => (
                  <div key={step.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <button
                          onClick={() => toggleStepExpand(step.id)}
                          className="flex items-center gap-2 w-full text-left"
                        >
                          <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </span>
                          <ChevronDown
                            size={20}
                            className={`transition text-gray-400 ${expandedSteps.includes(step.id) ? 'rotate-180' : ''
                              }`}
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{step.title}</h3>
                          </div>
                        </button>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ml-4 ${stepStatusColors[step.status] || 'bg-gray-100'}`}>
                        {step.status.replace('_', ' ')}
                      </span>
                    </div>

                    {expandedSteps.includes(step.id) && (
                      <div className="mt-4 pl-12 space-y-4">
                        <p className="text-gray-600">{step.description || 'No description'}</p>

                        {step.context_url && (
                          <div className="p-3 bg-blue-50 rounded-lg text-sm">
                            <p className="font-semibold">Context URL:</p>
                            <a
                              href={step.context_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 break-all hover:underline"
                            >
                              {step.context_url}
                            </a>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {step.status !== 'completed' && (
                            <button
                              onClick={() => handleCompleteStep(step.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                            >
                              <Check size={18} />
                              Mark as Complete
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteStepId(step.id)}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center gap-2"
                          >
                            <Trash2 size={18} />
                            Delete
                          </button>
                        </div>

                        {step.completed_at && (
                          <p className="text-sm text-green-600">
                            ✓ Completed on {new Date(step.completed_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Comments */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MessageCircle size={20} />
              Comments ({comments.length})
            </h3>

            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm">No comments yet</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold">{comment.created_by_name || 'User'}</p>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || savingComment}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <History size={20} />
              Activity
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activity.length === 0 ? (
                <p className="text-gray-500 text-sm">No activity yet</p>
              ) : (
                activity.map((log) => (
                  <div key={log.id} className="text-sm border-l-2 border-gray-200 pl-3">
                    <p className="font-semibold capitalize">{log.action}</p>
                    <p className="text-gray-600 text-xs">{log.details}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Step Modal */}
      {showAddStepModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Step</h3>
              <button onClick={() => setShowAddStepModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Step Title *
                </label>
                <input
                  type="text"
                  value={stepTitle}
                  onChange={(e) => setStepTitle(e.target.value)}
                  placeholder="e.g., Review Documents"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={stepDescription}
                  onChange={(e) => setStepDescription(e.target.value)}
                  placeholder="What needs to be done..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddStep}
                  disabled={!stepTitle.trim() || savingStep}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingStep ? 'Saving...' : 'Add Step'}
                </button>
                <button
                  onClick={() => setShowAddStepModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Workflow Modal */}
      {showEditWorkflowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Workflow</h3>
              <button onClick={() => setShowEditWorkflowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleEditWorkflow}
                  disabled={!editTitle.trim() || savingWorkflow}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingWorkflow ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setShowEditWorkflowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Step Confirmation */}
      {deleteStepId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-xl font-bold mb-4">Delete Step?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this step? This cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDeleteStep(deleteStepId)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteStepId(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}