'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, TrendingDown, User } from 'lucide-react'
import { getAtRiskStudents, type AtRiskStudent } from '@/lib/teacher-api'

export default function AtRiskStudents() {
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAtRiskStudents = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          throw new Error('User not found')
        }
        
        const user = JSON.parse(userStr)
        const teacherId = user.id
        
        const students = await getAtRiskStudents(teacherId)
        setAtRiskStudents(students)
      } catch (err) {
        console.error('Error loading at-risk students:', err)
        setError(err instanceof Error ? err.message : 'Failed to load at-risk students')
      } finally {
        setLoading(false)
      }
    }

    loadAtRiskStudents()
  }, [])

  const getRiskLevel = (rate: number) => {
    if (rate < 60) return { level: 'Critical', color: 'text-red-600', bg: 'bg-red-100' }
    if (rate < 75) return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-100' }
    return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <User className="h-4 w-4 text-gray-300" />
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <AlertTriangle className="h-4 w-4 text-gray-300" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-xl mb-4">⚠️</div>
        <p className="text-gray-500 mb-2">Error loading at-risk students</p>
        <p className="text-sm text-gray-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {atRiskStudents.map((student) => {
        const risk = getRiskLevel(student.attendanceRate)
        return (
          <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{student.name}</p>
                <p className="text-sm text-gray-600">{student.subject}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{student.attendanceRate}%</p>
                <p className="text-xs text-gray-500">Last seen: {student.lastSeen}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${risk.bg} ${risk.color}`}>
                  {risk.level}
                </span>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
            </div>
          </div>
        )
      })}
      
      {atRiskStudents.length === 0 && (
        <div className="text-center py-8">
          <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No at-risk students found</p>
          <p className="text-sm text-gray-400">All students are maintaining good attendance</p>
        </div>
      )}
    </div>
  )
}
