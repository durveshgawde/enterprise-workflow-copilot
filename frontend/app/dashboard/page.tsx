'use client'

import { useWorkflows } from '@/lib/hooks/useWorkflows'
import Link from 'next/link'
import { Plus, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const { workflows, loading } = useWorkflows('default-org')

  const completedWorkflows = workflows.filter((w: any) => w.status === 'completed').length
  const activeWorkflows = workflows.filter((w: any) => w.status === 'active').length

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          href="/dashboard/workflows/new"
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-medium text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
        >
          <Plus size={16} />
          New Workflow
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Workflows</p>
              <p className="text-3xl font-bold">{activeWorkflows}</p>
            </div>
            <TrendingUp size={32} className="text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-3xl font-bold">{completedWorkflows}</p>
            </div>
            <TrendingUp size={32} className="text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Workflows</p>
              <p className="text-3xl font-bold">{workflows.length}</p>
            </div>
            <TrendingUp size={32} className="text-purple-600" />
          </div>
        </div>
      </div>

      {/* Recent Workflows */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Recent Workflows</h2>
        {loading ? (
          <div>Loading...</div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No workflows yet. <Link href="/dashboard/workflows/new" className="text-blue-600 hover:underline">Create one</Link></p>
          </div>
        ) : (
          <div className="space-y-4">
            {workflows.slice(0, 5).map((workflow: any) => (
              <Link
                key={workflow.id}
                href={`/dashboard/workflows/${workflow.id}`}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-blue-50"
              >
                <div>
                  <h3 className="font-semibold">{workflow.title}</h3>
                  <p className="text-sm text-gray-600">{workflow.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${workflow.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                  }`}>
                  {workflow.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
