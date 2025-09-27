'use client'

import { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  BookOpen,
  Filter,
  RefreshCw
} from 'lucide-react'
import { getTeacherReports, type ReportData } from '@/lib/teacher-api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function TeacherReports() {
  const [reports, setReports] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('30') // days
  const [reportType, setReportType] = useState('attendance')

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          throw new Error('User not found')
        }
        
        const user = JSON.parse(userStr)
        const teacherId = user.id
        
        const reportsData = await getTeacherReports(teacherId, parseInt(dateRange))
        setReports(reportsData)
      } catch (err) {
        console.error('Error loading reports:', err)
        setError(err instanceof Error ? err.message : 'Failed to load reports')
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [dateRange, reportType])

  const attendanceChartData = {
    labels: reports?.attendanceTrends.map(trend => trend.period) || [],
    datasets: [
      {
        label: 'Attendance Rate (%)',
        data: reports?.attendanceTrends.map(trend => trend.rate) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  }

  const attendanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: number | string) {
            return value + '%'
          }
        }
      },
    },
  }

  const subjectChartData = {
    labels: reports?.subjectStats.map(subject => subject.name) || [],
    datasets: [
      {
        label: 'Average Attendance (%)',
        data: reports?.subjectStats.map(subject => subject.attendance_rate) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const subjectChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: number | string) {
            return value + '%'
          }
        }
      },
    },
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-pulse h-96 bg-gray-200 rounded"></div>
          <div className="animate-pulse h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Reports</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your teaching performance</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="attendance">Attendance Report</option>
              <option value="performance">Performance Report</option>
              <option value="summary">Summary Report</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{reports?.summary.totalStudents || 0}</p>
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
              <p className="text-2xl font-bold text-gray-900">{reports?.summary.avgAttendance || 0}%</p>
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
              <p className="text-2xl font-bold text-gray-900">{reports?.summary.totalSubjects || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Classes Taught</p>
              <p className="text-2xl font-bold text-gray-900">{reports?.summary.totalClasses || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Attendance Trends</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Bar data={attendanceChartData} options={attendanceChartOptions} />
          </div>
        </div>

        {/* Subject Performance */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Subject Performance</h3>
            <BookOpen className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Bar data={subjectChartData} options={subjectChartOptions} />
          </div>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Students */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Students</h3>
          <div className="space-y-3">
            {reports?.topStudents.map((student, index) => (
              <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-medium text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.class_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{student.attendance_rate}%</p>
                  <p className="text-sm text-gray-500">attendance</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* At-Risk Students */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Students Needing Attention</h3>
          <div className="space-y-3">
            {reports?.atRiskStudents.map((student, index) => (
              <div key={student.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-red-600 font-medium text-sm">!</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.class_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">{student.attendance_rate}%</p>
                  <p className="text-sm text-gray-500">attendance</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="h-5 w-5 text-primary-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Attendance Report</p>
              <p className="text-sm text-gray-600">Detailed attendance analysis</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Performance Report</p>
              <p className="text-sm text-gray-600">Student performance metrics</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="h-5 w-5 text-primary-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Schedule Report</p>
              <p className="text-sm text-gray-600">Teaching schedule analysis</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
