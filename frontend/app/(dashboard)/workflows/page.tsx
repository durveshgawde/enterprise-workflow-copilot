'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { workflowApi } from '@/lib/api'
import { Workflow } from '@/lib/types'
import { Plus, Search, MoreVertical, Eye, Archive, Trash2, Loader, RefreshCw } from 'lucide-react'

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('updated')
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadWorkflows()
  }, [])

  const loadWorkflows = async () => {
    setLoading(true)
    try {
      const response = await workflowApi.list('')
      console.log('Workflows list response:', response)

      let workflowList: Workflow[] = []
      const data: any = response.data
      if (Array.isArray(data)) {
        workflowList = data
      } else if (data?.workflows && Array.isArray(data.workflows)) {
        workflowList = data.workflows
      }

      setWorkflows(workflowList)
      setError('')
    } catch (err: any) {
      console.error('Failed to load workflows:', err)
      setError(err.message || 'Failed to load workflows')
    } finally {
      setLoading(false)
    }
  }

  const filteredWorkflows = workflows
    .filter((w) => statusFilter === 'all' ? true : w.status === statusFilter)
    .filter((w) => searchQuery === '' ? true : w.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'updated') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      } else if (sortBy === 'created') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === 'alpha') {
        return a.title.localeCompare(b.title)
      }
      return 0
    })

  const handleArchive = async (id: string) => {
    try {
      await workflowApi.archive(id)
      loadWorkflows()
    } catch (err: any) {
      setError(err.message || 'Failed to archive workflow')
    }
    setActionMenuId(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return
    try {
      await workflowApi.delete(id)
      loadWorkflows()
    } catch (err: any) {
      setError(err.message || 'Failed to delete workflow')
    }
    setActionMenuId(null)
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    archived: 'bg-gray-100 text-gray-700',
    draft: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Workflows</h1>
        <div className="flex gap-3">
          <button
            onClick={loadWorkflows}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            href="/dashboard/workflows/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            <Plus size={20} />
            Create Workflow
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700">×</button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workflows..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="updated">Recently Updated</option>
          <option value="created">Recently Created</option>
          <option value="alpha">Alphabetical</option>
        </select>
      </div>

      {/* Workflows List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin text-blue-600" size={32} />
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="p-12 text-center">
            {searchQuery || statusFilter !== 'all' ? (
              <>
                <p className="text-gray-500 mb-4">No workflows match your filters</p>
                <button
                  onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Plus size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No workflows yet</h3>
                <p className="text-gray-500 mb-6">Create your first workflow to get started.</p>
                <Link
                  href="/dashboard/workflows/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  <Plus size={20} />
                  Create Workflow
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Steps</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredWorkflows.map((workflow) => (
                  <tr key={workflow.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/workflows/${workflow.id}`}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        {workflow.title}
                      </Link>
                      {workflow.description && (
                        <p className="text-sm text-gray-500 truncate max-w-sm mt-1">{workflow.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[workflow.status] || 'bg-gray-100'}`}>
                        {workflow.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(workflow.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {workflow.step_count || workflow.steps?.length || 0}
                    </td>
                    <td className="px-6 py-4 relative">
                      <button
                        onClick={() => setActionMenuId(actionMenuId === workflow.id ? null : workflow.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <MoreVertical size={20} />
                      </button>

                      {actionMenuId === workflow.id && (
                        <div className="absolute right-6 top-12 bg-white border rounded-lg shadow-lg z-10 min-w-[140px] py-1">
                          <Link
                            href={`/dashboard/workflows/${workflow.id}`}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm"
                          >
                            <Eye size={16} />
                            View
                          </Link>
                          <button
                            onClick={() => handleArchive(workflow.id)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm w-full text-left"
                          >
                            <Archive size={16} />
                            Archive
                          </button>
                          <button
                            onClick={() => handleDelete(workflow.id)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 text-sm w-full text-left"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && filteredWorkflows.length > 0 && (
        <p className="mt-4 text-sm text-gray-500">
          Showing {filteredWorkflows.length} of {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
        </p>
      )}

      {actionMenuId && (
        <div className="fixed inset-0 z-0" onClick={() => setActionMenuId(null)} />
      )}
    </div>
  )
}
