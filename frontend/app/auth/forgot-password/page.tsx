'use client'

import Link from 'next/link'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Reset Password</h1>
        <p className="text-gray-600 text-center mb-4">
          Enter your email to receive a password reset link.
        </p>
        <input
          type="email"
          placeholder="your@email.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
        />
        <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Send Reset Link
        </button>
        <div className="mt-4 text-center">
          <Link href="/login" className="text-blue-600 hover:text-blue-700">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
