'use client'

import { AlertTriangle, CheckCircle, XCircle, Clock, Users, MapPin } from 'lucide-react'

interface Conflict {
  type: 'teacher_conflict' | 'room_conflict' | 'student_conflict' | 'time_conflict'
  message: string
  severity: 'low' | 'medium' | 'high'
}

interface ConflictResolutionProps {
  conflicts: Conflict[]
}

export default function ConflictResolution({ conflicts }: ConflictResolutionProps) {
  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'teacher_conflict':
        return <Users className="h-5 w-5" />
      case 'room_conflict':
        return <MapPin className="h-5 w-5" />
      case 'student_conflict':
        return <Users className="h-5 w-5" />
      case 'time_conflict':
        return <Clock className="h-5 w-5" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-100 border-red-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'low':
        return 'text-blue-600 bg-blue-100 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getSuggestedSolutions = (conflict: Conflict) => {
    const solutions: { [key: string]: string[] } = {
      teacher_conflict: [
        'Assign a different teacher to one of the conflicting classes',
        'Reschedule one of the classes to a different time slot',
        'Split the class into smaller groups with different teachers'
      ],
      room_conflict: [
        'Assign a different room to one of the conflicting classes',
        'Reschedule one of the classes to a different time slot',
        'Use a larger room that can accommodate both classes'
      ],
      student_conflict: [
        'Reschedule one of the classes to a different time slot',
        'Split the class into smaller groups',
        'Assign different students to different class sections'
      ],
      time_conflict: [
        'Adjust the time slots to avoid overlap',
        'Reduce the duration of one of the classes',
        'Move one of the classes to a different day'
      ]
    }

    return solutions[conflict.type] || ['Contact administrator for assistance']
  }

  return (
    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <h4 className="text-lg font-semibold text-yellow-800">Conflicts Detected</h4>
        <span className="px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded-full">
          {conflicts.length} conflicts
        </span>
      </div>

      <div className="space-y-4">
        {conflicts.map((conflict, index) => (
          <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {getConflictIcon(conflict.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(conflict.severity)}`}>
                    {conflict.severity.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-600 capitalize">
                    {conflict.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-gray-900 mb-3">{conflict.message}</p>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Suggested Solutions:</p>
                  <ul className="space-y-1">
                    {getSuggestedSolutions(conflict).map((solution, solutionIndex) => (
                      <li key={solutionIndex} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{solution}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex gap-2">
                  <button className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 transition-colors">
                    Auto-resolve
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                    Manual fix
                  </button>
                  <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
                    Ignore
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Quick Actions</span>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
            Resolve All Conflicts
          </button>
          <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
            Export Conflict Report
          </button>
        </div>
      </div>
    </div>
  )
}
