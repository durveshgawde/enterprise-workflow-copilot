'use client'

import { useState } from 'react'
import { useWorkflows } from '@/lib/hooks/useWorkflows'
import Link from 'next/link'
import { Plus, Filter } from 'lucide-react'

export default function WorkflowsPage() {
  const { workflows, loading } = useWorkflows('default-org')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredWorkflows = workflows.filter((w) =>
    statusFilter === 'all' ? true : w.status === statusFilter
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Workflows</h1>
        <Link
          href="/dashboard/workflows/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Create Workflow
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Workflows List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading workflows...</div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No workflows found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Created</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Steps</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkflows.map((workflow) => (
                  <tr key={workflow.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/workflows/${workflow.id}`}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        {workflow.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        workflow.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : workflow.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {workflow.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(workflow.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">{workflow.steps?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

