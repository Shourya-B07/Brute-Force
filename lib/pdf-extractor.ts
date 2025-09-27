// Real PDF text extraction and content analysis
// This will use a PDF parsing library to extract actual content

export interface ExtractedContent {
  rawText: string
  pages: number
  metadata: {
    title?: string
    author?: string
    creationDate?: string
    keywords?: string[]
  }
}

export interface AnalyzedSyllabus {
  title: string
  subjects: ExtractedSubject[]
  totalDuration: number
  complexity: 'beginner' | 'intermediate' | 'advanced'
  estimatedWeeks: number
}

export interface ExtractedSubject {
  name: string
  topics: ExtractedTopic[]
  totalDuration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  prerequisites: string[]
  description: string
  credits: number
}

export interface ExtractedTopic {
  title: string
  duration: number
  description: string
  learningObjectives: string[]
  resources: string[]
  chapter?: string
  pageNumbers?: number[]
}

// Extract text from PDF file
export async function extractPDFContent(file: File): Promise<ExtractedContent> {
  try {
    console.log(`📄 Extracting content from PDF: ${file.name}`)
    
    // Use real PDF parsing to extract text content
    const { extractTextFromPDF } = await import('./real-pdf-parser')
    const result = await extractTextFromPDF(file)
    
    return {
      rawText: result.text,
      pages: result.pages,
      metadata: result.metadata
    }
  } catch (error) {
    console.error('❌ Error extracting PDF content:', error)
    throw error
  }
}

// This function is no longer used - real PDF parsing is handled in real-pdf-parser.ts

// Analyze extracted content to identify subjects and topics
export async function analyzeSyllabusContent(content: ExtractedContent): Promise<AnalyzedSyllabus> {
  console.log('🔍 Analyzing syllabus content...')
  console.log(`📄 Content length: ${content.rawText.length} characters`)
  console.log(`📄 Content preview: ${content.rawText.substring(0, 500)}...`)
  
  // DYNAMIC EXTRACTION: Extract courses from ANY PDF format
  // Dynamic extraction - works with any subject area or PDF structure
  const { extractCoursesFromText } = await import('./real-pdf-parser')
  const extractedCourses = extractCoursesFromText(content.rawText)
  
  console.log(`📚 Found ${extractedCourses.length} courses from PDF (100% dynamic)`)
  
  // Convert extracted courses to subjects (focusing on title and credits only)
  const subjects = extractedCourses.map((course: any) => {
    // Calculate duration based on credits (1 credit = 1 hour per week)
    const totalDuration = (course.credits || 3) * 60 // Convert to minutes
    
    return {
      name: course.name,
      topics: generateTopicsForCourse(course.name, { theory: course.credits || 3, tutorial: 0, practical: 0 }),
      totalDuration,
      difficulty: determineSubjectDifficulty(course.name),
      prerequisites: extractPrerequisites(content.rawText, course.name),
      description: generateSubjectDescription(course.name),
      credits: course.credits || 3 // Use extracted credits
    }
  })
  
  console.log(`📚 Processed ${subjects.length} subjects`)
  
  const totalDuration = subjects.reduce((sum: number, subject: any) => sum + subject.totalDuration, 0)
  console.log(`⏱️ Total duration: ${Math.round(totalDuration / 60)} hours`)
  
  const result = {
    title: content.metadata.title || 'Extracted Syllabus',
    subjects,
    totalDuration,
    complexity: determineComplexity(totalDuration, subjects.length),
    estimatedWeeks: Math.ceil(totalDuration / (5 * 6 * 60)) // 5 days, 6 hours per day
  }
  
  console.log('✅ Syllabus analysis complete:', result)
  return result
}

// Extract subjects and topics from text using dynamic pattern matching
function extractSubjectsFromText(text: string): ExtractedSubject[] {
  const subjects: ExtractedSubject[] = []
  
  // Extract course information dynamically from the text (updated for actual PDF format)
  const courseRegex = /(\d+)\.\s*([^(]+)\s*\(([^)]+)\)/g
  const courseMatches = Array.from(text.matchAll(courseRegex))
  
  console.log(`📚 Found ${courseMatches.length} courses in PDF using regex pattern`)
  
  courseMatches.forEach((match, index) => {
    const courseNumber = match[1]
    const courseName = match[2].trim()
    const courseCode = match[3]
    
    console.log(`📖 Processing course ${index + 1}: ${courseName} (${courseCode})`)
    
    // Extract hours information for this course
    const courseSection = extractCourseSection(text, courseName)
    const hours = extractHoursFromSection(courseSection)
    const credits = extractCreditsFromSection(courseSection)
    
    console.log(`⏱️ Hours: Theory=${hours.theory}, Tutorial=${hours.tutorial}, Practical=${hours.practical}`)
    console.log(`🎓 Credits: ${credits}`)
    
    // Generate topics based on course content
    const topics = generateTopicsForCourse(courseName, hours)
    
    subjects.push({
      name: courseName,
      topics,
      totalDuration: topics.reduce((sum, topic) => sum + topic.duration, 0),
      difficulty: determineSubjectDifficulty(courseName),
      prerequisites: extractPrerequisites(text, courseName),
      description: generateSubjectDescription(courseName),
      credits: credits
    })
    
    console.log(`✅ Added subject: ${courseName} with ${topics.length} topics`)
  })
  
  // Also extract elective options if present
  const electiveRegex = /PROFESSIONAL ELECTIVE OPTIONS?:([\s\S]*?)(?=TOTAL:|$)/i
  const electiveMatch = text.match(electiveRegex)
  
  if (electiveMatch) {
    const electiveText = electiveMatch[1]
    const electiveLines = electiveText.split('\n').filter(line => line.trim().includes('-'))
    
    electiveLines.forEach(line => {
      const electiveMatch = line.match(/-\s*([^(]+)\s*\(([^)]+)\)/)
      if (electiveMatch) {
        const electiveName = electiveMatch[1].trim()
        const electiveCode = electiveMatch[2]
        
        subjects.push({
          name: electiveName,
          topics: generateTopicsForCourse(electiveName, { theory: 3, tutorial: 0, practical: 0 }),
          totalDuration: 180, // 3 hours * 60 minutes
          difficulty: 'intermediate',
          prerequisites: ['Basic programming', 'Business concepts'],
          description: `Elective course: ${electiveName}`,
          credits: 3
        })
      }
    })
  }
  
  return subjects
}

// Extract the section of text related to a specific course
function extractCourseSection(text: string, courseName: string): string {
  const lines = text.split('\n')
  let courseSection = ''
  let foundCourse = false
  
  for (const line of lines) {
    if (line.includes(courseName)) {
      foundCourse = true
      courseSection += line + '\n'
    } else if (foundCourse && (line.match(/^\d+\./) || line.includes('TOTAL:') || line.includes('PROFESSIONAL ELECTIVE'))) {
      break
    } else if (foundCourse) {
      courseSection += line + '\n'
    }
  }
  
  return courseSection
}

// Extract hours information from course section
function extractHoursFromSection(section: string): { theory: number; tutorial: number; practical: number } {
  const theoryMatch = section.match(/Theory:\s*(\d+)/i)
  const tutorialMatch = section.match(/Tutorial:\s*(\d+)/i)
  const practicalMatch = section.match(/Practical:\s*(\d+)/i)
  
  return {
    theory: theoryMatch ? parseInt(theoryMatch[1]) : 0,
    tutorial: tutorialMatch ? parseInt(tutorialMatch[1]) : 0,
    practical: practicalMatch ? parseInt(practicalMatch[1]) : 0
  }
}

// Extract credits from course section
function extractCreditsFromSection(section: string): number {
  // Try multiple patterns to find credits
  const patterns = [
    /Credits:\s*(\d+)/i,
    /Credit:\s*(\d+)/i,
    /(\d+)\s*credits?/i,
    /(\d+)\s*credit/i
  ]
  
  for (const pattern of patterns) {
    const match = section.match(pattern)
    if (match) {
      const credits = parseInt(match[1])
      console.log(`📊 Extracted credits: ${credits}`)
      return credits
    }
  }
  
  // If no credits found, use intelligent defaults based on hours
  const hours = extractHoursFromSection(section)
  const totalHours = hours.theory + hours.tutorial + hours.practical
  
  // Estimate credits based on total hours (typical: 1 credit = 1 hour per week)
  let estimatedCredits = Math.max(1, Math.round(totalHours))
  
  // Cap at reasonable limits
  if (estimatedCredits > 4) estimatedCredits = 4
  if (estimatedCredits < 1) estimatedCredits = 1
  
  console.log(`📊 Estimated credits based on hours (${totalHours}): ${estimatedCredits}`)
  return estimatedCredits
}

// Generate topics for a specific course
function generateTopicsForCourse(courseName: string, hours: { theory: number; tutorial: number; practical: number }): ExtractedTopic[] {
  const topics: ExtractedTopic[] = []
  
  // Generate theory topics
  if (hours.theory > 0) {
    const theoryTopics = generateTheoryTopics(courseName, hours.theory)
    topics.push(...theoryTopics)
  }
  
  // Generate tutorial topics
  if (hours.tutorial > 0) {
    const tutorialTopics = generateTutorialTopics(courseName, hours.tutorial)
    topics.push(...tutorialTopics)
  }
  
  // Generate practical topics
  if (hours.practical > 0) {
    const practicalTopics = generatePracticalTopics(courseName, hours.practical)
    topics.push(...practicalTopics)
  }
  
  return topics
}

// Generate theory topics based on course name (completely dynamic)
function generateTheoryTopics(courseName: string, hours: number): ExtractedTopic[] {
  const topics: ExtractedTopic[] = []
  const durationPerTopic = (hours * 60) / 3 // Distribute hours across 3 main topics
  
  // Generate dynamic topics based on course name analysis
  const courseWords = courseName.toLowerCase().split(/[\s&]+/).filter(word => word.length > 2)
  
  // Create topic titles based on course content
  const topicTitles = [
    `${courseName} Fundamentals`,
    `${courseName} Applications`, 
    `${courseName} Advanced Concepts`
  ]
  
  const topicDescriptions = [
    `Basic concepts and principles of ${courseName}`,
    `Practical applications and real-world usage of ${courseName}`,
    `Advanced topics and specialized areas in ${courseName}`
  ]
  
  const learningObjectives = [
    ['Understand fundamental concepts', 'Apply theoretical knowledge'],
    ['Solve practical problems', 'Implement solutions'],
    ['Master advanced techniques', 'Innovate and create']
  ]
  
  const resources = [
    ['Textbooks', 'Online resources', 'Reference materials'],
    ['Case studies', 'Practical tools', 'Software applications'],
    ['Research papers', 'Advanced tools', 'Professional resources']
  ]
  
  topicTitles.forEach((title, index) => {
    topics.push({
      title,
      duration: durationPerTopic,
      description: topicDescriptions[index],
      learningObjectives: learningObjectives[index],
      resources: resources[index],
      chapter: `Chapter ${index + 1}`
    })
  })
  
  console.log(`📚 Generated ${topics.length} topics for ${courseName}`)
  return topics
}

// Generate tutorial topics
function generateTutorialTopics(courseName: string, hours: number): ExtractedTopic[] {
  const duration = hours * 60
  return [{
    title: `${courseName} Tutorial Sessions`,
    duration,
    description: `Tutorial sessions for ${courseName}`,
    learningObjectives: ['Practice concepts', 'Solve problems', 'Get clarification'],
    resources: ['Problem sets', 'Solution guides', 'Tutorial materials'],
    chapter: 'Tutorial'
  }]
}

// Generate practical topics
function generatePracticalTopics(courseName: string, hours: number): ExtractedTopic[] {
  const duration = hours * 60
  return [{
    title: `${courseName} Laboratory/Practical`,
    duration,
    description: `Hands-on practical sessions for ${courseName}`,
    learningObjectives: ['Apply theoretical knowledge', 'Develop practical skills', 'Use tools and technologies'],
    resources: ['Laboratory equipment', 'Software tools', 'Practical guides'],
    chapter: 'Laboratory'
  }]
}

// Helper functions for content analysis
function determineComplexity(totalDuration: number, subjectCount: number): 'beginner' | 'intermediate' | 'advanced' {
  const avgDurationPerSubject = totalDuration / subjectCount
  if (avgDurationPerSubject < 300) return 'beginner'
  if (avgDurationPerSubject < 600) return 'intermediate'
  return 'advanced'
}

function determineSubjectDifficulty(subjectName: string): 'beginner' | 'intermediate' | 'advanced' {
  const subjectLower = subjectName.toLowerCase()
  
  // Analyze subject characteristics to determine difficulty
  const advancedKeywords = ['advanced', 'research', 'methodology', 'artificial intelligence', 'machine learning', 'software engineering', 'devops', 'analysis', 'optimization']
  const intermediateKeywords = ['networks', 'environmental', 'marketing', 'business', 'applications', 'management', 'systems', 'development']
  const beginnerKeywords = ['fundamentals', 'introduction', 'basic', 'principles', 'concepts', 'overview']
  
  if (advancedKeywords.some(keyword => subjectLower.includes(keyword))) {
    console.log(`🎓 Determined ${subjectName} as ADVANCED`)
    return 'advanced'
  }
  
  if (intermediateKeywords.some(keyword => subjectLower.includes(keyword))) {
    console.log(`🎓 Determined ${subjectName} as INTERMEDIATE`)
    return 'intermediate'
  }
  
  if (beginnerKeywords.some(keyword => subjectLower.includes(keyword))) {
    console.log(`🎓 Determined ${subjectName} as BEGINNER`)
    return 'beginner'
  }
  
  // Default to intermediate for unknown subjects
  console.log(`🎓 Default difficulty for ${subjectName}: INTERMEDIATE`)
  return 'intermediate'
}

function generateLearningObjectives(topicTitle: string): string[] {
  const objectives = [
    'Understand fundamental concepts',
    'Apply theoretical knowledge to practical problems',
    'Analyze and solve complex scenarios',
    'Develop critical thinking skills'
  ]
  
  // Add topic-specific objectives
  if (topicTitle.includes('Calculus')) {
    objectives.push('Calculate derivatives and integrals')
  }
  if (topicTitle.includes('Physics')) {
    objectives.push('Apply physical laws to real-world situations')
  }
  if (topicTitle.includes('Chemistry')) {
    objectives.push('Understand chemical reactions and bonding')
  }
  if (topicTitle.includes('Biology')) {
    objectives.push('Identify biological structures and processes')
  }
  
  return objectives
}

function generateResources(topicTitle: string): string[] {
  const baseResources = [
    'Textbook chapters',
    'Online resources',
    'Practice problems',
    'Reference materials'
  ]
  
  if (topicTitle.includes('Laboratory') || topicTitle.includes('Practical')) {
    baseResources.push('Laboratory equipment', 'Safety protocols')
  }
  
  return baseResources
}

function extractChapterNumber(text: string, topicTitle: string): string | undefined {
  // Look for chapter references in the text
  const chapterMatch = text.match(new RegExp(`chapter\\s+(\\d+)`, 'i'))
  return chapterMatch ? `Chapter ${chapterMatch[1]}` : undefined
}

function extractPageNumbers(text: string, topicTitle: string): number[] {
  // Look for page references
  const pageMatches = text.match(/page\s+(\d+)/gi)
  return pageMatches ? pageMatches.map(match => parseInt(match.replace(/page\s+/i, ''))) : []
}

function extractPrerequisites(text: string, subjectName: string): string[] {
  const prerequisites = ['Basic mathematics', 'General science knowledge']
  
  if (subjectName.includes('Calculus')) {
    prerequisites.push('Algebra', 'Trigonometry')
  }
  if (subjectName.includes('Physics')) {
    prerequisites.push('Mathematics', 'Basic physics')
  }
  if (subjectName.includes('Chemistry')) {
    prerequisites.push('Basic chemistry', 'Mathematics')
  }
  if (subjectName.includes('Biology')) {
    prerequisites.push('Basic biology', 'Chemistry')
  }
  
  return prerequisites
}

function generateSubjectDescription(subjectName: string): string {
  // Generate dynamic description based on subject name analysis
  const subjectWords = subjectName.toLowerCase().split(/[\s&]+/).filter(word => word.length > 2)
  
  // Analyze subject characteristics
  const isLab = subjectWords.some(word => ['lab', 'practical', 'workshop'].includes(word))
  const isElective = subjectWords.some(word => ['elective', 'optional'].includes(word))
  const isResearch = subjectWords.some(word => ['research', 'methodology', 'analysis'].includes(word))
  const isBusiness = subjectWords.some(word => ['business', 'marketing', 'management'].includes(word))
  const isTechnical = subjectWords.some(word => ['engineering', 'computing', 'networks', 'software'].includes(word))
  
  let description = `Comprehensive study of ${subjectName}`
  
  if (isLab) {
    description += ' with hands-on practical sessions and laboratory work'
  } else if (isElective) {
    description += ' as an elective course with specialized focus'
  } else if (isResearch) {
    description += ' with emphasis on research methodologies and analytical approaches'
  } else if (isBusiness) {
    description += ' with focus on business applications and practical implementation'
  } else if (isTechnical) {
    description += ' covering technical concepts, methodologies, and practical applications'
  } else {
    description += ' concepts, principles, and real-world applications'
  }
  
  console.log(`📝 Generated description for ${subjectName}: ${description}`)
  return description
}
