'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { workflowApi, aiApi, stepApi } from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft, Loader, Check, RefreshCw, Edit, X, Sparkles, FileText } from 'lucide-react'

interface GeneratedStep {
  title: string
  description: string
  role?: string
}

interface GeneratedWorkflow {
  title: string
  description: string
  steps: GeneratedStep[]
}

export default function NewWorkflowPage() {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [aiText, setAiText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  // AI Preview state
  const [showPreview, setShowPreview] = useState(false)
  const [generatedWorkflow, setGeneratedWorkflow] = useState<GeneratedWorkflow | null>(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [previewTitle, setPreviewTitle] = useState('')
  const [previewDescription, setPreviewDescription] = useState('')

  const handleManualCreate = async () => {
    if (!title.trim()) {
      setError('Workflow title is required')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await workflowApi.create({ title: title.trim(), description: description.trim() })
      console.log('Create workflow response:', response)

      // Handle various response formats
      const workflowId = response.data?.id || response.data?.workflow_id

      if (workflowId) {
        setSuccess('Workflow created successfully!')
        setTimeout(() => {
          router.push(`/dashboard/workflows/${workflowId}`)
        }, 500)
      } else {
        // Still navigate to workflows list if creation succeeded but ID format unknown
        setSuccess('Workflow created!')
        setTimeout(() => {
          router.push('/dashboard/workflows')
        }, 500)
      }
    } catch (err: any) {
      console.error('Create workflow error:', err)
      setError(err.response?.data?.detail || err.message || 'Failed to create workflow')
    } finally {
      setLoading(false)
    }
  }

  const handleAIGenerate = async () => {
    if (!aiText.trim()) {
      setError('Please paste some text to generate from')
      return
    }

    if (aiText.trim().length < 20) {
      setError('Please paste at least 20 characters')
      return
    }

    setLoading(true)
    setError('')
    setShowPreview(false)

    try {
      console.log('Calling AI API with text:', aiText.substring(0, 100) + '...')
      const response = await aiApi.generateSop({ text: aiText })
      console.log('=== AI API Response Debug ===')
      console.log('Full response:', response)
      console.log('response.data:', response.data)

      // Check if we got a valid workflow response
      const workflowData = response.data

      console.log('workflowData:', workflowData)
      console.log('workflowData.title:', workflowData?.title)
      console.log('workflowData.description:', workflowData?.description)
      console.log('workflowData.steps:', workflowData?.steps)
      console.log('workflowData.steps?.length:', workflowData?.steps?.length)

      if (workflowData && typeof workflowData === 'object' && workflowData.title) {
        console.log('Valid workflow received!')
        console.log('Setting generatedWorkflow with:', {
          title: workflowData.title,
          description: workflowData.description,
          steps: workflowData.steps,
          stepsCount: workflowData.steps?.length || 0
        })

        setGeneratedWorkflow(workflowData as GeneratedWorkflow)
        setPreviewTitle(workflowData.title)
        setPreviewDescription(workflowData.description || '')
        setShowPreview(true)

        console.log('Preview should now be visible!')
      } else if (response.data?.error) {
        setError(`AI Error: ${response.data.error}`)
      } else {
        console.error('Invalid AI response format:', response)
        setError('AI could not generate a workflow from this text. Please try more descriptive text with clear steps.')
      }
    } catch (err: any) {
      console.error('AI generation error:', err)
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || err.message || 'Failed to generate workflow'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async () => {
    setShowPreview(false)
    setGeneratedWorkflow(null)
    await handleAIGenerate()
  }

  const handleConfirmAndSave = async () => {
    if (!generatedWorkflow) return

    setLoading(true)
    setError('')

    try {
      // Use the edited title/description or fall back to AI-generated ones
      const finalTitle = previewTitle || generatedWorkflow.title
      const finalDescription = previewDescription || generatedWorkflow.description || ''
      const finalSteps = generatedWorkflow.steps || []

      console.log('=== Saving AI Workflow ===')
      console.log('Title:', finalTitle)
      console.log('Description:', finalDescription)
      console.log('Steps count:', finalSteps.length)

      // Use the new atomic save endpoint
      const response = await aiApi.saveWorkflow({
        title: finalTitle,
        description: finalDescription,
        steps: finalSteps,
      })

      console.log('Save response:', response.data)

      if (!response.data?.success) {
        setError(response.data?.error || 'Failed to save workflow')
        setLoading(false)
        return
      }

      const workflowId = response.data.workflow_id
      const stepsCreated = response.data.steps_created || 0

      console.log(`Workflow ${workflowId} created with ${stepsCreated} steps`)
      setSuccess(`Workflow created with ${stepsCreated} steps!`)

      setTimeout(() => {
        router.push(`/dashboard/workflows/${workflowId}`)
      }, 1000)
    } catch (err: any) {
      console.error('Save workflow error:', err)
      setError(err.response?.data?.detail || err.message || 'Failed to save workflow')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelPreview = () => {
    setShowPreview(false)
    setGeneratedWorkflow(null)
    setPreviewTitle('')
    setPreviewDescription('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/dashboard/workflows"
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Workflows
      </Link>

      <h1 className="text-3xl font-bold mb-8">Create Workflow</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
            <X size={20} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg flex items-center gap-2">
          <Check size={20} />
          {success}
        </div>
      )}

      {/* Mode Selection */}
      {!showPreview && (
        <>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setMode('manual')}
              className={`p-6 border-2 rounded-xl text-center transition ${mode === 'manual'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <FileText size={32} className="mx-auto mb-3 text-blue-600" />
              <h3 className="text-lg font-bold mb-2">Manual Create</h3>
              <p className="text-sm text-gray-600">Create workflow step by step</p>
            </button>

            <button
              onClick={() => setMode('ai')}
              className={`p-6 border-2 rounded-xl text-center transition ${mode === 'ai'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <Sparkles size={32} className="mx-auto mb-3 text-purple-600" />
              <h3 className="text-lg font-bold mb-2">AI Generation</h3>
              <p className="text-sm text-gray-600">Generate from text using Gemini AI</p>
            </button>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            {mode === 'manual' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Workflow Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Customer Onboarding Process"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this workflow is for..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleManualCreate}
                  disabled={!title.trim() || loading}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-lg"
                >
                  {loading && <Loader size={20} className="animate-spin" />}
                  {loading ? 'Creating...' : 'Create Workflow'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Paste Text to Convert *
                  </label>
                  <textarea
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    placeholder={`Paste an email, document, or process description here.

Example:
"When a new employee joins, HR needs to collect their documents first. Then IT creates their email account. After that, the manager assigns their first project and schedules a team introduction meeting."`}
                    rows={10}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {aiText.length} characters (minimum 20 required)
                  </p>
                </div>

                <button
                  onClick={handleAIGenerate}
                  disabled={aiText.trim().length < 20 || loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-lg"
                >
                  {loading && <Loader size={20} className="animate-spin" />}
                  {loading ? 'Generating with AI...' : (
                    <>
                      <Sparkles size={20} />
                      Generate with AI
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* AI Preview Section */}
      {showPreview && generatedWorkflow && (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-green-200">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-green-700 flex items-center gap-2">
              <Check size={24} />
              Generated Workflow Preview
            </h2>
            <button
              onClick={handleCancelPreview}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <X size={24} />
            </button>
          </div>

          {/* Editable Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Workflow Title
            </label>
            {editingTitle ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={previewTitle}
                  onChange={(e) => setPreviewTitle(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={() => setEditingTitle(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold">{previewTitle}</h3>
                <button
                  onClick={() => setEditingTitle(true)}
                  className="text-blue-600 hover:text-blue-700 p-1"
                >
                  <Edit size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={previewDescription}
              onChange={(e) => setPreviewDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Steps Preview */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4">
              Steps ({generatedWorkflow.steps?.length || 0})
            </h4>
            <div className="space-y-3">
              {generatedWorkflow.steps?.map((step, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">{step.title}</h5>
                      <p className="text-gray-600 text-sm mt-1">{step.description}</p>
                      {step.role && (
                        <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          {step.role}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleConfirmAndSave}
              disabled={loading}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold text-lg"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Confirm & Save
                </>
              )}
            </button>
            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
            >
              <RefreshCw size={20} />
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  )
}