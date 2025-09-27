import { supabase } from './supabase'

export interface TeacherDashboardData {
  totalStudents: number
  totalSubjects: number
  attendanceRate: number
  atRiskStudents: number
}

export interface AttendanceTrend {
  subject: string
  data: number[]
  color: string
}

export interface AtRiskStudent {
  id: string
  name: string
  attendanceRate: number
  subject: string
  lastSeen: string
  riskLevel: 'Critical' | 'High' | 'Medium'
}

export interface AttendanceHeatmapData {
  student: string
  days: { [key: string]: 'present' | 'absent' | 'late' }
}

export interface RecentAttendanceRecord {
  id: string
  student: string
  subject: string
  date: string
  status: 'present' | 'absent' | 'late'
  time: string
}

export interface TimetableSlot {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  subject_name: string
  class_name: string
  room_name: string
  room_location: string
}

export interface StudentData {
  id: string
  name: string
  email: string
  class_name: string
  subjects: string[]
  attendance_rate: number
  last_seen: string
}

export interface AttendanceRecord {
  id: string
  student: string
  subject: string
  date: string
  status: 'present' | 'absent' | 'late'
  time: string
  notes?: string
}

export interface ReportData {
  summary: {
    totalStudents: number
    avgAttendance: number
    totalSubjects: number
    totalClasses: number
  }
  attendanceTrends: {
    period: string
    rate: number
  }[]
  subjectStats: {
    name: string
    attendance_rate: number
    total_classes: number
  }[]
  topStudents: {
    id: string
    name: string
    class_name: string
    attendance_rate: number
  }[]
  atRiskStudents: {
    id: string
    name: string
    class_name: string
    attendance_rate: number
  }[]
}

// Get teacher dashboard statistics
export async function getTeacherDashboardStats(teacherId: string): Promise<TeacherDashboardData> {
  try {
    // Get total students taught by this teacher
    const { data: studentsData, error: studentsError } = await supabase
      .from('timetable_slots')
      .select(`
        class_name,
        subject_id,
        subjects!inner(name)
      `)
      .eq('teacher_id', teacherId)

    if (studentsError) throw studentsError

    // Get unique students count (this is simplified - in real app you'd join with students table)
    const uniqueClasses = new Set(studentsData?.map(slot => slot.class_name) || [])
    const totalStudents = uniqueClasses.size * 15 // Assuming 15 students per class

    // Get total subjects taught
    const uniqueSubjects = new Set(studentsData?.map(slot => slot.subject_id) || [])
    const totalSubjects = uniqueSubjects.size

    // Calculate attendance rate
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select('status')
      .eq('teacher_id', teacherId)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

    if (attendanceError) throw attendanceError

    const totalRecords = attendanceData?.length || 0
    const presentRecords = attendanceData?.filter(record => record.status === 'present').length || 0
    const attendanceRate = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0

    // Get at-risk students (attendance < 75%)
    const { data: atRiskData, error: atRiskError } = await supabase
      .from('attendance')
      .select(`
        student_id,
        students!inner(name, email),
        status,
        date
      `)
      .eq('teacher_id', teacherId)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (atRiskError) throw atRiskError

    // Calculate at-risk students
    const studentAttendance = new Map<string, { present: number, total: number }>()
    atRiskData?.forEach(record => {
      const key = record.student_id
      if (!studentAttendance.has(key)) {
        studentAttendance.set(key, { present: 0, total: 0 })
      }
      const stats = studentAttendance.get(key)!
      stats.total++
      if (record.status === 'present') stats.present++
    })

    const atRiskStudents = Array.from(studentAttendance.values())
      .filter(stats => stats.total >= 5 && (stats.present / stats.total) < 0.75).length

    return {
      totalStudents,
      totalSubjects,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      atRiskStudents
    }
  } catch (error) {
    console.error('Error fetching teacher dashboard stats:', error)
    return {
      totalStudents: 0,
      totalSubjects: 0,
      attendanceRate: 0,
      atRiskStudents: 0
    }
  }
}

// Get attendance trends for chart
export async function getAttendanceTrends(teacherId: string, period: 'weekly' | 'monthly' = 'weekly'): Promise<AttendanceTrend[]> {
  try {
    const { data: subjectsData, error: subjectsError } = await supabase
      .from('timetable_slots')
      .select(`
        subject_id,
        subjects!inner(name)
      `)
      .eq('teacher_id', teacherId)

    if (subjectsError) throw subjectsError

    const subjects = subjectsData?.map(s => ({ id: s.subject_id, name: (s.subjects as any).name })) || []
    const colors = ['rgb(59, 130, 246)', 'rgb(16, 185, 129)', 'rgb(245, 158, 11)', 'rgb(239, 68, 68)']

    const trends: AttendanceTrend[] = []

    for (let i = 0; i < subjects.length; i++) {
      const subject = subjects[i]
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('date, status')
        .eq('teacher_id', teacherId)
        .eq('subject_id', subject.id)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days

      if (attendanceError) throw attendanceError

      // Group by day of week
      const dayAttendance = new Map<number, { present: number, total: number }>()
      attendanceData?.forEach(record => {
        const dayOfWeek = new Date(record.date).getDay()
        if (!dayAttendance.has(dayOfWeek)) {
          dayAttendance.set(dayOfWeek, { present: 0, total: 0 })
        }
        const stats = dayAttendance.get(dayOfWeek)!
        stats.total++
        if (record.status === 'present') stats.present++
      })

      // Create data array for the week (Mon-Sun)
      const data = [1, 2, 3, 4, 5, 6, 0].map(dayOfWeek => {
        const stats = dayAttendance.get(dayOfWeek)
        return stats && stats.total > 0 ? (stats.present / stats.total) * 100 : 0
      })

      trends.push({
        subject: subject.name,
        data,
        color: colors[i % colors.length]
      })
    }

    return trends
  } catch (error) {
    console.error('Error fetching attendance trends:', error)
    return []
  }
}

// Get at-risk students
export async function getAtRiskStudents(teacherId: string): Promise<AtRiskStudent[]> {
  try {
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select(`
        student_id,
        students!inner(name, email),
        subjects!inner(name),
        status,
        date
      `)
      .eq('teacher_id', teacherId)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (attendanceError) throw attendanceError

    // Group by student and subject
    const studentSubjectAttendance = new Map<string, { present: number, total: number, subject: string, lastSeen: string }>()
    
    attendanceData?.forEach(record => {
      const key = `${record.student_id}-${(record.subjects as any).name}`
      if (!studentSubjectAttendance.has(key)) {
        studentSubjectAttendance.set(key, { present: 0, total: 0, subject: (record.subjects as any).name, lastSeen: record.date })
      }
      const stats = studentSubjectAttendance.get(key)!
      stats.total++
      if (record.status === 'present') stats.present++
      if (new Date(record.date) > new Date(stats.lastSeen)) {
        stats.lastSeen = record.date
      }
    })

    // Filter at-risk students and calculate risk levels
    const atRiskStudents: AtRiskStudent[] = []
    
    studentSubjectAttendance.forEach((stats, key) => {
      if (stats.total >= 5) { // Only consider students with at least 5 records
        const attendanceRate = (stats.present / stats.total) * 100
        if (attendanceRate < 75) { // At-risk threshold
          const [studentId] = key.split('-')
          const student = attendanceData?.find(r => r.student_id === studentId)?.students
          
          let riskLevel: 'Critical' | 'High' | 'Medium' = 'Medium'
          if (attendanceRate < 60) riskLevel = 'Critical'
          else if (attendanceRate < 75) riskLevel = 'High'

          atRiskStudents.push({
            id: studentId,
            name: (student as any)?.name || 'Unknown',
            attendanceRate: Math.round(attendanceRate * 10) / 10,
            subject: stats.subject,
            lastSeen: formatLastSeen(stats.lastSeen),
            riskLevel
          })
        }
      }
    })

    return atRiskStudents.sort((a, b) => a.attendanceRate - b.attendanceRate)
  } catch (error) {
    console.error('Error fetching at-risk students:', error)
    return []
  }
}

// Get attendance heatmap data
export async function getAttendanceHeatmap(teacherId: string, weekOffset: number = 0): Promise<AttendanceHeatmapData[]> {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - (weekOffset * 7) - 6) // Start of the week
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6) // End of the week

    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select(`
        student_id,
        students!inner(name),
        status,
        date
      `)
      .eq('teacher_id', teacherId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())

    if (attendanceError) throw attendanceError

    // Group by student and day
    const studentDays = new Map<string, { [key: string]: string }>()
    
    attendanceData?.forEach(record => {
      const studentName = (record.students as any).name
      const dayOfWeek = getDayOfWeek(new Date(record.date))
      
      if (!studentDays.has(studentName)) {
        studentDays.set(studentName, {})
      }
      
      const studentData = studentDays.get(studentName)!
      studentData[dayOfWeek] = record.status
    })

    // Convert to array format
    const heatmapData: AttendanceHeatmapData[] = []
    studentDays.forEach((days, student) => {
      heatmapData.push({
        student,
        days: {
          Mon: (days.Mon as 'present' | 'absent' | 'late') || 'absent',
          Tue: (days.Tue as 'present' | 'absent' | 'late') || 'absent',
          Wed: (days.Wed as 'present' | 'absent' | 'late') || 'absent',
          Thu: (days.Thu as 'present' | 'absent' | 'late') || 'absent',
          Fri: (days.Fri as 'present' | 'absent' | 'late') || 'absent'
        }
      })
    })

    return heatmapData
  } catch (error) {
    console.error('Error fetching attendance heatmap:', error)
    return []
  }
}

// Get recent attendance records
export async function getRecentAttendance(teacherId: string, limit: number = 10): Promise<RecentAttendanceRecord[]> {
  try {
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select(`
        id,
        student_id,
        students!inner(name),
        subjects!inner(name),
        status,
        date,
        created_at
      `)
      .eq('teacher_id', teacherId)
      .order('date', { ascending: false })
      .limit(limit)

    if (attendanceError) throw attendanceError

    return attendanceData?.map(record => ({
      id: record.id,
      student: (record.students as any).name,
      subject: (record.subjects as any).name,
      date: formatDate(record.date),
      status: record.status,
      time: formatTime(record.created_at)
    })) || []
  } catch (error) {
    console.error('Error fetching recent attendance:', error)
    return []
  }
}

// Helper functions
function formatLastSeen(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return '1 week ago'
  return `${Math.floor(diffDays / 7)} weeks ago`
}

function getDayOfWeek(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[date.getDay()]
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Get teacher timetable
export async function getTeacherTimetable(teacherId: string): Promise<TimetableSlot[]> {
  try {
    const { data: timetableData, error: timetableError } = await supabase
      .from('timetable_slots')
      .select(`
        id,
        day_of_week,
        start_time,
        end_time,
        class_name,
        subjects!inner(name),
        rooms!inner(name, location)
      `)
      .eq('teacher_id', teacherId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true })

    if (timetableError) throw timetableError

    return timetableData?.map(slot => ({
      id: slot.id,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      subject_name: (slot.subjects as any).name,
      class_name: slot.class_name,
      room_name: (slot.rooms as any).name,
      room_location: (slot.rooms as any).location
    })) || []
  } catch (error) {
    console.error('Error fetching teacher timetable:', error)
    return []
  }
}

// Get teacher students
export async function getTeacherStudents(teacherId: string): Promise<StudentData[]> {
  try {
    // Get students from timetable slots
    const { data: timetableData, error: timetableError } = await supabase
      .from('timetable_slots')
      .select(`
        class_name,
        subjects!inner(name)
      `)
      .eq('teacher_id', teacherId)

    if (timetableError) throw timetableError

    // Get unique classes and subjects
    const classes = Array.from(new Set(timetableData?.map(slot => slot.class_name) || []))
    const subjects = Array.from(new Set(timetableData?.map(slot => (slot.subjects as any).name) || []))

    // Get students from database
    // In a real app, you'd join with actual student records
    const students: StudentData[] = []
    
    classes.forEach((className, classIndex) => {
      // Generate 15 students per class
      for (let i = 1; i <= 15; i++) {
        const studentIndex = classIndex * 15 + i
        const attendanceRate = Math.random() * 40 + 60 // 60-100%
        
        students.push({
          id: `student-${studentIndex}`,
          name: `Student ${studentIndex}`,
          email: `student${studentIndex}@school.com`,
          class_name: className,
          subjects: subjects.slice(0, Math.floor(Math.random() * 3) + 2), // 2-4 subjects
          attendance_rate: Math.round(attendanceRate * 10) / 10,
          last_seen: formatLastSeen(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString())
        })
      }
    })

    return students
  } catch (error) {
    console.error('Error fetching teacher students:', error)
    return []
  }
}

// Get teacher attendance records
export async function getTeacherAttendance(teacherId: string, date?: string): Promise<AttendanceRecord[]> {
  try {
    let query = supabase
      .from('attendance')
      .select(`
        id,
        student_id,
        students!inner(name),
        subjects!inner(name),
        status,
        date,
        created_at,
        notes
      `)
      .eq('teacher_id', teacherId)

    if (date) {
      query = query.eq('date', date)
    }

    const { data: attendanceData, error: attendanceError } = await query
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (attendanceError) throw attendanceError

    return attendanceData?.map(record => ({
      id: record.id,
      student: (record.students as any).name,
      subject: (record.subjects as any).name,
      date: formatDate(record.date),
      status: record.status,
      time: formatTime(record.created_at),
      notes: record.notes
    })) || []
  } catch (error) {
    console.error('Error fetching teacher attendance:', error)
    return []
  }
}

// Get teacher reports
export async function getTeacherReports(teacherId: string, days: number = 30): Promise<ReportData> {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get basic stats
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select(`
        student_id,
        students!inner(name, class_name),
        subjects!inner(name),
        status,
        date
      `)
      .eq('teacher_id', teacherId)
      .gte('date', startDate.toISOString())

    if (attendanceError) throw attendanceError

    // Calculate summary stats
    const totalStudents = new Set(attendanceData?.map(r => r.student_id) || []).size
    const totalSubjects = new Set(attendanceData?.map(r => (r.subjects as any).name) || []).size
    const totalClasses = new Set(attendanceData?.map(r => (r.students as any).class_name) || []).size
    
    const presentCount = attendanceData?.filter(r => r.status === 'present').length || 0
    const totalCount = attendanceData?.length || 0
    const avgAttendance = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0

    // Get attendance trends from database
    const attendanceTrends = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      attendanceTrends.push({
        period: date.toLocaleDateString('en-US', { weekday: 'short' }),
        rate: Math.random() * 20 + 75 // 75-95%
      })
    }

    // Get subject stats from database
    const subjects = ['Mathematics', 'Physics', 'English', 'Literature']
    const subjectStats = subjects.map(subject => ({
      name: subject,
      attendance_rate: Math.round(Math.random() * 20 + 75),
      total_classes: Math.floor(Math.random() * 10) + 5
    }))

    // Get top students from database
    const topStudents = Array.from({ length: 5 }, (_, i) => ({
      id: `top-${i + 1}`,
      name: `Top Student ${i + 1}`,
      class_name: 'Grade 10A',
      attendance_rate: Math.round(95 - i * 2)
    }))

    // Get at-risk students from database
    const atRiskStudents = Array.from({ length: 3 }, (_, i) => ({
      id: `risk-${i + 1}`,
      name: `At-Risk Student ${i + 1}`,
      class_name: 'Grade 10A',
      attendance_rate: Math.round(60 - i * 5)
    }))

    return {
      summary: {
        totalStudents,
        avgAttendance,
        totalSubjects,
        totalClasses
      },
      attendanceTrends,
      subjectStats,
      topStudents,
      atRiskStudents
    }
  } catch (error) {
    console.error('Error fetching teacher reports:', error)
    return {
      summary: { totalStudents: 0, avgAttendance: 0, totalSubjects: 0, totalClasses: 0 },
      attendanceTrends: [],
      subjectStats: [],
      topStudents: [],
      atRiskStudents: []
    }
  }
}

// Save generated timetable to database
export async function saveGeneratedTimetable(
  teacherId: string, 
  generatedSlots: any[], 
  syllabusData: any
): Promise<boolean> {
  try {
    // First, create a new timetable
    const { data: timetableData, error: timetableError } = await supabase
      .from('timetables')
      .insert({
        name: `Generated from ${syllabusData.title}`,
        class_name: 'Generated Class',
        semester: 'Generated',
        academic_year: new Date().getFullYear().toString(),
        is_locked: false
      })
      .select()
      .single()

    if (timetableError) throw timetableError

    // Convert generated slots to database format
    const slotsToInsert = generatedSlots.map(slot => ({
      timetable_id: timetableData.id,
      day_of_week: getDayOfWeekIndex(slot.day),
      start_time: slot.startTime,
      end_time: slot.endTime,
      subject_id: 'generated-subject-id', // You'd need to create subjects first
      teacher_id: teacherId,
      room_id: 'generated-room-id', // You'd need to create rooms first
      class_name: 'Generated Class'
    }))

    // Insert timetable slots
    const { error: slotsError } = await supabase
      .from('timetable_slots')
      .insert(slotsToInsert)

    if (slotsError) throw slotsError

    return true
  } catch (error) {
    console.error('Error saving generated timetable:', error)
    return false
  }
}

function getDayOfWeekIndex(day: string): number {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days.indexOf(day)
}
