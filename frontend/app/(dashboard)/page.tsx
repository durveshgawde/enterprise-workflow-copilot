'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/app/providers'
import Link from 'next/link'
import { workflowApi } from '@/lib/api'
import { Workflow } from '@/lib/types'
import { Plus, TrendingUp, CheckCircle, Clock, BarChart2, ArrowRight, Loader } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthContext()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadWorkflows()
  }, [])

  const loadWorkflows = async () => {
    try {
      const response = await workflowApi.list('')
      console.log('Dashboard workflows response:', response)

      // Handle various response formats
      let workflowList: Workflow[] = []
      const data: any = response.data
      if (Array.isArray(data)) {
        workflowList = data
      } else if (data?.workflows && Array.isArray(data.workflows)) {
        workflowList = data.workflows
      }

      setWorkflows(workflowList)
    } catch (err: any) {
      console.error('Failed to load workflows:', err)
      setError(err.message || 'Failed to load workflows')
    } finally {
      setLoading(false)
    }
  }

  const completedWorkflows = workflows.filter((w) => w.status === 'completed').length
  const activeWorkflows = workflows.filter((w) => w.status === 'active').length

  // Calculate steps
  const totalSteps = workflows.reduce((acc, w) => acc + (w.steps?.length || w.step_count || 0), 0)
  const completedSteps = workflows.reduce((acc, w) => {
    return acc + (w.steps?.filter(s => s.status === 'completed').length || 0)
  }, 0)

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'

  return (
    <div>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white rounded-2xl p-8 mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
        <p className="text-blue-100 mb-6 text-lg">Here's your workflow overview for today.</p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/dashboard/workflows/new"
            className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold flex items-center gap-2 shadow-md transition"
          >
            <Plus size={20} />
            Create Workflow
          </Link>
          <Link
            href="/dashboard/workflows"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-400 font-semibold flex items-center gap-2 transition"
          >
            View All Workflows
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Workflows</p>
              <p className="text-3xl font-bold mt-1">{workflows.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <BarChart2 size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active</p>
              <p className="text-3xl font-bold mt-1 text-green-600">{activeWorkflows}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold mt-1 text-blue-600">{completedWorkflows}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Steps</p>
              <p className="text-3xl font-bold mt-1">{totalSteps}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Workflows */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Recent Workflows</h2>
          <Link href="/dashboard/workflows" className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin text-blue-600" size={32} />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            {error}
            <button onClick={loadWorkflows} className="ml-2 text-blue-600 hover:underline">
              Retry
            </button>
          </div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-12 px-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <BarChart2 size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No workflows yet</h3>
            <p className="text-gray-500 mb-6">Create your first workflow to get started!</p>
            <Link
              href="/dashboard/workflows/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              <Plus size={20} />
              Create Workflow
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {workflows.slice(0, 5).map((workflow) => (
              <Link
                key={workflow.id}
                href={`/dashboard/workflows/${workflow.id}`}
                className="flex items-center justify-between p-6 hover:bg-blue-50 transition"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{workflow.title}</h3>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {workflow.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{workflow.steps?.length || workflow.step_count || 0} steps</span>
                    <span>•</span>
                    <span>Created {new Date(workflow.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${workflow.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : workflow.status === 'completed'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                    }`}>
                    {workflow.status}
                  </span>
                  <ArrowRight size={20} className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}