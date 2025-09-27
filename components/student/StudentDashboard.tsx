'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Link from 'next/link'

interface StudentStats {
  attendanceRate: number
  totalClasses: number
  presentClasses: number
  upcomingClasses: number
}

interface UpcomingClass {
  id: string
  subject: string
  teacher: string
  room: string
  time: string
  date: string
}

export default function StudentDashboard() {
  const [stats, setStats] = useState<StudentStats>({
    attendanceRate: 0,
    totalClasses: 0,
    presentClasses: 0,
    upcomingClasses: 0
  })
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading student data
    setTimeout(() => {
      setStats({
        attendanceRate: 92.5,
        totalClasses: 20,
        presentClasses: 18,
        upcomingClasses: 3
      })
      
      setUpcomingClasses([
        {
          id: '1',
          subject: 'Mathematics',
          teacher: 'John Smith',
          room: 'Room 101',
          time: '09:00 AM',
          date: 'Today'
        },
        {
          id: '2',
          subject: 'Physics',
          teacher: 'John Smith',
          room: 'Physics Lab',
          time: '10:15 AM',
          date: 'Today'
        },
        {
          id: '3',
          subject: 'English',
          teacher: 'Jane Doe',
          room: 'Room 102',
          time: '11:30 AM',
          date: 'Today'
        }
      ])
      
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your academic overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-2xl font-bold text-gray-900">{stats.presentClasses}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingClasses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
            <Link
              href="/student/timetable"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View Full Timetable
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingClasses.map((classItem) => (
              <div key={classItem.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">{classItem.subject}</p>
                    <p className="text-sm text-gray-600">{classItem.teacher} • {classItem.room}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{classItem.time}</p>
                  <p className="text-xs text-gray-600">{classItem.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/student/timetable"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="h-5 w-5 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">View Timetable</p>
                <p className="text-sm text-gray-600">Check your weekly schedule</p>
              </div>
            </Link>

            <Link
              href="/student/attendance"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="h-5 w-5 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">Attendance Report</p>
                <p className="text-sm text-gray-600">View your attendance history</p>
              </div>
            </Link>

            <Link
              href="/student/grades"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BookOpen className="h-5 w-5 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">View Grades</p>
                <p className="text-sm text-gray-600">Check your academic progress</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.presentClasses}</p>
            <p className="text-sm text-gray-600">Present Classes</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.totalClasses - stats.presentClasses}</p>
            <p className="text-sm text-gray-600">Absent Classes</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.attendanceRate}%</p>
            <p className="text-sm text-gray-600">Overall Attendance</p>
          </div>
        </div>
      </div>
    </div>
  )
}
