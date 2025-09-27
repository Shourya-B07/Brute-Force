'use client'

import { useState, useEffect } from 'react'
import { getAttendanceHeatmap, type AttendanceHeatmapData } from '@/lib/teacher-api'

export default function AttendanceHeatmap() {
  const [selectedWeek, setSelectedWeek] = useState(0)
  const [heatmapData, setHeatmapData] = useState<AttendanceHeatmapData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadHeatmapData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          throw new Error('User not found')
        }
        
        const user = JSON.parse(userStr)
        const teacherId = user.id
        
        const data = await getAttendanceHeatmap(teacherId, selectedWeek)
        setHeatmapData(data)
      } catch (err) {
        console.error('Error loading heatmap data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load heatmap data')
      } finally {
        setLoading(false)
      }
    }

    loadHeatmapData()
  }, [selectedWeek])

  const weeks = [
    { label: 'Week 1', offset: 0 },
    { label: 'Week 2', offset: 1 },
    { label: 'Week 3', offset: 2 },
    { label: 'Week 4', offset: 3 }
  ]

  const currentWeek = heatmapData
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-500'
      case 'late':
        return 'bg-yellow-500'
      case 'absent':
        return 'bg-red-500'
      default:
        return 'bg-gray-200'
    }
  }

  const getStatusCount = (status: string) => {
    return currentWeek.reduce((count, student) => {
      return count + Object.values(student.days).filter(s => s === status).length
    }, 0)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse h-8 bg-gray-200 rounded w-16"></div>
          ))}
        </div>
        <div className="animate-pulse h-32 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-xl mb-4">⚠️</div>
        <p className="text-gray-500 mb-2">Error loading heatmap data</p>
        <p className="text-sm text-gray-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Week Selector */}
      <div className="flex gap-2">
        {weeks.map((week, index) => (
          <button
            key={index}
            onClick={() => setSelectedWeek(index)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              selectedWeek === index
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {week.label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Present ({getStatusCount('present')})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Late ({getStatusCount('late')})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Absent ({getStatusCount('absent')})</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left py-2 pr-4 font-medium text-gray-700">Student</th>
              {days.map(day => (
                <th key={day} className="text-center py-2 px-1 font-medium text-gray-700">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentWeek.map((student, index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="py-2 pr-4 text-sm font-medium text-gray-900">
                  {student.student}
                </td>
                {days.map(day => (
                  <td key={day} className="py-2 px-1">
                    <div
                      className={`w-6 h-6 rounded ${getStatusColor(student.days[day])} mx-auto`}
                      title={`${student.student} - ${day}: ${student.days[day]}`}
                    ></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{getStatusCount('present')}</p>
          <p className="text-sm text-gray-600">Present</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-600">{getStatusCount('late')}</p>
          <p className="text-sm text-gray-600">Late</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">{getStatusCount('absent')}</p>
          <p className="text-sm text-gray-600">Absent</p>
        </div>
      </div>
    </div>
  )
}
