'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { workflowApi, aiApi } from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft, Loader } from 'lucide-react'

export default function NewWorkflowPage() {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [aiText, setAiText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleManualCreate = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await workflowApi.create({ title, description })
      router.push(`/dashboard/workflows/${response.data.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create workflow')
    } finally {
      setLoading(false)
    }
  }

  const handleAICreate = async () => {
    setLoading(true)
    setError('')
    try {
      const sopResponse = await aiApi.generateSop({ text: aiText })
      const workflowResponse = await workflowApi.create({
        title: sopResponse.data.title,
      })
      router.push(`/dashboard/workflows/${workflowResponse.data.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to generate workflow')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Link
        href="/dashboard/workflows"
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Workflows
      </Link>

      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Create Workflow</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Mode Selection */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setMode('manual')}
            className={`p-6 border-2 rounded-lg text-center transition ${
              mode === 'manual'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <h3 className="text-lg font-bold mb-2">Manual Create</h3>
            <p className="text-sm text-gray-600">Create workflow step by step</p>
          </button>

          <button
            onClick={() => setMode('ai')}
            className={`p-6 border-2 rounded-lg text-center transition ${
              mode === 'ai'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <h3 className="text-lg font-bold mb-2">✨ AI Generation</h3>
            <p className="text-sm text-gray-600">Generate from text using AI</p>
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {mode === 'manual' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workflow Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Customer Onboarding"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your workflow..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                onClick={handleManualCreate}
                disabled={!title || loading}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader size={20} className="animate-spin" />}
                {loading ? 'Creating...' : 'Create Workflow'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste Text (Email, Document, or Process) *
                </label>
                <textarea
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  placeholder="Paste email, document, or process description..."
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-sm"
                />
              </div>

              <button
                onClick={handleAICreate}
                disabled={!aiText || loading}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader size={20} className="animate-spin" />}
                {loading ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}