'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface TimetableSlot {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  subject_name: string
  teacher_name: string
  room_name: string
  class_name: string
}

interface Syllabus {
  id: string
  name: string
  file_url: string
  subjects: string[]
  topics: string[]
  durations: number[]
  prerequisites: string[]
}

export default function StudentTimetable() {
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null)
  const [timetable, setTimetable] = useState<TimetableSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ]

  useEffect(() => {
    fetchTimetable()
  }, [])

  const fetchTimetable = async () => {
    try {
      setLoading(true)
      const { data: timetableData, error } = await supabase
        .from('timetable_slots')
        .select(`
          *,
          subjects(name),
          teachers(name),
          rooms(name)
        `)
        .eq('class_name', 'Grade 10A')

      if (error) throw error

      const formattedTimetable = timetableData?.map(slot => ({
        id: slot.id,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        subject_name: slot.subjects?.name || 'N/A',
        teacher_name: slot.teachers?.name || 'N/A',
        room_name: slot.rooms?.name || 'N/A',
        class_name: slot.class_name
      })) || []

      setTimetable(formattedTimetable)
    } catch (err) {
      console.error('Error fetching timetable:', err)
      setError('Failed to load timetable')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setError('')

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `syllabus/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('syllabus-files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('syllabus-files')
        .getPublicUrl(filePath)

      // Parse syllabus content (simplified - in real app, use PDF parser)
      const syllabusData = {
        name: file.name,
        file_url: publicUrl,
        subjects: ['Mathematics', 'Physics', 'English', 'Literature'], // Extracted from syllabus
        topics: ['Algebra', 'Mechanics', 'Grammar', 'Poetry'], // Extracted from syllabus
        durations: [60, 60, 45, 45], // Extracted from syllabus
        prerequisites: ['Basic Math', 'Basic Science', 'Basic English', 'Basic Literature']
      }

      // Save syllabus to database
      const { data: syllabusResult, error: syllabusError } = await supabase
        .from('syllabus')
        .insert([syllabusData])
        .select()
        .single()

      if (syllabusError) throw syllabusError

      setSyllabus(syllabusResult)

      // Generate timetable automatically
      await generateTimetable(syllabusResult)

    } catch (err) {
      console.error('Error uploading syllabus:', err)
      setError('Failed to upload syllabus')
    } finally {
      setUploading(false)
    }
  }

  const generateTimetable = async (syllabusData: Syllabus) => {
    try {
      setLoading(true)

      // Get existing timetable or create new one
      let { data: timetableData, error: timetableError } = await supabase
        .from('timetables')
        .select('*')
        .eq('class_name', 'Grade 10A')
        .single()

      if (timetableError && timetableError.code !== 'PGRST116') {
        throw timetableError
      }

      if (!timetableData) {
        // Create new timetable
        const { data: newTimetable, error: createError } = await supabase
          .from('timetables')
          .insert([{
            name: 'Grade 10A Timetable',
            class_name: 'Grade 10A',
            semester: 'Fall 2024',
            academic_year: '2024-2025'
          }])
          .select()
          .single()

        if (createError) throw createError
        timetableData = newTimetable
      }

      // Get teachers and rooms
      const { data: teachers } = await supabase.from('teachers').select('*')
      const { data: rooms } = await supabase.from('rooms').select('*')
      const { data: subjects } = await supabase.from('subjects').select('*')

      if (!teachers || !rooms || !subjects) {
        throw new Error('Missing teachers, rooms, or subjects')
      }

      // Generate timetable slots
      const slots = []
      const subjectsToSchedule = syllabusData.subjects.slice(0, 4) // Limit to 4 subjects
      
      for (let day = 1; day <= 5; day++) { // Monday to Friday
        for (let i = 0; i < subjectsToSchedule.length; i++) {
          const subject = subjects.find(s => s.name === subjectsToSchedule[i])
          const teacher = teachers[i % teachers.length]
          const room = rooms[i % rooms.length]
          
          if (subject && teacher && room) {
            slots.push({
              timetable_id: timetableData.id,
              day_of_week: day,
              start_time: timeSlots[i + 1],
              end_time: timeSlots[i + 2],
              subject_id: subject.id,
              teacher_id: teacher.id,
              room_id: room.id,
              class_name: 'Grade 10A'
            })
          }
        }
      }

      // Insert timetable slots
      const { error: slotsError } = await supabase
        .from('timetable_slots')
        .insert(slots)

      if (slotsError) throw slotsError

      // Refresh timetable display
      await fetchTimetable()

    } catch (err) {
      console.error('Error generating timetable:', err)
      setError('Failed to generate timetable')
    } finally {
      setLoading(false)
    }
  }

  const getSlotForDayAndTime = (day: number, time: string) => {
    return timetable.find(slot => 
      slot.day_of_week === day && slot.start_time === time
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Timetable</h1>
          <p className="text-gray-600">View and manage your class schedule</p>
        </div>

        {/* Syllabus Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Syllabus</h2>
          <div className="flex items-center space-x-4">
            <label className="flex-1">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="syllabus-upload"
              />
              <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    {uploading ? 'Uploading...' : 'Click to upload syllabus (PDF, DOC, DOCX)'}
                  </p>
                </div>
              </div>
            </label>
          </div>
          
          {syllabus && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                <strong>Syllabus uploaded:</strong> {syllabus.name}
              </p>
              <p className="text-green-600 text-sm mt-1">
                Timetable has been automatically generated!
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Timetable Display */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Weekly Timetable</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading timetable...</span>
            </div>
          ) : timetable.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No timetable available</h3>
              <p className="mt-1 text-sm text-gray-500">Upload a syllabus to generate your timetable</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    {days.slice(1, 6).map((day, index) => (
                      <th key={day} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeSlots.slice(1, 6).map((time, timeIndex) => (
                    <tr key={time}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {time}
                      </td>
                      {[1, 2, 3, 4, 5].map((day) => {
                        const slot = getSlotForDayAndTime(day, time)
                        return (
                          <td key={day} className="px-6 py-4 whitespace-nowrap">
                            {slot ? (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="text-sm font-medium text-blue-900">{slot.subject_name}</div>
                                <div className="text-xs text-blue-700">{slot.teacher_name}</div>
                                <div className="text-xs text-blue-600">{slot.room_name}</div>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-sm">-</div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
