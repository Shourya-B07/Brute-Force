'use client'

import { useState, useEffect } from 'react'
import { Users, Search, Filter, Download, Eye, AlertTriangle, TrendingUp, Calendar } from 'lucide-react'
import { getTeacherStudents, type StudentData } from '@/lib/teacher-api'

export default function TeacherStudents() {
  const [students, setStudents] = useState<StudentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          throw new Error('User not found')
        }
        
        const user = JSON.parse(userStr)
        const teacherId = user.id
        
        const studentsData = await getTeacherStudents(teacherId)
        setStudents(studentsData)
      } catch (err) {
        console.error('Error loading students:', err)
        setError(err instanceof Error ? err.message : 'Failed to load students')
      } finally {
        setLoading(false)
      }
    }

    loadStudents()
  }, [])

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = filterClass === 'all' || student.class_name === filterClass
    return matchesSearch && matchesClass
  })

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'attendance':
        return b.attendance_rate - a.attendance_rate
      case 'class':
        return a.class_name.localeCompare(b.class_name)
      default:
        return 0
    }
  })

  const uniqueClasses = Array.from(new Set(students.map(s => s.class_name)))

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-100'
    if (rate >= 75) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getRiskLevel = (rate: number) => {
    if (rate < 60) return 'Critical'
    if (rate < 75) return 'High'
    return 'Good'
  }

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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Students</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
          <p className="text-gray-600">Manage and monitor your students' progress</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export List
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
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.attendance_rate, 0) / students.length) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Classes</p>
              <p className="text-2xl font-bold text-gray-900">{uniqueClasses.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">At-Risk</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.filter(s => s.attendance_rate < 75).length}
              </p>
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
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Classes</option>
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="name">Sort by Name</option>
              <option value="attendance">Sort by Attendance</option>
              <option value="class">Sort by Class</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Student</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Class</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Subjects</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Attendance</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Risk Level</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">
                      {student.class_name}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {student.subjects.slice(0, 2).map((subject, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {subject}
                        </span>
                      ))}
                      {student.subjects.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{student.subjects.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-2 py-1 text-sm rounded-full ${getAttendanceColor(student.attendance_rate)}`}>
                      {student.attendance_rate}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      getRiskLevel(student.attendance_rate) === 'Critical' ? 'bg-red-100 text-red-800' :
                      getRiskLevel(student.attendance_rate) === 'High' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {getRiskLevel(student.attendance_rate)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedStudents.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
