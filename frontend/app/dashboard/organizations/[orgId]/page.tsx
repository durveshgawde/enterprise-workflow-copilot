'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { organizationApi, userApi } from '@/lib/api'
import { Building2, Users, Mail, ArrowLeft, Save, Loader, X, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Organization {
    id: string
    name: string
    description?: string
    owner_id: string
    created_at: string
}

interface Member {
    user_id: string
    name: string
    email: string
    role: string
    joined_at: string
}

export default function OrganizationSettingsPage() {
    const params = useParams()
    const orgId = params.orgId as string

    const [org, setOrg] = useState<Organization | null>(null)
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [activeTab, setActiveTab] = useState<'general' | 'members' | 'invite'>('general')

    // Form state
    const [orgName, setOrgName] = useState('')
    const [orgDescription, setOrgDescription] = useState('')
    const [saving, setSaving] = useState(false)

    // Invite state
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState('member')
    const [inviting, setInviting] = useState(false)

    useEffect(() => {
        loadOrganization()
    }, [orgId])

    const loadOrganization = async () => {
        try {
            const [orgRes, membersRes] = await Promise.all([
                organizationApi.get(orgId),
                userApi.getOrgMembers(orgId),
            ])

            const orgData = orgRes.data?.organization || orgRes.data
            setOrg(orgData)
            setOrgName(orgData?.name || '')
            setOrgDescription(orgData?.description || '')

            const membersData = membersRes.data?.members || membersRes.data || []
            setMembers(Array.isArray(membersData) ? membersData : [])
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to load organization')
        } finally {
            setLoading(false)
        }
    }

    const handleSaveGeneral = async () => {
        setSaving(true)
        setError('')
        setSuccess('')

        try {
            await organizationApi.update(orgId, {
                name: orgName.trim(),
                description: orgDescription.trim(),
            })
            setSuccess('Organization updated successfully!')
            setTimeout(() => setSuccess(''), 3000)
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to update organization')
        } finally {
            setSaving(false)
        }
    }

    const handleInvite = async () => {
        if (!inviteEmail.trim()) return

        setInviting(true)
        setError('')

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/organizations/${orgId}/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                },
                body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
            })

            if (response.ok) {
                setSuccess(`Invitation sent to ${inviteEmail}!`)
                setInviteEmail('')
                setInviteRole('member')
                setTimeout(() => setSuccess(''), 3000)
                loadOrganization()
            } else {
                const data = await response.json()
                setError(data.detail || 'Failed to send invitation')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to send invitation')
        } finally {
            setInviting(false)
        }
    }

    const handleRemoveMember = async (userId: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/organizations/${orgId}/members/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                },
            })
            loadOrganization()
        } catch (err: any) {
            setError(err.message || 'Failed to remove member')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="animate-spin" size={32} />
            </div>
        )
    }

    if (!org) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Organization not found</p>
                <Link href="/dashboard/organizations" className="text-blue-600 hover:underline">
                    Back to Organizations
                </Link>
            </div>
        )
    }

    return (
        <div>
            <Link
                href="/dashboard/organizations"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
            >
                <ArrowLeft size={20} />
                Back to Organizations
            </Link>

            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 size={32} className="text-blue-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{org.name}</h1>
                    <p className="text-gray-500">Organization Settings</p>
                </div>
            </div>

            {success && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
                    <span>{success}</span>
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError('')}><X size={18} /></button>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b mb-6">
                <nav className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`pb-4 font-semibold border-b-2 transition ${activeTab === 'general'
                                ? 'text-blue-600 border-blue-600'
                                : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}
                    >
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`pb-4 font-semibold border-b-2 transition ${activeTab === 'members'
                                ? 'text-blue-600 border-blue-600'
                                : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}
                    >
                        Members ({members.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('invite')}
                        className={`pb-4 font-semibold border-b-2 transition ${activeTab === 'invite'
                                ? 'text-blue-600 border-blue-600'
                                : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}
                    >
                        Invite Team
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-md p-8">
                {activeTab === 'general' && (
                    <div className="space-y-6 max-w-2xl">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Organization Name *
                            </label>
                            <input
                                type="text"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={orgDescription}
                                onChange={(e) => setOrgDescription(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                        </div>

                        <div className="text-sm text-gray-500">
                            <p>Created: {new Date(org.created_at).toLocaleDateString()}</p>
                        </div>

                        <button
                            onClick={handleSaveGeneral}
                            disabled={saving || !orgName.trim()}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader size={18} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                )}

                {activeTab === 'members' && (
                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Users size={20} />
                            Team Members
                        </h3>

                        {members.length === 0 ? (
                            <p className="text-gray-500">No members yet. Invite your team!</p>
                        ) : (
                            <div className="divide-y">
                                {members.map((member) => (
                                    <div key={member.user_id} className="py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                <Users size={20} className="text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{member.name || 'User'}</p>
                                                <p className="text-sm text-gray-500">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${member.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                    member.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {member.role}
                                            </span>
                                            <button
                                                onClick={() => handleRemoveMember(member.user_id)}
                                                className="text-red-500 hover:text-red-700 p-2"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'invite' && (
                    <div className="max-w-md">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Mail size={20} />
                            Invite Team Members
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="team@example.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                >
                                    <option value="member">Member</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                    <option value="viewer">Viewer</option>
                                </select>
                            </div>

                            <button
                                onClick={handleInvite}
                                disabled={!inviteEmail.trim() || inviting}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {inviting ? (
                                    <>
                                        <Loader size={18} className="animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={18} />
                                        Send Invitation
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
