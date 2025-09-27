'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setError('Authentication failed. Please try again.')
          setLoading(false)
          return
        }

        if (data.session) {
          // User is authenticated, redirect to appropriate dashboard
          const user = data.session.user
          
          // Get user role from database
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role, name')
            .eq('id', user.id)
            .single()

          if (userError || !userData) {
            console.error('Failed to get user data:', userError)
            setError('Failed to load user data. Please try signing in again.')
            setLoading(false)
            return
          }

          // Store user data
          localStorage.setItem('user', JSON.stringify({
            id: user.id,
            email: user.email,
            role: userData.role,
            name: userData.name
          }))
          localStorage.setItem('token', 'supabase-jwt-token')

          // Redirect based on role
          switch (userData.role) {
            case 'admin':
              router.push('/admin/dashboard')
              break
            case 'teacher':
              router.push('/teacher/dashboard')
              break
            case 'student':
              router.push('/student/dashboard')
              break
            default:
              router.push('/')
          }
        } else {
          setError('No active session found. Please try signing in again.')
          setLoading(false)
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError('Authentication failed. Please try again.')
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing your registration...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Failed</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
