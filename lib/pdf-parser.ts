import * as pdf from 'pdf-parse'

export interface ParsedSyllabus {
  subjects: string[]
  topics: string[]
  durations: number[]
  prerequisites: string[]
  totalPages: number
}

export interface SubjectInfo {
  name: string
  topics: string[]
  duration: number
  prerequisites: string[]
}

export class SyllabusParser {
  async parsePDF(buffer: Buffer): Promise<ParsedSyllabus> {
    try {
      const data = await pdf.default(buffer)
      const text = data.text
      const totalPages = data.numpages

      const subjects = this.extractSubjects(text)
      const topics = this.extractTopics(text)
      const durations = this.extractDurations(text)
      const prerequisites = this.extractPrerequisites(text)

      return {
        subjects,
        topics,
        durations,
        prerequisites,
        totalPages
      }
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error}`)
    }
  }

  private extractSubjects(text: string): string[] {
    const subjects: string[] = []
    
    // Common subject patterns
    const subjectPatterns = [
      /(?:Subject|Course|Module):\s*([A-Za-z\s]+)/gi,
      /([A-Za-z\s]+)\s*\(\d+\s*credits?\)/gi,
      /([A-Za-z\s]+)\s*\(\d+\s*hours?\)/gi,
      /^([A-Za-z\s]+)$/gm // Lines that are just subject names
    ]

    subjectPatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        matches.forEach(match => {
          const subject = match.replace(/^(?:Subject|Course|Module):\s*/i, '')
            .replace(/\s*\(\d+\s*(?:credits?|hours?)\)/i, '')
            .trim()
          
          if (subject && subject.length > 2 && subject.length < 50) {
            subjects.push(subject)
          }
        })
      }
    })

    // Remove duplicates and filter out common false positives
    const filteredSubjects = Array.from(new Set(subjects))
      .filter(subject => 
        !this.isCommonWord(subject) && 
        !subject.match(/^\d+$/) && 
        !subject.match(/^(page|chapter|section|unit)$/i)
      )

    return filteredSubjects
  }

  private extractTopics(text: string): string[] {
    const topics: string[] = []
    
    // Topic patterns
    const topicPatterns = [
      /(?:Topic|Chapter|Unit|Lesson):\s*([A-Za-z0-9\s\-\.]+)/gi,
      /^\d+\.\d*\s+([A-Za-z0-9\s\-\.]+)$/gm,
      /^[A-Z]\d*\.\s*([A-Za-z0-9\s\-\.]+)$/gm
    ]

    topicPatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        matches.forEach(match => {
          const topic = match.replace(/^(?:Topic|Chapter|Unit|Lesson):\s*/i, '')
            .replace(/^\d+\.\d*\s+/, '')
            .replace(/^[A-Z]\d*\.\s*/, '')
            .trim()
          
          if (topic && topic.length > 3 && topic.length < 100) {
            topics.push(topic)
          }
        })
      }
    })

    return Array.from(new Set(topics))
  }

  private extractDurations(text: string): number[] {
    const durations: number[] = []
    
    // Duration patterns (in minutes)
    const durationPatterns = [
      /(\d+)\s*(?:hours?|hrs?)/gi,
      /(\d+)\s*(?:minutes?|mins?)/gi,
      /(\d+)\s*(?:weeks?)/gi,
      /(\d+)\s*(?:days?)/gi
    ]

    durationPatterns.forEach((pattern, index) => {
      const matches = text.match(pattern)
      if (matches) {
        matches.forEach(match => {
          const duration = parseInt(match.match(/\d+/)?.[0] || '0')
          if (duration > 0) {
            // Convert to minutes
            let minutes = duration
            if (index === 0) minutes = duration * 60 // hours to minutes
            else if (index === 2) minutes = duration * 7 * 24 * 60 // weeks to minutes
            else if (index === 3) minutes = duration * 24 * 60 // days to minutes
            
            durations.push(minutes)
          }
        })
      }
    })

    return durations
  }

  private extractPrerequisites(text: string): string[] {
    const prerequisites: string[] = []
    
    // Prerequisite patterns
    const prerequisitePatterns = [
      /(?:Prerequisite|Pre-requisite|Required):\s*([A-Za-z0-9\s,]+)/gi,
      /(?:Must have|Should have|Need):\s*([A-Za-z0-9\s,]+)/gi,
      /(?:Before taking|Prior to):\s*([A-Za-z0-9\s,]+)/gi
    ]

    prerequisitePatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        matches.forEach(match => {
          const prereq = match.replace(/^(?:Prerequisite|Pre-requisite|Required|Must have|Should have|Need|Before taking|Prior to):\s*/i, '')
            .split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0)
          
          prerequisites.push(...prereq)
        })
      }
    })

    return Array.from(new Set(prerequisites))
  }

  private isCommonWord(word: string): boolean {
    const commonWords = [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
      'above', 'below', 'between', 'among', 'under', 'over', 'around', 'near',
      'this', 'that', 'these', 'those', 'a', 'an', 'is', 'are', 'was', 'were',
      'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall'
    ]
    
    return commonWords.includes(word.toLowerCase())
  }

  async generateTimetableFromSyllabus(parsedSyllabus: ParsedSyllabus): Promise<SubjectInfo[]> {
    const subjects: SubjectInfo[] = []

    // Group topics by subject (simple heuristic)
    const subjectTopicMap = new Map<string, string[]>()
    
    parsedSyllabus.topics.forEach(topic => {
      // Try to find which subject this topic belongs to
      const matchingSubject = parsedSyllabus.subjects.find(subject => 
        topic.toLowerCase().includes(subject.toLowerCase()) ||
        subject.toLowerCase().includes(topic.toLowerCase())
      )
      
      if (matchingSubject) {
        if (!subjectTopicMap.has(matchingSubject)) {
          subjectTopicMap.set(matchingSubject, [])
        }
        subjectTopicMap.get(matchingSubject)!.push(topic)
      }
    })

    // Create subject info objects
    parsedSyllabus.subjects.forEach(subject => {
      const topics = subjectTopicMap.get(subject) || []
      const duration = this.calculateSubjectDuration(subject, parsedSyllabus.durations)
      const prerequisites = this.findPrerequisitesForSubject(subject, parsedSyllabus.prerequisites)

      subjects.push({
        name: subject,
        topics,
        duration,
        prerequisites
      })
    })

    return subjects
  }

  private calculateSubjectDuration(subject: string, durations: number[]): number {
    // Use average duration if available, otherwise default to 60 minutes
    if (durations.length > 0) {
      return Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
    }
    return 60 // Default 1 hour
  }

  private findPrerequisitesForSubject(subject: string, prerequisites: string[]): string[] {
    // Simple heuristic: find prerequisites that mention the subject
    return prerequisites.filter(prereq => 
      prereq.toLowerCase().includes(subject.toLowerCase()) ||
      subject.toLowerCase().includes(prereq.toLowerCase())
    )
  }
}
