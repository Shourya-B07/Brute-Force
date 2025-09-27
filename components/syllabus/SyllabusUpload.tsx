'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertTriangle, Download, Trash2 } from 'lucide-react'
import { SyllabusParser } from '@/lib/pdf-parser'

interface ParsedSyllabus {
  subjects: string[]
  topics: string[]
  durations: number[]
  prerequisites: string[]
  totalPages: number
}

export default function SyllabusUpload() {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedSyllabus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setError('File size must be less than 50MB')
      return
    }

    setUploadedFile(file)
    setError('')
    setLoading(true)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      const parser = new SyllabusParser()
      const parsed = await parser.parsePDF(buffer)
      
      setParsedData(parsed)
    } catch (err) {
      setError('Failed to parse PDF. Please try again.')
      console.error('PDF parsing error:', err)
    } finally {
      setLoading(false)
    }
  }

  const removeFile = (): void => {
    setUploadedFile(null)
    setParsedData(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const generateTimetable = (): void => {
    if (parsedData) {
      // Implement timetable generation from parsed syllabus
      console.log('Generating timetable from syllabus:', parsedData)
    }
  }

  const downloadParsedData = (): void => {
    if (parsedData) {
      const dataStr = JSON.stringify(parsedData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'parsed-syllabus.json'
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Syllabus Upload</h1>
        <p className="text-gray-600">Upload a PDF syllabus to automatically generate timetables</p>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
          />
          
          {!uploadedFile ? (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop your PDF syllabus here
                </p>
                <p className="text-gray-600">
                  or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    browse files
                  </button>
                </p>
              </div>
              <div className="text-sm text-gray-500">
                <p>Supports PDF files up to 50MB</p>
                <p>150-200 pages recommended for best results</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-gray-600">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={removeFile}
                className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Remove file
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {loading && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-800">Parsing PDF...</span>
          </div>
        )}
      </div>

      {/* Parsed Data */}
      {parsedData && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Parsed Syllabus Data</h3>
              <div className="flex gap-2">
                <button
                  onClick={downloadParsedData}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download JSON
                </button>
                <button
                  onClick={generateTimetable}
                  className="btn-primary flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Generate Timetable
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">Total Pages</p>
                <p className="text-2xl font-bold text-blue-900">{parsedData.totalPages}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">Subjects</p>
                <p className="text-2xl font-bold text-green-900">{parsedData.subjects.length}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-600">Topics</p>
                <p className="text-2xl font-bold text-yellow-900">{parsedData.topics.length}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600">Prerequisites</p>
                <p className="text-2xl font-bold text-purple-900">{parsedData.prerequisites.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subjects */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Detected Subjects</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {parsedData.subjects.map((subject, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-900">{subject}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topics */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Detected Topics</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {parsedData.topics.slice(0, 10).map((topic, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-900">{topic}</span>
                    </div>
                  ))}
                  {parsedData.topics.length > 10 && (
                    <p className="text-sm text-gray-500">
                      ... and {parsedData.topics.length - 10} more topics
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Prerequisites */}
            {parsedData.prerequisites.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Prerequisites</h4>
                <div className="flex flex-wrap gap-2">
                  {parsedData.prerequisites.map((prereq, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full"
                    >
                      {prereq}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
