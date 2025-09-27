'use client'

import { useState } from 'react'
import { testDatabaseConnection, testEnvironmentVariables } from '@/lib/test-auth'
import { supabase } from '@/lib/supabase'

export default function AuthDebug() {
  const [debugResults, setDebugResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (message: string) => {
    setDebugResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runDebugTests = async () => {
    setIsRunning(true)
    setDebugResults([])
    
    addResult('🔍 Starting authentication debug tests...')
    
    try {
      // Test 1: Environment Variables
      addResult('1️⃣ Testing environment variables...')
      const envTest = testEnvironmentVariables()
      if (!envTest) {
        addResult('❌ Environment variables test failed')
        return
      }
      addResult('✅ Environment variables test passed')
      
      // Test 2: Database Connection
      addResult('2️⃣ Testing database connection...')
      const dbTest = await testDatabaseConnection()
      if (!dbTest) {
        addResult('❌ Database connection test failed')
        return
      }
      addResult('✅ Database connection test passed')
      
      // Test 3: Check specific user
      addResult('3️⃣ Testing specific user lookup...')
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'shourya@gmail.com')
        .single()
      
      if (userError) {
        addResult(`❌ User lookup failed: ${userError.message}`)
      } else if (userData) {
        addResult(`✅ User found: ${userData.name} (${userData.email}) - Role: ${userData.role}`)
      } else {
        addResult('❌ User not found in database')
      }
      
      // Test 4: Test authentication
      addResult('4️⃣ Testing authentication...')
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'shourya@gmail.com',
        password: 'password'
      })
      
      if (authError) {
        addResult(`❌ Authentication failed: ${authError.message}`)
      } else if (authData.user) {
        addResult(`✅ Authentication successful for user: ${authData.user.id}`)
      } else {
        addResult('❌ No user data returned from authentication')
      }
      
      addResult('🎉 Debug tests completed!')
      
    } catch (error) {
      addResult(`❌ Debug test failed: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Debug Tool</h2>
        
        <div className="mb-6">
          <button
            onClick={runDebugTests}
            disabled={isRunning}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunning ? 'Running Tests...' : 'Run Debug Tests'}
          </button>
        </div>
        
        {debugResults.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Debug Results:</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {debugResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Common Issues:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Check if environment variables are set correctly</li>
            <li>• Verify Supabase project is active and accessible</li>
            <li>• Ensure user exists in both auth.users and custom users table</li>
            <li>• Check if user's role matches the selected role in login form</li>
            <li>• Verify password is correct (case-sensitive)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
