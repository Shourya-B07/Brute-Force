// Test file to debug authentication issues
import { supabase } from './supabase'

export async function testDatabaseConnection() {
  console.log('🧪 Testing Database Connection...')
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('1️⃣ Testing Supabase connection...')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful')
    
    // Test 2: Check if users table exists and has data
    console.log('2️⃣ Testing users table...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5)
    
    if (usersError) {
      console.error('❌ Users table query failed:', usersError.message)
      return false
    }
    
    console.log('✅ Users table accessible')
    console.log('📊 Found users:', users?.length || 0)
    
    if (users && users.length > 0) {
      console.log('👥 Sample users:')
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`)
      })
    }
    
    // Test 3: Test authentication with a known user
    console.log('3️⃣ Testing authentication...')
    const testEmail = 'teacher1@school.com'
    const testPassword = 'password'
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })
    
    if (authError) {
      console.error('❌ Authentication test failed:', authError.message)
      return false
    }
    
    if (authData.user) {
      console.log('✅ Authentication successful for test user')
      
      // Test 4: Check if user exists in custom users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()
      
      if (userError) {
        console.error('❌ Custom user table query failed:', userError.message)
        return false
      }
      
      if (userData) {
        console.log('✅ User found in custom table:', userData)
      } else {
        console.error('❌ User not found in custom users table')
        return false
      }
    }
    
    console.log('🎉 All tests passed!')
    return true
    
  } catch (error) {
    console.error('❌ Test failed with error:', error)
    return false
  }
}

// Test environment variables
export function testEnvironmentVariables() {
  console.log('🧪 Testing Environment Variables...')
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'JWT_SECRET'
  ]
  
  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars)
    return false
  }
  
  console.log('✅ All required environment variables are set')
  console.log('📋 Environment variables:')
  requiredVars.forEach(varName => {
    const value = process.env[varName]
    console.log(`  ${varName}: ${value ? '✅ Set' : '❌ Missing'}`)
  })
  
  return true
}

// Functions are already exported above
