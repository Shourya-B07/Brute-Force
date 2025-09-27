import { supabase, Teacher, Subject, Room, TimetableSlot, Student } from './supabase'

export interface TimeSlot {
  day: number
  startTime: string
  endTime: string
  duration: number
}

export interface TimetableConstraints {
  maxHoursPerDay: number
  maxHoursPerWeek: number
  breakTime: number
  lunchBreak: { start: string; end: string }
  workingHours: { start: string; end: string }
}

export interface ConflictResolution {
  type: 'teacher_conflict' | 'room_conflict' | 'student_conflict' | 'time_conflict'
  message: string
  severity: 'low' | 'medium' | 'high'
}

export class TimetableGenerator {
  private constraints: TimetableConstraints
  private conflicts: ConflictResolution[] = []

  constructor(constraints: TimetableConstraints) {
    this.constraints = constraints
  }

  async generateTimetable(
    classNames: string[],
    subjects: Subject[],
    teachers: Teacher[],
    rooms: Room[],
    students: Student[]
  ): Promise<{ slots: TimetableSlot[]; conflicts: ConflictResolution[] }> {
    this.conflicts = []
    const slots: TimetableSlot[] = []

    // Generate time slots for each day
    const timeSlots = this.generateTimeSlots()

    for (const className of classNames) {
      const classStudents = students.filter(s => s.class_name === className)
      const classSubjects = this.getSubjectsForClass(classStudents, subjects)

      for (const subject of classSubjects) {
        const subjectSlots = await this.assignSubjectSlots(
          subject,
          teachers,
          rooms,
          timeSlots,
          className,
          slots
        )
        slots.push(...subjectSlots)
      }
    }

    return { slots, conflicts: this.conflicts }
  }

  private generateTimeSlots(): TimeSlot[] {
    const slots: TimeSlot[] = []
    const workingDays = [1, 2, 3, 4, 5] // Monday to Friday
    const startHour = 8
    const endHour = 17
    const slotDuration = 60 // minutes

    for (const day of workingDays) {
      for (let hour = startHour; hour < endHour; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`

        // Skip lunch break
        if (hour === 12) continue

        slots.push({
          day,
          startTime,
          endTime,
          duration: slotDuration
        })
      }
    }

    return slots
  }

  private getSubjectsForClass(students: Student[], subjects: Subject[]): Subject[] {
    const classSubjects = new Set<string>()
    
    students.forEach(student => {
      student.subjects.forEach(subject => classSubjects.add(subject))
    })

    return subjects.filter(subject => classSubjects.has(subject.name))
  }

  private async assignSubjectSlots(
    subject: Subject,
    teachers: Teacher[],
    rooms: Room[],
    timeSlots: TimeSlot[],
    className: string,
    existingSlots: TimetableSlot[]
  ): Promise<TimetableSlot[]> {
    const slots: TimetableSlot[] = []
    const availableTeachers = teachers.filter(t => t.subjects.includes(subject.name))
    const availableRooms = rooms.filter(r => 
      subject.room_requirements.every(req => r.equipment.includes(req))
    )

    if (availableTeachers.length === 0) {
      this.conflicts.push({
        type: 'teacher_conflict',
        message: `No available teacher for subject: ${subject.name}`,
        severity: 'high'
      })
      return slots
    }

    if (availableRooms.length === 0) {
      this.conflicts.push({
        type: 'room_conflict',
        message: `No suitable room for subject: ${subject.name}`,
        severity: 'high'
      })
      return slots
    }

    // Calculate required slots based on subject duration and frequency
    const requiredSlots = Math.ceil(subject.duration / 60) // Convert to hours
    let assignedSlots = 0

    for (const timeSlot of timeSlots) {
      if (assignedSlots >= requiredSlots) break

      // Check for conflicts
      const hasConflict = this.checkConflicts(
        timeSlot,
        availableTeachers,
        availableRooms,
        existingSlots,
        className
      )

      if (!hasConflict) {
        const teacher = this.selectBestTeacher(availableTeachers, timeSlot, existingSlots)
        const room = this.selectBestRoom(availableRooms, timeSlot, existingSlots)

        if (teacher && room) {
          const slot: TimetableSlot = {
            id: Math.random().toString(36).substr(2, 9),
            timetable_id: '', // Will be set by caller
            day_of_week: timeSlot.day,
            start_time: timeSlot.startTime,
            end_time: timeSlot.endTime,
            subject_id: subject.id,
            teacher_id: teacher.id,
            room_id: room.id,
            class_name: className,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          slots.push(slot)
          assignedSlots++
        }
      }
    }

    if (assignedSlots < requiredSlots) {
      this.conflicts.push({
        type: 'time_conflict',
        message: `Could not assign all required slots for ${subject.name}. Assigned ${assignedSlots}/${requiredSlots}`,
        severity: 'medium'
      })
    }

    return slots
  }

  private checkConflicts(
    timeSlot: TimeSlot,
    teachers: Teacher[],
    rooms: Room[],
    existingSlots: TimetableSlot[],
    className: string
  ): boolean {
    // Check teacher availability
    const availableTeachers = teachers.filter(teacher => {
      const teacherAvailability = teacher.availability.find(a => a.day_of_week === timeSlot.day)
      if (!teacherAvailability) return false

      const slotStart = this.timeToMinutes(timeSlot.startTime)
      const slotEnd = this.timeToMinutes(timeSlot.endTime)
      const availableStart = this.timeToMinutes(teacherAvailability.start_time)
      const availableEnd = this.timeToMinutes(teacherAvailability.end_time)

      return slotStart >= availableStart && slotEnd <= availableEnd
    })

    if (availableTeachers.length === 0) return true

    // Check for existing conflicts
    const hasTeacherConflict = existingSlots.some(slot => 
      availableTeachers.some(teacher => teacher.id === slot.teacher_id) &&
      slot.day_of_week === timeSlot.day &&
      this.timeOverlaps(slot.start_time, slot.end_time, timeSlot.startTime, timeSlot.endTime)
    )

    const hasRoomConflict = existingSlots.some(slot =>
      rooms.some(room => room.id === slot.room_id) &&
      slot.day_of_week === timeSlot.day &&
      this.timeOverlaps(slot.start_time, slot.end_time, timeSlot.startTime, timeSlot.endTime)
    )

    return hasTeacherConflict || hasRoomConflict
  }

  private selectBestTeacher(
    teachers: Teacher[],
    timeSlot: TimeSlot,
    existingSlots: TimetableSlot[]
  ): Teacher | null {
    // Calculate teacher workload
    const teacherWorkload = teachers.map(teacher => {
      const currentWorkload = existingSlots.filter(slot => slot.teacher_id === teacher.id).length
      const maxWorkload = teacher.max_hours_per_week
      return { teacher, workload: currentWorkload / maxWorkload }
    })

    // Select teacher with lowest workload
    const bestTeacher = teacherWorkload.reduce((best, current) => 
      current.workload < best.workload ? current : best
    )

    return bestTeacher.workload < 1 ? bestTeacher.teacher : null
  }

  private selectBestRoom(
    rooms: Room[],
    timeSlot: TimeSlot,
    existingSlots: TimetableSlot[]
  ): Room | null {
    // Find room with least usage
    const roomUsage = rooms.map(room => {
      const usage = existingSlots.filter(slot => slot.room_id === room.id).length
      return { room, usage }
    })

    const bestRoom = roomUsage.reduce((best, current) => 
      current.usage < best.usage ? current : best
    )

    return bestRoom.room
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  private timeOverlaps(start1: string, end1: string, start2: string, end2: string): boolean {
    const start1Min = this.timeToMinutes(start1)
    const end1Min = this.timeToMinutes(end1)
    const start2Min = this.timeToMinutes(start2)
    const end2Min = this.timeToMinutes(end2)

    return start1Min < end2Min && start2Min < end1Min
  }

  async saveTimetable(timetableId: string, slots: TimetableSlot[]): Promise<void> {
    const { error } = await supabase
      .from('timetable_slots')
      .insert(slots.map(slot => ({ ...slot, timetable_id: timetableId })))

    if (error) {
      throw new Error(`Failed to save timetable: ${error.message}`)
    }
  }

  async getTimetableConflicts(timetableId: string): Promise<ConflictResolution[]> {
    const { data: slots, error } = await supabase
      .from('timetable_slots')
      .select('*')
      .eq('timetable_id', timetableId)

    if (error) {
      throw new Error(`Failed to fetch timetable: ${error.message}`)
    }

    const conflicts: ConflictResolution[] = []

    // Check for teacher double-booking
    const teacherSlots = new Map<string, TimetableSlot[]>()
    slots.forEach(slot => {
      if (!teacherSlots.has(slot.teacher_id)) {
        teacherSlots.set(slot.teacher_id, [])
      }
      teacherSlots.get(slot.teacher_id)!.push(slot)
    })

    teacherSlots.forEach((slots, teacherId) => {
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          const slot1 = slots[i]
          const slot2 = slots[j]
          
          if (slot1.day_of_week === slot2.day_of_week &&
              this.timeOverlaps(slot1.start_time, slot1.end_time, slot2.start_time, slot2.end_time)) {
            conflicts.push({
              type: 'teacher_conflict',
              message: `Teacher double-booked on day ${slot1.day_of_week}`,
              severity: 'high'
            })
          }
        }
      }
    })

    return conflicts
  }
}
