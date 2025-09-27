'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, CheckCircle, XCircle, Clock, Download, Filter, Search } from 'lucide-react'
import { getTeacherAttendance, type AttendanceRecord } from '@/lib/teacher-api'

export default function TeacherAttendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          throw new Error('User not found')
        }
        
        const user = JSON.parse(userStr)
        const teacherId = user.id
        
        const attendanceData = await getTeacherAttendance(teacherId, selectedDate)
        setAttendance(attendanceData)
      } catch (err) {
        console.error('Error loading attendance:', err)
        setError(err instanceof Error ? err.message : 'Failed to load attendance')
      } finally {
        setLoading(false)
      }
    }

    loadAttendance()
  }, [selectedDate])

  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = record.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Users className="h-5 w-5 text-gray-500" />
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
    const counts = attendance.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      present: counts.present || 0,
      late: counts.late || 0,
      absent: counts.absent || 0,
      total: attendance.length
    }
  }

  const statusCounts = getStatusCounts()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="animate-pulse h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="animate-pulse h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="animate-pulse h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="animate-pulse h-96 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Attendance</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Track and manage student attendance</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
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
              <p className="text-2xl font-bold text-gray-900">{statusCounts.present}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Late</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.late}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.absent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students or subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Student</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Subject</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((record) => (
                <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {record.student.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{record.student}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                      {record.subject}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">{record.date}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getStatusIcon(record.status)}
                      <span className={`px-2 py-1 text-sm rounded-full ${getStatusColor(record.status)}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">{record.time}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-500">
                      {record.notes || 'No notes'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAttendance.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
