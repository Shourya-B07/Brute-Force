'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  Upload,
  FileText,
  LogOut,
  Menu,
  X
} from 'lucide-react'

interface SidebarProps {
  userRole: 'student' | 'teacher' | 'admin'
}

export default function Sidebar({ userRole }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navigation = {
    student: [
      { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
      { name: 'My Timetable', href: '/student/timetable', icon: Calendar },
      { name: 'Attendance', href: '/student/attendance', icon: Users },
    ],
    teacher: [
      { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
      { name: 'Timetable', href: '/teacher/timetable', icon: Calendar },
      { name: 'Students', href: '/teacher/students', icon: Users },
      { name: 'Attendance', href: '/teacher/attendance', icon: BarChart3 },
      { name: 'Reports', href: '/teacher/reports', icon: FileText },
    ],
    admin: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Timetable Generator', href: '/admin/timetable', icon: Calendar },
      { name: 'Teachers', href: '/admin/teachers', icon: Users },
      { name: 'Students', href: '/admin/students', icon: Users },
      { name: 'Subjects', href: '/admin/subjects', icon: BookOpen },
      { name: 'Syllabus Upload', href: '/admin/syllabus', icon: Upload },
      { name: 'Reports', href: '/admin/reports', icon: FileText },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ]
  }

  const currentNavigation = navigation[userRole]

  const handleLogout = (): void => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-white shadow-md"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary-600">Smart Timetable</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {currentNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">
                  {userRole.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 capitalize">{userRole}</p>
                <p className="text-xs text-gray-600">User</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
