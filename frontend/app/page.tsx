import Link from 'next/link'
import { Zap, Brain, Share2 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
        <div className="text-2xl font-bold text-blue-600">🔄 Workflow Copilot</div>
        <div className="space-x-4">
          <Link href="/login" className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded">
            Login
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Enterprise Workflow Automation
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Complete workflows with AI-powered SOP generation and execution-in-context.
          </p>
          <div className="space-x-4">
            <Link
              href="/signup"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Get Started
            </Link>
            <Link
              href="#features"
              className="inline-block px-8 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid md:grid-cols-3 gap-8 py-20">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <Brain className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">AI SOP Generation</h3>
            <p className="text-gray-600">
              Convert raw text into structured workflows using GPT-based copilots.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <Zap className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Execution-in-Context</h3>
            <p className="text-gray-600">
              Complete workflow steps directly from any webpage without tab switching.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <Share2 className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Real-time Collaboration</h3>
            <p className="text-gray-600">
              Comment, track progress, and maintain complete audit trails.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
