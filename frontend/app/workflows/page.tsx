'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Redirect /workflows to /dashboard/workflows
 * This ensures extension and direct links work correctly
 */
export default function WorkflowsRedirect() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/dashboard/workflows')
    }, [router])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    )
}
