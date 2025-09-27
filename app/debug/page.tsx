'use client'

import { useState } from 'react'
import { debugSignin, debugSignup, clearMockUsers, listMockUsers, diagnoseSigninIssue } from '@/lib/debug-auth'
import { authenticateUser, createUser } from '@/lib/auth'
import { verifySupabaseUser, testSupabaseSignup, testSupabaseSignin, listSupabaseUsers } from '@/lib/verify-supabase'

export default function DebugPage() {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password123')
  const [name, setName] = useState('Test User')
  const [role, setRole] = useState('student')
  const [result, setResult] = useState('')

  const handleTestSignin = async () => {
    console.log('🧪 Testing Signin...')
    debugSignin(email, password)
    
    try {
      const user = await authenticateUser(email, password)
      if (user) {
        setResult(`✅ Signin successful: ${user.name} (${user.role})`)
        console.log('✅ Signin result:', user)
      } else {
        setResult('❌ Signin failed: Invalid credentials')
        console.log('❌ Signin failed')
      }
    } catch (error) {
      setResult(`❌ Signin error: ${error}`)
      console.error('❌ Signin error:', error)
    }
  }

  const handleTestSignup = async () => {
    console.log('🧪 Testing Signup...')
    debugSignup(email, password, name, role)
    
    try {
      const user = await createUser(email, password, name, role as any)
      if (user) {
        setResult(`✅ Signup successful: ${user.name} (${user.role})`)
        console.log('✅ Signup result:', user)
      } else {
        setResult('❌ Signup failed')
        console.log('❌ Signup failed')
      }
    } catch (error) {
      setResult(`❌ Signup error: ${error}`)
      console.error('❌ Signup error:', error)
    }
  }

  const handleListUsers = () => {
    const users = listMockUsers()
    setResult(`📋 Found ${users.length} mock users`)
    console.log('📋 Mock users:', users)
  }

  const handleClearUsers = () => {
    clearMockUsers()
    setResult('✅ Mock users cleared')
  }

  const handleDiagnose = () => {
    const diagnosis = diagnoseSigninIssue(email, password)
    setResult(`🔍 Diagnosis: ${diagnosis}`)
    console.log('🔍 Diagnosis result:', diagnosis)
  }

  const handleVerifyUser = async () => {
    console.log('🔍 Verifying Supabase user...')
    const verification = await verifySupabaseUser(email)
    if (verification.exists) {
      setResult(`✅ User exists in Supabase: ${verification.user?.email}`)
    } else {
      setResult(`❌ User not found in Supabase: ${verification.error}`)
    }
  }

  const handleTestSupabaseSignup = async () => {
    console.log('🧪 Testing Supabase signup...')
    const result = await testSupabaseSignup(email, password, name, role)
    if (result.success) {
      setResult(`✅ Supabase signup successful: ${result.user?.email}`)
    } else {
      setResult(`❌ Supabase signup failed: ${result.error}`)
    }
  }

  const handleTestSupabaseSignin = async () => {
    console.log('🧪 Testing Supabase signin...')
    const result = await testSupabaseSignin(email, password)
    if (result.success) {
      setResult(`✅ Supabase signin successful: ${result.user?.email}`)
    } else {
      setResult(`❌ Supabase signin failed: ${result.error}`)
    }
  }

  const handleListSupabaseUsers = async () => {
    console.log('📋 Listing Supabase users...')
    const result = await listSupabaseUsers()
    setResult(`📋 Found ${result.count} users in Supabase`)
    console.log('📋 Supabase users:', result.users)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Debug</h1>
          
          <div className="space-y-6">
            {/* Test Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Test Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleTestSignup}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Test Signup
              </button>
              <button
                onClick={handleTestSignin}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Test Signin
              </button>
              <button
                onClick={handleListUsers}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                List Users
              </button>
              <button
                onClick={handleClearUsers}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Clear Users
              </button>
              <button
                onClick={handleDiagnose}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Diagnose Issue
              </button>
              <button
                onClick={handleVerifyUser}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Verify User
              </button>
              <button
                onClick={handleTestSupabaseSignup}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Test Supabase Signup
              </button>
              <button
                onClick={handleTestSupabaseSignin}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Test Supabase Signin
              </button>
              <button
                onClick={handleListSupabaseUsers}
                className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                List Supabase Users
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Result:</h3>
                <p className="text-sm text-gray-900">{result}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Instructions:</h3>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. First, test signup to create a user</li>
                <li>2. Then, test signin with the same credentials</li>
                <li>3. Check the browser console for detailed logs</li>
                <li>4. Use "List Users" to see all mock users</li>
                <li>5. Use "Clear Users" to reset if needed</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}