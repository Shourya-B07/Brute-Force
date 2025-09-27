'use client'

import { useState } from 'react'
import { Edit3, Trash2, Lock, Unlock } from 'lucide-react'

interface TimetableSlot {
  id: string
  day: number
  startTime: string
  endTime: string
  subject: string
  teacher: string
  room: string
  class: string
}

interface TimetableGridProps {
  slots: TimetableSlot[]
}

export default function TimetableGrid({ slots }: TimetableGridProps) {
  const [editingSlot, setEditingSlot] = useState<string | null>(null)
  const [lockedSlots, setLockedSlots] = useState<Set<string>>(new Set())

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
  ]

  const getSlotAtTime = (day: number, time: string) => {
    return slots.find(slot => 
      slot.day === day && 
      slot.startTime === time
    )
  }

  const toggleSlotLock = (slotId: string): void => {
    setLockedSlots(prev => {
      const newSet = new Set(prev)
      if (newSet.has(slotId)) {
        newSet.delete(slotId)
      } else {
        newSet.add(slotId)
      }
      return newSet
    })
  }

  const deleteSlot = (slotId: string): void => {
    // Implement slot deletion
    console.log('Deleting slot:', slotId)
  }

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      'Mathematics': 'bg-blue-100 text-blue-800 border-blue-200',
      'Physics': 'bg-green-100 text-green-800 border-green-200',
      'English': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Literature': 'bg-purple-100 text-purple-800 border-purple-200'
    }
    return colors[subject] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="w-20 p-3 text-left text-sm font-medium text-gray-700 border border-gray-200 bg-gray-50">
              Time
            </th>
            {days.map((day, index) => (
              <th key={day} className="p-3 text-center text-sm font-medium text-gray-700 border border-gray-200 bg-gray-50">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time, timeIndex) => (
            <tr key={time}>
              <td className="p-3 text-sm font-medium text-gray-700 border border-gray-200 bg-gray-50">
                {time}
              </td>
              {days.map((day, dayIndex) => {
                const slot = getSlotAtTime(dayIndex + 1, time)
                const isLocked = slot ? lockedSlots.has(slot.id) : false
                
                return (
                  <td key={`${day}-${time}`} className="p-2 border border-gray-200 min-w-32">
                    {slot ? (
                      <div className={`relative p-3 rounded-lg border ${getSubjectColor(slot.subject)} ${
                        isLocked ? 'opacity-75' : ''
                      }`}>
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{slot.subject}</p>
                          <p className="text-xs opacity-75">{slot.teacher}</p>
                          <p className="text-xs opacity-75">{slot.room}</p>
                          <p className="text-xs opacity-75">{slot.startTime} - {slot.endTime}</p>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingSlot(slot.id)}
                            className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
                            title="Edit slot"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => toggleSlotLock(slot.id)}
                            className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
                            title={isLocked ? "Unlock slot" : "Lock slot"}
                          >
                            {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                          </button>
                          <button
                            onClick={() => deleteSlot(slot.id)}
                            className="p-1 bg-white rounded shadow-sm hover:bg-gray-50 text-red-600"
                            title="Delete slot"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        
                        {isLocked && (
                          <div className="absolute top-1 left-1">
                            <Lock className="h-3 w-3 text-gray-500" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-400">Empty</span>
                      </div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
