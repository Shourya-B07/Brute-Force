'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, BookOpen, AlertTriangle, CheckCircle, Download } from 'lucide-react'
import TimetableGrid from './TimetableGrid'
import ConflictResolution from './ConflictResolution'

interface TimetableConstraints {
  maxHoursPerDay: number
  maxHoursPerWeek: number
  breakTime: number
  lunchBreak: { start: string; end: string }
  workingHours: { start: string; end: string }
}

interface GeneratedTimetable {
  slots: any[]
  conflicts: any[]
  totalSlots: number
  coverage: number
}

export default function TimetableGenerator() {
  const [constraints, setConstraints] = useState<TimetableConstraints>({
    maxHoursPerDay: 8,
    maxHoursPerWeek: 40,
    breakTime: 15,
    lunchBreak: { start: '12:00', end: '13:00' },
    workingHours: { start: '08:00', end: '17:00' }
  })

  const [timetable, setTimetable] = useState<GeneratedTimetable | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedClass, setSelectedClass] = useState('Grade 10A')

  const classes = ['Grade 10A', 'Grade 10B', 'Grade 11A', 'Grade 11B', 'Grade 12A', 'Grade 12B']
  const subjects = [
    { id: '1', name: 'Mathematics', duration: 60, teacher: 'John Smith', room: 'Room 101' },
    { id: '2', name: 'Physics', duration: 60, teacher: 'John Smith', room: 'Physics Lab' },
    { id: '3', name: 'English', duration: 45, teacher: 'Jane Doe', room: 'Room 102' },
    { id: '4', name: 'Literature', duration: 45, teacher: 'Jane Doe', room: 'Room 102' }
  ]

  const generateTimetable = async () => {
    setLoading(true)
    
    // Simulate timetable generation
    setTimeout(() => {
      const mockTimetable: GeneratedTimetable = {
        slots: [
          {
            id: '1',
            day: 1,
            startTime: '09:00',
            endTime: '10:00',
            subject: 'Mathematics',
            teacher: 'John Smith',
            room: 'Room 101',
            class: selectedClass
          },
          {
            id: '2',
            day: 1,
            startTime: '10:15',
            endTime: '11:15',
            subject: 'Physics',
            teacher: 'John Smith',
            room: 'Physics Lab',
            class: selectedClass
          },
          {
            id: '3',
            day: 1,
            startTime: '11:30',
            endTime: '12:15',
            subject: 'English',
            teacher: 'Jane Doe',
            room: 'Room 102',
            class: selectedClass
          },
          {
            id: '4',
            day: 2,
            startTime: '09:00',
            endTime: '10:00',
            subject: 'Mathematics',
            teacher: 'John Smith',
            room: 'Room 101',
            class: selectedClass
          },
          {
            id: '5',
            day: 2,
            startTime: '10:15',
            endTime: '11:00',
            subject: 'Literature',
            teacher: 'Jane Doe',
            room: 'Room 102',
            class: selectedClass
          }
        ],
        conflicts: [
          {
            type: 'teacher_conflict',
            message: 'Teacher John Smith has overlapping classes on Tuesday',
            severity: 'medium'
          }
        ],
        totalSlots: 5,
        coverage: 85
      }
      
      setTimetable(mockTimetable)
      setLoading(false)
    }, 2000)
  }

  const exportTimetable = () => {
    // Implement PDF/Excel export
    console.log('Exporting timetable...')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Timetable Generator</h1>
          <p className="text-gray-600">Generate optimized, conflict-free schedules automatically</p>
        </div>
        <button
          onClick={exportTimetable}
          className="btn-primary flex items-center gap-2"
          disabled={!timetable}
        >
          <Download className="h-4 w-4" />
          Export Timetable
        </button>
      </div>

      {/* Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Class Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Selection</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {classes.map(className => (
                <button
                  key={className}
                  onClick={() => setSelectedClass(className)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    selectedClass === className
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {className}
                </button>
              ))}
            </div>
          </div>

          {/* Constraints */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Constraints</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Hours Per Day
                </label>
                <input
                  type="number"
                  value={constraints.maxHoursPerDay}
                  onChange={(e) => setConstraints(prev => ({ ...prev, maxHoursPerDay: parseInt(e.target.value) }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Hours Per Week
                </label>
                <input
                  type="number"
                  value={constraints.maxHoursPerWeek}
                  onChange={(e) => setConstraints(prev => ({ ...prev, maxHoursPerWeek: parseInt(e.target.value) }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Break Time (minutes)
                </label>
                <input
                  type="number"
                  value={constraints.breakTime}
                  onChange={(e) => setConstraints(prev => ({ ...prev, breakTime: parseInt(e.target.value) }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Working Hours
                </label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={constraints.workingHours.start}
                    onChange={(e) => setConstraints(prev => ({ 
                      ...prev, 
                      workingHours: { ...prev.workingHours, start: e.target.value }
                    }))}
                    className="input-field"
                  />
                  <input
                    type="time"
                    value={constraints.workingHours.end}
                    onChange={(e) => setConstraints(prev => ({ 
                      ...prev, 
                      workingHours: { ...prev.workingHours, end: e.target.value }
                    }))}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <button
              onClick={generateTimetable}
              disabled={loading}
              className="btn-primary px-8 py-3 text-lg flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Calendar className="h-5 w-5" />
                  Generate Timetable
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subjects */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subjects</h3>
            <div className="space-y-3">
              {subjects.map(subject => (
                <div key={subject.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{subject.name}</p>
                    <p className="text-sm text-gray-600">{subject.teacher} • {subject.room}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{subject.duration}m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          {timetable && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Slots</span>
                  <span className="font-medium">{timetable.totalSlots}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Coverage</span>
                  <span className="font-medium">{timetable.coverage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Conflicts</span>
                  <span className={`font-medium ${timetable.conflicts.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {timetable.conflicts.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generated Timetable */}
      {timetable && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Generated Timetable</h3>
            <div className="flex items-center gap-2">
              {timetable.conflicts.length === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <span className="text-sm text-gray-600">
                {timetable.conflicts.length === 0 ? 'No conflicts' : `${timetable.conflicts.length} conflicts`}
              </span>
            </div>
          </div>
          
          <TimetableGrid slots={timetable.slots} />
          
          {timetable.conflicts.length > 0 && (
            <ConflictResolution conflicts={timetable.conflicts} />
          )}
        </div>
      )}
    </div>
  )
}
