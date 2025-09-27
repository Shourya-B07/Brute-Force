'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Users, BookOpen, ChevronLeft, ChevronRight, Upload, FileText, X } from 'lucide-react'
import { getTeacherTimetable, type TimetableSlot } from '@/lib/teacher-api'
import SyllabusUpload from './SyllabusUpload'
import { parseSyllabusPDF, generateOptimalTimetable, type ParsedSyllabus, type TimetableSlot as GeneratedSlot } from '@/lib/syllabus-parser'

export default function TeacherTimetable() {
  const [timetable, setTimetable] = useState<TimetableSlot[]>([])
  const [generatedTimetable, setGeneratedTimetable] = useState<GeneratedSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentWeek, setCurrentWeek] = useState(0)
  const [showSyllabusUpload, setShowSyllabusUpload] = useState(false)
  const [parsedSyllabus, setParsedSyllabus] = useState<ParsedSyllabus | null>(null)
  const [viewMode, setViewMode] = useState<'existing' | 'generated'>('existing')

  useEffect(() => {
    const loadTimetable = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          throw new Error('User not found')
        }
        
        const user = JSON.parse(userStr)
        const teacherId = user.id
        
        const timetableData = await getTeacherTimetable(teacherId)
        setTimetable(timetableData)
      } catch (err) {
        console.error('Error loading timetable:', err)
        setError(err instanceof Error ? err.message : 'Failed to load timetable')
      } finally {
        setLoading(false)
      }
    }

    loadTimetable()
  }, [])

  const getWeekDates = (weekOffset: number) => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (weekOffset * 7)) // Monday
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // Sunday
    
    return { startOfWeek, endOfWeek }
  }

  const { startOfWeek, endOfWeek } = getWeekDates(currentWeek)
  
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => direction === 'prev' ? prev - 1 : prev + 1)
  }

  const handleSyllabusProcessed = async (syllabusData: any) => {
    try {
      setLoading(true)
      setError(null)
      console.log('Processing syllabus data:', syllabusData)
      console.log('Number of subjects in syllabus:', syllabusData.subjects?.length || 0)
      console.log('Subjects in syllabus:', syllabusData.subjects?.map((s: any) => s.name) || [])
      
      // Check if we have subjects to generate timetable
      if (!syllabusData.subjects || syllabusData.subjects.length === 0) {
        throw new Error('No subjects found in syllabus data')
      }
      
      const generated = generateOptimalTimetable(syllabusData)
      console.log('Generated timetable:', generated)
      console.log('Number of timetable slots:', generated.length)
      
      if (generated.length === 0) {
        throw new Error('No timetable slots were generated')
      }
      
      setGeneratedTimetable(generated)
      setParsedSyllabus(syllabusData)
      setViewMode('generated')
      setShowSyllabusUpload(false)
    } catch (err) {
      console.error('Error processing syllabus:', err)
      setError(`Failed to generate timetable from syllabus: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const getSlotForTimeAndDay = (time: string, dayIndex: number) => {
    const dayName = weekDays[dayIndex]
    
    if (viewMode === 'generated') {
      // For generated timetable, we need to map day names to indices
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      const dayName = dayNames[dayIndex]
      
      return generatedTimetable.find(slot => 
        slot.day === dayName && 
        slot.startTime === time
      )
    } else {
      // For existing timetable
      return timetable.find(slot => 
        slot.day_of_week === dayIndex && 
        slot.start_time === time
      )
    }
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
        <div className="animate-pulse h-96 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Timetable</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">My Timetable</h1>
          <p className="text-gray-600">View your weekly schedule and class details</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSyllabusUpload(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Generate from Syllabus
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {startOfWeek.toLocaleDateString()} - {endOfWeek.toLocaleDateString()}
            </span>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      {parsedSyllabus && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">View Mode:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('existing')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === 'existing' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Existing Timetable
                </button>
                <button
                  onClick={() => setViewMode('generated')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === 'generated' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Generated from Syllabus
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {viewMode === 'generated' && parsedSyllabus && (
                <span>
                  Generated from: <strong>{parsedSyllabus.title}</strong> 
                  ({parsedSyllabus.subjects.length} subjects, {Math.round(parsedSyllabus.totalDuration / 60)} hours)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Syllabus Upload Modal */}
      {showSyllabusUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Generate Timetable from Syllabus</h2>
              <button
                onClick={() => setShowSyllabusUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <SyllabusUpload onSyllabusProcessed={handleSyllabusProcessed} />
          </div>
        </div>
      )}

      {/* Timetable Grid */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700 w-20">Time</th>
                {weekDays.map((day, index) => (
                  <th key={day} className="text-center py-3 px-2 font-medium text-gray-700 min-w-32">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time} className="border-t border-gray-200">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {time}
                  </td>
                  {weekDays.map((day, dayIndex) => {
                    const slot = getSlotForTimeAndDay(time, dayIndex)
                    return (
                      <td key={`${day}-${time}`} className="py-3 px-2">
                        {slot ? (
                          <div className={`border rounded-lg p-3 text-center ${
                            viewMode === 'generated' 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-primary-50 border-primary-200'
                          }`}>
                            <div className="flex items-center justify-center mb-2">
                              <BookOpen className={`h-4 w-4 mr-1 ${
                                viewMode === 'generated' ? 'text-green-600' : 'text-primary-600'
                              }`} />
                              <span className={`text-sm font-medium ${
                                viewMode === 'generated' ? 'text-green-900' : 'text-primary-900'
                              }`}>
                                {viewMode === 'generated' ? (slot as any).subject : (slot as any).subject_name}
                              </span>
                            </div>
                            {viewMode === 'generated' ? (
                              <div className="space-y-1">
                                <div className="text-xs text-gray-600">
                                  {(slot as any).topic}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {(slot as any).startTime} - {(slot as any).endTime}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Week {(slot as any).week}
                                </div>
                                {(slot as any).credits && (
                                  <div className="text-xs text-blue-600 font-medium">
                                    {(slot as any).credits} credits
                                  </div>
                                )}
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center justify-center mb-1">
                                  <Users className="h-3 w-3 text-gray-500 mr-1" />
                                  <span className="text-xs text-gray-600">
                                    {(slot as any).class_name}
                                  </span>
                                </div>
                                <div className="flex items-center justify-center">
                                  <MapPin className="h-3 w-3 text-gray-500 mr-1" />
                                  <span className="text-xs text-gray-600">
                                    {(slot as any).room_name}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {(slot as any).start_time} - {(slot as any).end_time}
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="h-16 border border-gray-100 rounded-lg bg-gray-50"></div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">
                {viewMode === 'generated' ? generatedTimetable.length : timetable.length}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {viewMode === 'generated' 
                  ? new Set(generatedTimetable.map(slot => slot.subject)).size
                  : new Set(timetable.map(slot => slot.subject_name)).size
                }
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Classes</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(timetable.map(slot => slot.class_name)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hours/Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {timetable.reduce((total, slot) => {
                  const start = new Date(`2000-01-01T${slot.start_time}`)
                  const end = new Date(`2000-01-01T${slot.end_time}`)
                  return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                }, 0).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
