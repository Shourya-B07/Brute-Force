import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  name: string
  created_at: string
  updated_at: string
}

export interface Teacher {
  id: string
  user_id: string
  name: string
  email: string
  subjects: string[]
  max_hours_per_day: number
  max_hours_per_week: number
  availability: Availability[]
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  user_id: string
  name: string
  email: string
  class_name: string
  subjects: string[]
  created_at: string
  updated_at: string
}

export interface Subject {
  id: string
  name: string
  code: string
  duration: number // in minutes
  prerequisites: string[]
  room_requirements: string[]
  created_at: string
  updated_at: string
}

export interface Room {
  id: string
  name: string
  capacity: number
  equipment: string[]
  location: string
  created_at: string
  updated_at: string
}

export interface Timetable {
  id: string
  name: string
  class_name: string
  semester: string
  academic_year: string
  is_locked: boolean
  created_at: string
  updated_at: string
}

export interface TimetableSlot {
  id: string
  timetable_id: string
  day_of_week: number // 0-6 (Sunday-Saturday)
  start_time: string
  end_time: string
  subject_id: string
  teacher_id: string
  room_id: string
  class_name: string
  created_at: string
  updated_at: string
}

export interface Attendance {
  id: string
  student_id: string
  teacher_id: string
  subject_id: string
  date: string
  status: 'present' | 'absent' | 'late'
  notes?: string
  created_at: string
  updated_at: string
}

export interface Availability {
  day_of_week: number
  start_time: string
  end_time: string
}

export interface Syllabus {
  id: string
  name: string
  file_url: string
  subjects: string[]
  topics: string[]
  durations: number[]
  prerequisites: string[]
  created_at: string
  updated_at: string
}
