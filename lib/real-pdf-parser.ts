// Real PDF parsing implementation
// This would use actual PDF parsing libraries to extract text from uploaded PDFs

export interface PDFParseResult {
  text: string
  pages: number
  metadata: {
    title?: string
    author?: string
    creationDate?: string
  }
}

// Real PDF text extraction using pdf-parse library
export async function extractTextFromPDF(file: File): Promise<PDFParseResult> {
  try {
    console.log(`📄 Extracting text from PDF: ${file.name}`)
    
    // REAL PDF PARSING - Extract actual content from uploaded PDF
    console.log(`📄 Parsing actual PDF content from: ${file.name}`)
    console.log(`📄 File size: ${file.size} bytes`)
    
    // Use a more reliable PDF parsing approach
    try {
      const arrayBuffer = await file.arrayBuffer()
      console.log(`📄 PDF file size: ${arrayBuffer.byteLength} bytes`)
      
      // Try multiple PDF parsing approaches
      let extractedText = ''
      let pageCount = 1
      
        // Approach 1: Try pdfjs-dist with optimized settings
        try {
          const pdfjsLib = await import('pdfjs-dist')
          
          // Use a more reliable worker source
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
          
          const pdf = await pdfjsLib.getDocument({ 
            data: arrayBuffer,
            useWorkerFetch: false,
            isEvalSupported: false,
            useSystemFonts: true,
            disableFontFace: true,
            disableRange: true,
            disableStream: true
          }).promise
        
        console.log(`📄 PDF loaded: ${pdf.numPages} pages`)
        pageCount = pdf.numPages
        
        // Extract text from all pages with enhanced table format support
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          try {
            const page = await pdf.getPage(pageNum)
            const textContent = await page.getTextContent()
            
            // Enhanced text extraction for table formats
            const pageText = textContent.items
              .map((item: any) => {
                // Preserve line breaks and spacing for table formats
                if (item.hasEOL) {
                  return item.str + '\n'
                }
                return item.str + ' '
              })
              .join('')
              .replace(/\s+/g, ' ') // Normalize whitespace
              .replace(/\n\s+/g, '\n') // Clean up line breaks
            
            extractedText += pageText + '\n'
          } catch (pageError) {
            console.warn(`⚠️ Could not extract text from page ${pageNum}:`, pageError)
          }
        }
        
        console.log(`✅ Successfully extracted text from ${pdf.numPages} pages`)
        
      } catch (pdfjsError) {
        console.warn('⚠️ pdfjs-dist failed, trying alternative approach:', pdfjsError)
        
        // Approach 2: Try using a different PDF parsing library
        try {
          // Use pdf-parse as a fallback (if available)
          const pdfParse = await import('pdf-parse')
          const buffer = Buffer.from(arrayBuffer)
          const data = await pdfParse.default(buffer)
          
          extractedText = data.text
          pageCount = data.numpages
          
          console.log(`✅ Successfully extracted text using pdf-parse`)
          
        } catch (pdfParseError) {
          console.warn('⚠️ pdf-parse failed, trying basic text extraction:', pdfParseError)
          
          // Approach 3: Basic text extraction as last resort
          const text = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
              const result = e.target?.result as string
              resolve(result || '')
            }
            reader.onerror = () => reject(new Error('Failed to read PDF file'))
            reader.readAsText(file)
          })
          
          extractedText = text
          console.log(`✅ Using basic text extraction`)
        }
      }
      
      console.log(`📄 Extracted text length: ${extractedText.length} characters`)
      console.log(`📄 Text preview: ${extractedText.substring(0, 200)}...`)
      
      // If no text was extracted, throw an error instead of using hardcoded data
      if (extractedText.length === 0) {
        throw new Error('No text could be extracted from the PDF. Please try a different PDF file.')
      }
      
      // If extracted text looks corrupted, throw an error
      if (extractedText.includes('endstream') || extractedText.includes('endobj') || extractedText.includes('xref')) {
        throw new Error('PDF appears to be corrupted or encrypted. Please try a different PDF file.')
      }
      
      return {
        text: extractedText,
        pages: pageCount,
        metadata: {
          title: file.name.replace('.pdf', ''),
          author: 'Unknown',
          creationDate: new Date().toISOString()
        }
      }
      
    } catch (error) {
      console.error('❌ All PDF parsing methods failed:', error)
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    
  } catch (error) {
    console.error('❌ Error extracting text from PDF:', error)
    throw error
  }
}

// Enhanced course extraction with multiple patterns
export function extractCoursesFromText(text: string): Array<{
  number: string
  name: string
  code: string
  credits?: number
  hours?: { theory: number; tutorial: number; practical: number }
}> {
  const courses: Array<{
    number: string
    name: string
    code: string
    credits?: number
    hours?: { theory: number; tutorial: number; practical: number }
  }> = []
  
  console.log('🔍 Extracting courses from PDF text...')
  console.log(`📄 Text length: ${text.length} characters`)
  console.log(`📄 Text preview: ${text.substring(0, 500)}...`)
  
  // Comprehensive patterns to extract Course Title and Credits from ANY table format PDF
  const patterns = [
    // Pattern 1: "Course Title: [Title]" followed by "Credits: [Number]"
    /Course Title:\s*([^\n\r]+)\s*[\n\r]+Credits:\s*(\d+)/gi,
    // Pattern 2: "Course Title: [Title]" and "Credits: [Number]" on separate lines
    /Course Title:\s*([^\n\r]+).*?Credits:\s*(\d+)/gi,
    // Pattern 3: Table format with title and credits
    /([A-Za-z\s&\-\+\(\)\/]+?)\s+(\d+)\s*credits?/gi,
    // Pattern 4: Numbered courses "1. [Title] ([Code]) - [Credits] credits"
    /(\d+)\.\s*([^(]+?)\s*\(([^)]+)\)\s*[-\s]*(\d+)\s*credits?/gi,
    // Pattern 5: Generic course format "[Title] - [Credits] Credits"
    /([A-Za-z\s&\-\+\(\)\/]+?)\s*-\s*(\d+)\s*Credits?/gi,
    // Pattern 6: Course name followed by credits in parentheses
    /([A-Za-z\s&\-\+\(\)\/]+?)\s*\((\d+)\s*credits?\)/gi,
    // Pattern 7: Simple format "Subject Name Credits: X"
    /([A-Za-z\s&\-\+\(\)\/]+?)\s+Credits:\s*(\d+)/gi,
    // Pattern 8: Course name with credits at end of line
    /([A-Za-z\s&\-\+\(\)\/]+?)\s+(\d+)\s*$/gm,
    // Pattern 9: Course name followed by credits (space separated)
    /([A-Za-z\s&\-\+\(\)\/]+?)\s+(\d+)\s*credits?/gi,
    // Pattern 10: Course name with credits after colon
    /([A-Za-z\s&\-\+\(\)\/]+?):\s*(\d+)/gi,
    // Pattern 11: Table format - Course title followed by credits (for VI Semester format)
    /([A-Za-z\s&\-\+\(\)\/]+?)\s+(\d+)\s*$/gm,
    // Pattern 12: Course title with credits in table format
    /([A-Za-z\s&\-\+\(\)\/]+?)\s+(\d+)\s*$/gm,
    // Pattern 13: Generic course pattern (removed hardcoded course names)
    /([A-Za-z][A-Za-z\s&\-\+\(\)\/]{4,})\s+(\d+)/gi,
    // Pattern 14: Course titles with credits (space separated)
    /([A-Za-z][A-Za-z\s&\-\+\(\)\/]{2,})\s+(\d+)\s*$/gm,
    // Pattern 15: Very broad pattern for any text followed by number
    /([A-Za-z][A-Za-z\s&\-\+\(\)\/]{1,})\s+(\d+)/gi,
    // Pattern 16: Table row format - Course name with credits (enhanced for table formats)
    /([A-Za-z][A-Za-z\s&\-\+\(\)\/]{3,})\s+(\d+)\s*$/gm,
    // Pattern 17: Course name with credits (tab or space separated)
    /([A-Za-z][A-Za-z\s&\-\+\(\)\/]{3,})\s+(\d+)\s*$/gm,
    // Pattern 18: Course name with credits (multiple spaces)
    /([A-Za-z][A-Za-z\s&\-\+\(\)\/]{3,})\s+(\d+)\s*$/gm,
    // Pattern 19: Course name with credits (end of line)
    /([A-Za-z][A-Za-z\s&\-\+\(\)\/]{3,})\s+(\d+)\s*$/gm,
    // Pattern 20: Course name with credits (any format)
    /([A-Za-z][A-Za-z\s&\-\+\(\)\/]{3,})\s+(\d+)/gi
  ]
  
  patterns.forEach((pattern, patternIndex) => {
    console.log(`🔍 Trying pattern ${patternIndex + 1}: ${pattern}`)
    const matches = Array.from(text.matchAll(pattern))
    console.log(`📚 Found ${matches.length} matches with pattern ${patternIndex + 1}`)
    
    matches.forEach((match, index) => {
      let courseTitle: string
      let credits: number
      
      // Handle different match patterns
      if (patternIndex === 3) {
        // Pattern 4: Numbered courses with course code "1. [Title] ([Code]) - [Credits] credits"
        courseTitle = match[2].trim()
        credits = parseInt(match[4])
      } else {
        // All other patterns
        courseTitle = match[1].trim()
        credits = parseInt(match[2])
      }
      
      // Clean up course title (remove extra whitespace, special characters)
      courseTitle = courseTitle.replace(/\s+/g, ' ').trim()
      
      // Focused filtering for course titles and credits only
      const skipPatterns = [
        /^total/i,
        /^tota/i,
        /^credits?$/i,
        /^course/i,
        /^title/i,
        /^semester/i,
        /^syllabus/i,
        /^page/i,
        /^chapter/i,
        /^section/i,
        /^table/i,
        /^figure/i,
        /^appendix/i,
        /^reference/i,
        /^bibliography/i,
        /^index/i,
        /^contents/i,
        /^abstract/i,
        /^introduction/i,
        /^conclusion/i,
        /^\d+$/,
        /^[a-z]$/i,
        /^[^a-zA-Z]*$/,
        /^[^a-zA-Z]*[a-zA-Z]{1,2}[^a-zA-Z]*$/,
        /^[A-Z]{1,3}$/, // Single letters or short acronyms
        /^\d+[a-zA-Z]?$/, // Numbers with optional letter
        /^[^a-zA-Z]*$/, // No letters at all
        /^.{1,2}$/, // Very short text
        /^[^a-zA-Z]*[a-zA-Z]{1,2}[^a-zA-Z]*$/, // Mostly non-letters
        /^vi\s+semester/i, // Skip "VI SEMESTER" header
        /^sl\.?\s*no/i, // Skip "Sl. No" header
        /^teaching\s+hours/i, // Skip "Teaching Hours" header
        /^examination/i, // Skip "Examination" header
        /^total\s+teaching/i, // Skip "Total Teaching" row
        /^total\s+examination/i, // Skip "Total Examination" row
        /^total\s+credits/i, // Skip "Total Credits" row
        /endstream/i, // Skip PDF corruption text
        /endobj/i, // Skip PDF corruption text
        /xref/i, // Skip PDF corruption text
        /^R\s*\/Info/i, // Skip PDF corruption text
        /^stream/i, // Skip PDF corruption text
        /^obj/i, // Skip PDF corruption text
        /^startxref/i, // Skip PDF corruption text
        /^trailer/i // Skip PDF corruption text
      ]
      
      const shouldSkip = skipPatterns.some(pattern => pattern.test(courseTitle))
      
      // Enhanced validation for course titles and credits (works with any table format)
      const isValidCourse = courseTitle && 
          courseTitle.length >= 3 && // Minimum 3 characters
          !isNaN(credits) && 
          credits >= 0 && 
          credits <= 20 && // Allow up to 20 credits
          !shouldSkip &&
          // Course title must be a valid course name
          /[a-zA-Z]/.test(courseTitle) && // Must contain letters
          courseTitle.split(' ').length >= 1 && // Must have at least 1 word (flexible for short courses)
          !courseTitle.match(/^\d+/) && // Must not start with number
          !courseTitle.match(/^[^a-zA-Z]/) && // Must start with letter
          !courseTitle.includes('VI SEMESTER') && // Skip if contains header
          !courseTitle.match(/^[A-Z]{1,3}\s+[A-Z]{1,3}$/) && // Skip short acronyms
          !courseTitle.includes('endstream') && // Skip PDF corruption
          !courseTitle.includes('endobj') && // Skip PDF corruption
          !courseTitle.includes('xref') && // Skip PDF corruption
          !courseTitle.includes('R /Info') && // Skip PDF corruption
          !courseTitle.includes('stream') && // Skip PDF corruption
          !courseTitle.includes('obj') && // Skip PDF corruption
          !courseTitle.includes('startxref') && // Skip PDF corruption
          !courseTitle.includes('trailer') && // Skip PDF corruption
          // Additional validation for table formats
          courseTitle.length >= 3 && // Must be at least 3 characters
          !courseTitle.match(/^\d+/) && // Must not start with number
          !courseTitle.match(/^[^a-zA-Z]/) && // Must start with letter
          // Must contain at least one letter (flexible for various course names)
          /[a-zA-Z]/.test(courseTitle)
      
      if (isValidCourse) {
        console.log(`📖 Extracted course ${index + 1}: ${courseTitle} (${credits} credits)`)
        
        courses.push({
          number: (courses.length + 1).toString(),
          name: courseTitle,
          code: `COURSE${courses.length + 1}`,
          credits: credits,
          hours: undefined // We only need title and credits
        })
      } else if (courseTitle && courseTitle.length > 3) {
        console.log(`⚠️ Skipped invalid course: "${courseTitle}" (${credits} credits)`)
      }
    })
  })
  
  // Remove duplicates based on course name (case-insensitive and similar names)
  const uniqueCourses = courses.filter((course, index, self) => 
    index === self.findIndex(c => {
      const name1 = c.name.toLowerCase().replace(/\s+/g, ' ').trim()
      const name2 = course.name.toLowerCase().replace(/\s+/g, ' ').trim()
      return name1 === name2 || 
             (name1.includes('credits') && name2 === name1.replace(' credits', '')) ||
             (name2.includes('credits') && name1 === name2.replace(' credits', '')) ||
             (name1 === name2.replace(' credits', '')) ||
             (name2 === name1.replace(' credits', ''))
    })
  )
  
  console.log(`✅ Extracted ${uniqueCourses.length} unique courses`)
  return uniqueCourses
}

// Extract course section from text
function extractCourseSection(text: string, courseName: string): string {
  const lines = text.split('\n')
  let courseSection = ''
  let foundCourse = false
  
  for (const line of lines) {
    if (line.includes(courseName)) {
      foundCourse = true
      courseSection += line + '\n'
    } else if (foundCourse && (line.match(/^\d+[\.\)\-\s]/) || line.includes('TOTAL:') || line.includes('COURSE STRUCTURE'))) {
      break
    } else if (foundCourse) {
      courseSection += line + '\n'
    }
  }
  
  return courseSection
}

// Extract credits from course section
function extractCreditsFromText(section: string): number | undefined {
  const patterns = [
    /Credits?:\s*(\d+)/i,
    /Credit:\s*(\d+)/i,
    /(\d+)\s*credits?/i,
    /(\d+)\s*credit/i
  ]
  
  for (const pattern of patterns) {
    const match = section.match(pattern)
    if (match) {
      return parseInt(match[1])
    }
  }
  
  return undefined
}

// Extract hours from course section
function extractHoursFromText(section: string): { theory: number; tutorial: number; practical: number } | undefined {
  const theoryMatch = section.match(/Theory[:\s]*(\d+)/i)
  const tutorialMatch = section.match(/Tutorial[:\s]*(\d+)/i)
  const practicalMatch = section.match(/Practical[:\s]*(\d+)/i)
  
  if (theoryMatch || tutorialMatch || practicalMatch) {
    return {
      theory: theoryMatch ? parseInt(theoryMatch[1]) : 0,
      tutorial: tutorialMatch ? parseInt(tutorialMatch[1]) : 0,
      practical: practicalMatch ? parseInt(practicalMatch[1]) : 0
    }
  }
  
  return undefined
}

// Functions are already exported above
