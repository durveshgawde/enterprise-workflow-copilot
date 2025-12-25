'use client'

import { useActivity } from '@/lib/hooks/useActivity'
import { History } from 'lucide-react'

export default function ActivityPage() {
  const { activities, loading } = useActivity('default-org')

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <History size={32} />
        Activity Logs
      </h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading activity...</div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No activity yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Entity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                        {activity.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{activity.entity_type}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {activity.user_id || 'System'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(activity.created_at).toLocaleString()}
                    </td>
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