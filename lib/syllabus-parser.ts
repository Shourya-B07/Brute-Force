// Syllabus parsing and timetable generation utilities

export interface ParsedSyllabus {
  title: string
  subjects: SubjectInfo[]
  totalDuration: number
}

export interface SubjectInfo {
  name: string
  topics: TopicInfo[]
  totalDuration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  credits?: number
}

export interface TopicInfo {
  title: string
  duration: number
  description: string
  learningObjectives: string[]
}

export interface TimetableSlot {
  subject: string
  topic: string
  duration: number
  day: string
  startTime: string
  endTime: string
  week: number
  description?: string
  learningObjectives?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  credits?: number
}

// Parse syllabus PDF and extract content - DEPRECATED
// This function is no longer used as we now use real PDF parsing
export async function parseSyllabusPDF(file: File): Promise<ParsedSyllabus> {
  throw new Error('This function is deprecated. Use real PDF parsing instead.')
}

// Generate optimal timetable based on syllabus with credit-based scheduling
export function generateOptimalTimetable(
  parsedSyllabus: ParsedSyllabus,
  workingHours: { start: number; end: number } = { start: 9, end: 16 }
): TimetableSlot[] {
  console.log('🎯 Generating timetable from extracted courses...')
  console.log(`📚 Syllabus: ${parsedSyllabus.title}`)
  console.log(`📚 Courses: ${parsedSyllabus.subjects.length} (extracted from PDF)`)
  console.log(`📚 Course Details:`)
  parsedSyllabus.subjects.forEach((subject, index) => {
    console.log(`  ${index + 1}. ${subject.name} (${subject.credits} credits)`)
  })
  
  const schedule: TimetableSlot[] = []
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const timeSlots = [
    { start: 9, end: 10 },   // 9:00 - 10:00
    { start: 10, end: 11 },  // 10:00 - 11:00
    { start: 11, end: 12 },  // 11:00 - 12:00
    { start: 12, end: 13 },  // 12:00 - 13:00 (Lunch break)
    { start: 13, end: 14 },  // 13:00 - 14:00
    { start: 14, end: 15 },  // 14:00 - 15:00
    { start: 15, end: 16 }   // 15:00 - 16:00
  ]
  
  // Create a schedule grid to track occupied slots
  const scheduleGrid: { [key: string]: { [key: string]: boolean } } = {}
  days.forEach(day => {
    scheduleGrid[day] = {}
    timeSlots.forEach(slot => {
      scheduleGrid[day][`${slot.start}:00-${slot.end}:00`] = false
    })
  })

  // Create a seed for consistent randomization
  const seed = parsedSyllabus.title.length + parsedSyllabus.subjects.length
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }
  
  // Randomize subjects to avoid same subject always appearing at same time
  const sortedSubjects = [...parsedSyllabus.subjects].sort((a, b) => {
    const randomA = seededRandom(seed + a.name.length)
    const randomB = seededRandom(seed + b.name.length)
    return randomA - randomB
  })
  
  console.log('🎲 Randomized subject order:', sortedSubjects.map(s => s.name))

      sortedSubjects.forEach(subject => {
        const credits = subject.credits || extractCreditsFromSubject(subject.name, parsedSyllabus)
        const daysPerWeek = Math.min(credits, 5) // Maximum 5 days per week
    
    console.log(`📚 Scheduling ${subject.name} (${credits} credits, ${daysPerWeek} days/week)`)
    
    // Schedule this subject for the required number of days
    const availableDays = getAvailableDays(scheduleGrid, daysPerWeek)
    console.log(`📅 Available days for ${subject.name}:`, availableDays)
    
    availableDays.forEach((day, dayIndex) => {
      // Find the next available time slot for this day
      const availableTimeSlot = findAvailableTimeSlot(scheduleGrid, day, subject.name)
      
      if (availableTimeSlot) {
        const startTime = formatTime(availableTimeSlot.start * 60)
        const endTime = formatTime(availableTimeSlot.end * 60)
        
        // Mark this slot as occupied
        scheduleGrid[day][`${availableTimeSlot.start}:00-${availableTimeSlot.end}:00`] = true
        
        console.log(`⏰ Scheduling ${subject.name} on ${day} at ${startTime}-${endTime}`)
        
        // Add one session for this subject on this day
        schedule.push({
          subject: subject.name,
          topic: `${subject.name} - Session ${dayIndex + 1}`,
          duration: 60, // 1 hour per session
          day: day,
          startTime,
          endTime,
          week: 1, // Start with week 1
          description: `Week 1 session ${dayIndex + 1} of ${subject.name}`,
          learningObjectives: ['Understand concepts', 'Apply knowledge'],
          difficulty: subject.difficulty,
          credits: credits
        })
      } else {
        console.log(`❌ No available time slot found for ${subject.name} on ${day}`)
      }
    })
  })

  return schedule
}

// Extract credits from subject name or use default based on subject type
function extractCreditsFromSubject(subjectName: string, syllabus: ParsedSyllabus): number {
  // First try to find the subject in the syllabus and get its credits
  const foundSubject = syllabus.subjects.find(subject => 
    subject.name.toLowerCase().includes(subjectName.toLowerCase()) ||
    subjectName.toLowerCase().includes(subject.name.toLowerCase())
  )
  
  if (foundSubject && foundSubject.credits) {
    console.log(`✅ Found credits for ${subjectName}: ${foundSubject.credits}`)
    return foundSubject.credits
  }
  
  // If no credits found in the extracted data, use intelligent defaults based on subject characteristics
  const subjectLower = subjectName.toLowerCase()
  
  // Analyze subject characteristics to determine credits
  if (subjectLower.includes('lab') || subjectLower.includes('practical') || subjectLower.includes('workshop')) {
    return 1 // Lab/practical courses typically have 1 credit
  }
  
  if (subjectLower.includes('elective') || subjectLower.includes('optional')) {
    return 3 // Elective courses typically have 3 credits
  }
  
  if (subjectLower.includes('research') || subjectLower.includes('methodology') || subjectLower.includes('project')) {
    return 2 // Research/methodology courses typically have 2 credits
  }
  
  if (subjectLower.includes('core') || subjectLower.includes('fundamental') || subjectLower.includes('advanced')) {
    return 4 // Core courses typically have 4 credits
  }
  
  // Default to 3 credits for unknown subjects
  console.log(`⚠️ Using default credits (3) for ${subjectName}`)
  return 3
}


// Get available days for scheduling (randomized)
function getAvailableDays(scheduleGrid: any, daysNeeded: number): string[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  
  // Get all days that have available slots
  const availableDays = days.filter(day => {
    const hasAvailableSlot = Object.values(scheduleGrid[day]).some(occupied => !occupied)
    return hasAvailableSlot
  })
  
  // Randomize the order of available days
  const shuffledDays = [...availableDays].sort(() => Math.random() - 0.5)
  
  // Return only the number of days needed
  return shuffledDays.slice(0, daysNeeded)
}

// Find a random available time slot for a specific day
function findAvailableTimeSlot(scheduleGrid: any, day: string, subjectName: string = ''): { start: number; end: number } | null {
  const timeSlots = [
    { start: 9, end: 10 },   // 9:00 - 10:00
    { start: 10, end: 11 },  // 10:00 - 11:00
    { start: 11, end: 12 },  // 11:00 - 12:00
    { start: 12, end: 13 },  // 12:00 - 13:00 (Lunch break)
    { start: 13, end: 14 },  // 13:00 - 14:00
    { start: 14, end: 15 },  // 14:00 - 15:00
    { start: 15, end: 16 }   // 15:00 - 16:00
  ]
  
  // Get all available slots
  const availableSlots = timeSlots.filter(slot => {
    const slotKey = `${slot.start}:00-${slot.end}:00`
    return !scheduleGrid[day][slotKey]
  })
  
  if (availableSlots.length === 0) {
    return null
  }
  
  // Use seeded random for consistent but varied selection
  const seed = day.length + subjectName.length + Date.now()
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }
  
  const randomIndex = Math.floor(seededRandom(seed) * availableSlots.length)
  return availableSlots[randomIndex]
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

