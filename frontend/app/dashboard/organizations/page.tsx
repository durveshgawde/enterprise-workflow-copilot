'use client'

import { useState, useEffect } from 'react'
import { organizationApi } from '@/lib/api'
import { Building2, Plus, Users, Briefcase, X, Loader } from 'lucide-react'
import Link from 'next/link'

interface Organization {
    id: string
    name: string
    description?: string
    member_count?: number
    workflow_count?: number
    created_at: string
}

export default function OrganizationsPage() {
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newOrgName, setNewOrgName] = useState('')
    const [newOrgDescription, setNewOrgDescription] = useState('')
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        loadOrganizations()
    }, [])

    const loadOrganizations = async () => {
        try {
            const response = await organizationApi.list()
            const orgs = response.data?.organizations || response.data || []
            setOrganizations(Array.isArray(orgs) ? orgs : [])
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to load organizations')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateOrg = async () => {
        if (!newOrgName.trim()) return

        setCreating(true)
        try {
            const response = await organizationApi.create({
                name: newOrgName.trim(),
                description: newOrgDescription.trim(),
            })

            if (response.data?.organization) {
                setOrganizations((prev) => [...prev, response.data.organization])
            }

            setNewOrgName('')
            setNewOrgDescription('')
            setShowCreateModal(false)
            loadOrganizations()
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to create organization')
        } finally {
            setCreating(false)
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Building2 size={32} />
                    Organizations
                </h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-medium text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
                >
                    <Plus size={20} />
                    Create Organization
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError('')}><X size={18} /></button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader className="animate-spin" size={32} />
                </div>
            ) : organizations.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <Building2 size={48} className="mx-auto mb-4 text-gray-400" />
                    <h2 className="text-xl font-bold mb-2">No Organizations Yet</h2>
                    <p className="text-gray-600 mb-6">Create your first organization to start managing workflows with your team.</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={20} />
                        Create Organization
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {organizations.map((org) => (
                        <Link
                            key={org.id}
                            href={`/dashboard/organizations/${org.id}`}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Building2 size={24} className="text-blue-600" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{org.name}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {org.description || 'No description'}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Users size={16} />
                                    {org.member_count || 0} members
                                </span>
                                <span className="flex items-center gap-1">
                                    <Briefcase size={16} />
                                    {org.workflow_count || 0} workflows
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Create Organization Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Create Organization</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Organization Name *
                                </label>
                                <input
                                    type="text"
                                    value={newOrgName}
                                    onChange={(e) => setNewOrgName(e.target.value)}
                                    placeholder="e.g., Acme Corp"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newOrgDescription}
                                    onChange={(e) => setNewOrgDescription(e.target.value)}
                                    placeholder="What is this organization for?"
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleCreateOrg}
                                    disabled={!newOrgName.trim() || creating}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {creating ? (
                                        <>
                                            <Loader size={18} className="animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Organization'
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
