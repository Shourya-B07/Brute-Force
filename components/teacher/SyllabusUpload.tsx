'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle, Clock, BookOpen, Calendar } from 'lucide-react'
import { extractPDFContent, analyzeSyllabusContent, type AnalyzedSyllabus } from '@/lib/pdf-extractor'

interface SyllabusUploadProps {
  onSyllabusProcessed: (syllabusData: ProcessedSyllabus) => void
}

interface ProcessedSyllabus {
  title: string
  subjects: ExtractedSubject[]
  totalDuration: number
  complexity: 'beginner' | 'intermediate' | 'advanced'
  estimatedWeeks: number
}

interface ExtractedSubject {
  name: string
  topics: ExtractedTopic[]
  totalDuration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  prerequisites: string[]
  description: string
}

interface ExtractedTopic {
  title: string
  duration: number
  description: string
  learningObjectives: string[]
  resources: string[]
  chapter?: string
  pageNumbers?: number[]
}

interface TimetableSlot {
  subject: string
  topic: string
  duration: number
  day: string
  startTime: string
  endTime: string
  week: number
}

export default function SyllabusUpload({ onSyllabusProcessed }: SyllabusUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [processedSyllabus, setProcessedSyllabus] = useState<ProcessedSyllabus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file')
        return
      }
      if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
        setError('File size must be less than 50MB')
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      // Simulate file upload progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Process the syllabus
      await processSyllabus(file)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload syllabus. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const processSyllabus = async (file: File) => {
    setProcessing(true)
    setProgress(0)

    try {
      // Step 1: Extract PDF content
      setProgress(20)
      console.log('Extracting text from PDF...')
      const extractedContent = await extractPDFContent(file)
      
      // Step 2: Analyze content
      setProgress(40)
      console.log('Analyzing content structure...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Step 3: Identify subjects and topics
      setProgress(60)
      console.log('Identifying subjects and topics...')
      const analyzedSyllabus = await analyzeSyllabusContent(extractedContent)
      
      // Step 4: Calculate time requirements
      setProgress(80)
      console.log('Calculating time requirements...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Step 5: Generate optimal schedule
      setProgress(100)
      console.log('Generating optimal schedule...')
      
      console.log('Extracted syllabus:', analyzedSyllabus)
      console.log('Number of subjects:', analyzedSyllabus.subjects.length)
      console.log('Subjects:', analyzedSyllabus.subjects.map(s => s.name))
      
      // Convert AnalyzedSyllabus to ParsedSyllabus format for timetable generation
      const parsedSyllabus = {
        title: analyzedSyllabus.title,
        subjects: analyzedSyllabus.subjects.map(subject => ({
          name: subject.name,
          topics: subject.topics,
          totalDuration: subject.totalDuration,
          difficulty: subject.difficulty,
          credits: subject.credits,
          prerequisites: subject.prerequisites || [],
          description: subject.description || `Course: ${subject.name}`
        })),
        totalDuration: analyzedSyllabus.totalDuration,
        complexity: analyzedSyllabus.complexity,
        estimatedWeeks: analyzedSyllabus.estimatedWeeks
      }
      
      console.log('Converted to ParsedSyllabus:', parsedSyllabus)
      setProcessedSyllabus(analyzedSyllabus)
      onSyllabusProcessed(parsedSyllabus)
    } catch (err) {
      console.error('Processing error:', err)
      console.error('Error details:', err)
      setError(`Failed to process syllabus: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setProcessing(false)
    }
  }


  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const removeFile = () => {
    setFile(null)
    setProcessedSyllabus(null)
    setError(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Upload className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Upload Syllabus</h3>
        </div>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!file ? (
              <div className="space-y-4">
                <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Upload your syllabus PDF</p>
                  <p className="text-sm text-gray-500">Drag and drop or click to browse</p>
                  <p className="text-xs text-gray-400 mt-2">Maximum file size: 50MB</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                >
                  Choose File
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-primary-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {!processedSyllabus && (
                  <button
                    onClick={handleUpload}
                    disabled={uploading || processing}
                    className="btn-primary w-full"
                  >
                    {uploading ? 'Uploading...' : processing ? 'Processing...' : 'Process Syllabus'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {(uploading || processing) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{uploading ? 'Uploading...' : 'Processing...'}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Processing Results */}
      {processedSyllabus && (
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Syllabus Processed Successfully</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900">{processedSyllabus.subjects.length}</p>
              <p className="text-sm text-blue-700">Subjects</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">{processedSyllabus.subjects.reduce((total, subject) => total + subject.topics.length, 0)}</p>
              <p className="text-sm text-green-700">Topics</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-900">{Math.round(processedSyllabus.totalDuration / 60)}</p>
              <p className="text-sm text-purple-700">Total Hours</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Extracted from PDF:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Complexity Level:</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    processedSyllabus.complexity === 'beginner' ? 'bg-green-100 text-green-800' :
                    processedSyllabus.complexity === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {processedSyllabus.complexity.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Duration:</p>
                  <span className="text-sm font-medium text-gray-900">{processedSyllabus.estimatedWeeks} weeks</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Subjects Identified:</h4>
              <div className="space-y-3">
                {processedSyllabus.subjects.map((subject, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{subject.name}</h5>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          subject.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                          subject.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {subject.difficulty}
                        </span>
                        <span className="text-sm text-gray-500">{Math.round(subject.totalDuration / 60)}h</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{subject.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {subject.topics.slice(0, 3).map((topic, topicIndex) => (
                        <span key={topicIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {topic.title}
                        </span>
                      ))}
                      {subject.topics.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{subject.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Content Analysis Summary:</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Subject Breakdown:</h5>
                    <div className="space-y-2">
                      {processedSyllabus.subjects.map((subject, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{subject.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">{subject.topics.length} topics</span>
                            <span className="text-gray-500">{Math.round(subject.totalDuration / 60)}h</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Learning Objectives:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Understand fundamental concepts</li>
                      <li>• Apply theoretical knowledge</li>
                      <li>• Develop analytical skills</li>
                      <li>• Solve complex problems</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
