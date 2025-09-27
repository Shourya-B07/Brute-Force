'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, User } from 'lucide-react'
import { getRecentAttendance, type RecentAttendanceRecord } from '@/lib/teacher-api'

export default function RecentAttendance() {
  const [recentAttendance, setRecentAttendance] = useState<RecentAttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRecentAttendance = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          throw new Error('User not found')
        }
        
        const user = JSON.parse(userStr)
        const teacherId = user.id
        
        const attendance = await getRecentAttendance(teacherId, 10)
        setRecentAttendance(attendance)
      } catch (err) {
        console.error('Error loading recent attendance:', err)
        setError(err instanceof Error ? err.message : 'Failed to load recent attendance')
      } finally {
        setLoading(false)
      }
    }

    loadRecentAttendance()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'text-green-600 bg-green-100'
      case 'late':
        return 'text-yellow-600 bg-yellow-100'
      case 'absent':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusCounts = () => {
    const counts = recentAttendance.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      present: counts.present || 0,
      late: counts.late || 0,
      absent: counts.absent || 0,
      total: recentAttendance.length
    }
  }

  const statusCounts = getStatusCounts()

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="ml-4">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-xl mb-4">⚠️</div>
        <p className="text-gray-500 mb-2">Error loading recent attendance</p>
        <p className="text-sm text-gray-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">{statusCounts.total}</p>
          <p className="text-xs text-gray-600">Total</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-green-600">{statusCounts.present}</p>
          <p className="text-xs text-gray-600">Present</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-yellow-600">{statusCounts.late}</p>
          <p className="text-xs text-gray-600">Late</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-red-600">{statusCounts.absent}</p>
          <p className="text-xs text-gray-600">Absent</p>
        </div>
      </div>

      {/* Recent Records */}
      <div className="space-y-3">
        {recentAttendance.map((record) => (
          <div key={record.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(record.status)}
              <div>
                <p className="font-medium text-gray-900">{record.student}</p>
                <p className="text-sm text-gray-600">{record.subject}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{record.date}</p>
              <p className="text-xs text-gray-600">{record.time}</p>
            </div>
            <div className="ml-4">
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(record.status)}`}>
                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="pt-4 border-t border-gray-200">
        <button className="w-full py-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
          View All Attendance Records
        </button>
      </div>
    </div>
  )
}
