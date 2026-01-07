'use client'

import { useState, useEffect } from 'react'
import { activityApi } from '@/lib/api'
import { ActivityLog } from '@/lib/types'
import { History, Loader, RefreshCw, Clock, FileText, MessageCircle } from 'lucide-react'

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    setLoading(true)
    try {
      const response = await activityApi.list('')
      console.log('Activity response:', response)

      let activityList: ActivityLog[] = []
      const data: any = response.data
      if (Array.isArray(data)) {
        activityList = data
      } else if (data?.activities && Array.isArray(data.activities)) {
        activityList = data.activities
      }

      setActivities(activityList)
      setError('')
    } catch (err: any) {
      console.error('Failed to load activities:', err)
      setError(err.message || 'Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-100 text-green-700'
      case 'updated': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-purple-100 text-purple-700'
      case 'deleted': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'workflow': return <FileText size={16} />
      case 'step': return <Clock size={16} />
      case 'comment': return <MessageCircle size={16} />
      default: return <History size={16} />
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <History size={32} />
          Activity Logs
        </h1>
        <button
          onClick={loadActivities}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          title="Refresh"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin text-blue-600" size={32} />
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <History size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No activity yet</h3>
            <p>Activity logs will appear here when you create or update workflows.</p>
          </div>
        ) : (
          <div className="divide-y">
            {activities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                    {getEntityIcon(activity.entity_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getActionColor(activity.action)}`}>
                        {activity.action}
                      </span>
                      <span className="text-sm text-gray-500 capitalize">
                        {activity.entity_type}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{activity.details || 'Action performed'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && activities.length > 0 && (
        <p className="mt-4 text-sm text-gray-500">
          Showing {activities.length} activity {activities.length !== 1 ? 'logs' : 'log'}
        </p>
      )}
    </div>
  )
}