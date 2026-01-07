'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { workflowApi, stepApi, commentApi, activityApi } from '@/lib/api'
import { Workflow, WorkflowStep, Comment, ActivityLog } from '@/lib/types'
import { ChevronDown, MessageCircle, History, Plus } from 'lucide-react'

export default function WorkflowDetailPage() {
  const params = useParams()
  const workflowId = params.id as string

  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [steps, setSteps] = useState<WorkflowStep[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedSteps, setExpandedSteps] = useState<string[]>([])
  const [showAddStep, setShowAddStep] = useState(false)
  const [newStepTitle, setNewStepTitle] = useState('')
  const [newStepDescription, setNewStepDescription] = useState('')
  const [addingStep, setAddingStep] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [addingComment, setAddingComment] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [wfRes, stepsRes, commentsRes, activityRes] = await Promise.all([
          workflowApi.get(workflowId),
          stepApi.list(workflowId),
          commentApi.list(workflowId),
          activityApi.forWorkflow(workflowId),
        ])

        setWorkflow(wfRes.data)
        setSteps(stepsRes.data)
        setComments(commentsRes.data)
        setActivity(activityRes.data)
      } catch (err: any) {
        setError(err.message || 'Failed to load workflow')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [workflowId])

  const toggleStepExpand = (stepId: string) => {
    setExpandedSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    )
  }

  const handleCompleteStep = async (stepId: string) => {
    try {
      await stepApi.complete(workflowId, stepId, {
        status: 'completed',
        context_url: window.location.href,
      })
      setSteps((prev) =>
        prev.map((s) =>
          s.id === stepId
            ? {
                ...s,
                status: 'completed',
                completed_at: new Date().toISOString(),
              }
            : s
        )
      )
    } catch (err: any) {
      setError(err.message || 'Failed to complete step')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!workflow) return <div>Workflow not found</div>

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="md:col-span-2">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">{workflow.title}</h1>
          <p className="text-gray-600 mb-4">{workflow.description}</p>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            workflow.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {workflow.status}
          </span>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">Steps ({steps.length})</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddStep((s) => !s)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={20} />
                {showAddStep ? 'Cancel' : 'Add Step'}
              </button>
            </div>
          </div>

          {showAddStep && (
            <div className="p-6 border-b bg-gray-50">
              <div className="space-y-3">
                <input
                  type="text"
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  placeholder="Step title"
                  className="w-full px-3 py-2 border rounded"
                />
                <textarea
                  value={newStepDescription}
                  onChange={(e) => setNewStepDescription(e.target.value)}
                  placeholder="Step description"
                  rows={3}
                  className="w-full px-3 py-2 border rounded"
                />
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!newStepTitle) return
                      setAddingStep(true)
                      setError('')
                      try {
                        const res = await stepApi.create(workflowId, {
                          title: newStepTitle,
                          description: newStepDescription,
                          step_order: steps.length,
                        })
                        const created = res.data ?? null
                        if (created) setSteps((p) => [...p, created])
                        setNewStepTitle('')
                        setNewStepDescription('')
                        setShowAddStep(false)
                      } catch (err: any) {
                        setError(err.message || 'Failed to add step')
                      } finally {
                        setAddingStep(false)
                      }
                    }}
                    disabled={addingStep}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {addingStep ? 'Adding...' : 'Add Step'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="divide-y">
            {steps.map((step) => (
              <div key={step.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <button
                      onClick={() => toggleStepExpand(step.id)}
                      className="flex items-center gap-2 w-full text-left"
                    >
                      <ChevronDown
                        size={20}
                        className={`transition ${
                          expandedSteps.includes(step.id) ? 'rotate-180' : ''
                        }`}
                      />
                      <div>
                        <h3 className="font-semibold">{step.title}</h3>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </button>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ml-4 ${
                    step.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : step.status === 'in_progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {step.status}
                  </span>
                </div>

                {expandedSteps.includes(step.id) && (
                  <div className="mt-4 pl-8 space-y-4">
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

                    {step.context_text && (
                      <div className="p-3 bg-gray-50 rounded-lg text-sm">
                        <p className="font-semibold mb-2">Captured Text:</p>
                        <p className="text-gray-700">{step.context_text}</p>
                      </div>
                    )}

                    {step.status !== 'completed' && (
                      <button
                        onClick={() => handleCompleteStep(step.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Mark as Complete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
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
            {comments.map((comment) => (
              <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold">{comment.created_by}</p>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add comment..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
            />
            <button
              onClick={async () => {
                if (!newComment) return
                setAddingComment(true)
                setError('')
                try {
                  const res = await commentApi.create(workflowId, { content: newComment })
                  const created = res.data ?? null
                  if (created) setComments((p) => [...p, created])
                  setNewComment('')
                } catch (err: any) {
                  setError(err.message || 'Failed to add comment')
                } finally {
                  setAddingComment(false)
                }
              }}
              disabled={addingComment}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {addingComment ? 'Posting...' : 'Post'}
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
            {activity.map((log) => (
              <div key={log.id} className="text-sm border-l-2 border-gray-200 pl-3">
                <p className="font-semibold">{log.action}</p>
                <p className="text-gray-600 text-xs">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
