'use client'

import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { getAttendanceTrends, type AttendanceTrend } from '@/lib/teacher-api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function AttendanceChart() {
  const [trends, setTrends] = useState<AttendanceTrend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly')

  useEffect(() => {
    const loadAttendanceTrends = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          throw new Error('User not found')
        }
        
        const user = JSON.parse(userStr)
        const teacherId = user.id
        
        const attendanceTrends = await getAttendanceTrends(teacherId, period)
        setTrends(attendanceTrends)
      } catch (err) {
        console.error('Error loading attendance trends:', err)
        setError(err instanceof Error ? err.message : 'Failed to load attendance trends')
      } finally {
        setLoading(false)
      }
    }

    loadAttendanceTrends()
  }, [period])

  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: trends.map(trend => ({
      label: trend.subject,
      data: trend.data,
      borderColor: trend.color,
      backgroundColor: trend.color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
      tension: 0.4,
    })),
  }

  const options = {
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
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">⚠️</div>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (trends.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">📊</div>
          <p className="text-sm text-gray-600">No attendance data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <Line data={data} options={options} />
    </div>
  )
}
