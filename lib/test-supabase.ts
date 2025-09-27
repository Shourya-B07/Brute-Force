import { supabase } from './supabase'

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  // Test 1: Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('📋 Configuration check:')
  console.log('- Supabase URL:', supabaseUrl ? '✅ Configured' : '❌ Missing')
  console.log('- Supabase Key:', supabaseKey ? '✅ Configured' : '❌ Missing')
  
  if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here') {
    console.error('❌ Supabase URL not configured properly')
    return false
  }
  
  if (!supabaseKey || supabaseKey === 'your_supabase_anon_key_here') {
    console.error('❌ Supabase Key not configured properly')
    return false
  }
  
  // Test 2: Try to connect to Supabase
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful')
    return true
  } catch (err) {
    console.error('❌ Supabase connection error:', err)
    return false
  }
}

export async function testSupabaseAuth() {
  console.log('🔍 Testing Supabase authentication...')
  
  try {
    // Try to get current session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Auth session error:', error.message)
      return false
    }
    
    console.log('✅ Supabase auth is working')
    console.log('- Current session:', session ? 'Active' : 'None')
    return true
  } catch (err) {
    console.error('❌ Supabase auth error:', err)
    return false
  }
}

export async function testSupabaseSignup() {
  console.log('🔍 Testing Supabase signup...')
  
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'password123'
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    })
    
    if (error) {
      console.error('❌ Supabase signup test failed:', error.message)
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText
      })
      return false
    }
    
    console.log('✅ Supabase signup test successful')
    console.log('- User created:', data.user ? 'Yes' : 'No')
    console.log('- Session created:', data.session ? 'Yes' : 'No')
    console.log('- Email confirmation required:', !data.session ? 'Yes' : 'No')
    
    return true
  } catch (err) {
    console.error('❌ Supabase signup test error:', err)
    return false
  }
}

// Run all tests
export async function runAllTests() {
  console.log('🚀 Running Supabase tests...')
  
  const connectionTest = await testSupabaseConnection()
  const authTest = await testSupabaseAuth()
  const signupTest = await testSupabaseSignup()
  
  console.log('\n📊 Test Results:')
  console.log('- Connection:', connectionTest ? '✅ Pass' : '❌ Fail')
  console.log('- Authentication:', authTest ? '✅ Pass' : '❌ Fail')
  console.log('- Signup:', signupTest ? '✅ Pass' : '❌ Fail')
  
  if (connectionTest && authTest && signupTest) {
    console.log('\n🎉 All tests passed! Supabase is configured correctly.')
  } else {
    console.log('\n⚠️ Some tests failed. Check the configuration.')
  }
  
  return { connectionTest, authTest, signupTest }
}
