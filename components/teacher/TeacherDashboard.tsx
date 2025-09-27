'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Download,
  Eye,
  Clock
} from 'lucide-react'
import AttendanceChart from './AttendanceChart'
import AtRiskStudents from './AtRiskStudents'
import AttendanceHeatmap from './AttendanceHeatmap'
import RecentAttendance from './RecentAttendance'
import { getTeacherDashboardStats, type TeacherDashboardData } from '@/lib/teacher-api'

export default function TeacherDashboard() {
  const [stats, setStats] = useState<TeacherDashboardData>({
    totalStudents: 0,
    totalSubjects: 0,
    attendanceRate: 0,
    atRiskStudents: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get current user from localStorage
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          throw new Error('User not found')
        }
        
        const user = JSON.parse(userStr)
        if (user.role !== 'teacher') {
          throw new Error('Access denied: Teacher role required')
        }

        // Get teacher ID from user data
        const teacherId = user.id
        
        const dashboardStats = await getTeacherDashboardStats(teacherId)
        setStats(dashboardStats)
      } catch (err) {
        console.error('Error loading dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const handleExportReport = (): void => {
    // Implement PDF/Excel export
    console.log('Exporting attendance report...')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your class overview.</p>
        </div>
        <button
          onClick={handleExportReport}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubjects}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">At-Risk Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.atRiskStudents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Attendance Trends</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-md">
                Weekly
              </button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md">
                Monthly
              </button>
            </div>
          </div>
          <AttendanceChart />
        </div>

        {/* At-Risk Students */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">At-Risk Students</h3>
            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
              {stats.atRiskStudents} students
            </span>
          </div>
          <AtRiskStudents />
        </div>
      </div>

      {/* Attendance Heatmap and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Heatmap</h3>
          <AttendanceHeatmap />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h3>
          <RecentAttendance />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="h-5 w-5 text-primary-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Mark Attendance</p>
              <p className="text-sm text-gray-600">Record today's attendance</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Eye className="h-5 w-5 text-primary-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">View Timetable</p>
              <p className="text-sm text-gray-600">Check your schedule</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Clock className="h-5 w-5 text-primary-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Update Availability</p>
              <p className="text-sm text-gray-600">Manage your schedule</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
