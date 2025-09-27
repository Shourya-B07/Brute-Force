'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Download,
  Plus,
  Settings,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalTeachers: number
  totalStudents: number
  totalSubjects: number
  activeTimetables: number
  attendanceRate: number
  atRiskStudents: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTeachers: 0,
    totalStudents: 0,
    totalSubjects: 0,
    activeTimetables: 0,
    attendanceRate: 0,
    atRiskStudents: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading dashboard data
    setTimeout(() => {
      setStats({
        totalTeachers: 12,
        totalStudents: 245,
        totalSubjects: 8,
        activeTimetables: 6,
        attendanceRate: 87.5,
        atRiskStudents: 8
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your school's timetable and resources</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTeachers}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubjects}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Timetables</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeTimetables}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-cyan-600" />
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/admin/timetable"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="h-5 w-5 text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Generate Timetable</p>
                <p className="text-sm text-gray-600">Create new schedules</p>
              </div>
            </Link>

            <Link
              href="/admin/syllabus"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BookOpen className="h-5 w-5 text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Upload Syllabus</p>
                <p className="text-sm text-gray-600">Auto-generate from PDF</p>
              </div>
            </Link>

            <Link
              href="/admin/teachers"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-5 w-5 text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Manage Teachers</p>
                <p className="text-sm text-gray-600">Add/edit teachers</p>
              </div>
            </Link>

            <Link
              href="/admin/students"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-5 w-5 text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Manage Students</p>
                <p className="text-sm text-gray-600">Add/edit students</p>
              </div>
            </Link>

            <Link
              href="/admin/reports"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="h-5 w-5 text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">View Reports</p>
                <p className="text-sm text-gray-600">Analytics & insights</p>
              </div>
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-5 w-5 text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Settings</p>
                <p className="text-sm text-gray-600">Configure system</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New timetable generated</p>
                <p className="text-xs text-gray-600">Grade 10A - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Syllabus uploaded</p>
                <p className="text-xs text-gray-600">Mathematics - 4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Teacher added</p>
                <p className="text-xs text-gray-600">John Smith - 1 day ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Conflict detected</p>
                <p className="text-xs text-gray-600">Grade 11B timetable - 2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
