// Debug authentication functions
export function debugSignin(email: string, password: string) {
  console.log('🔍 Debug Signin Process')
  console.log('Email:', email)
  console.log('Password length:', password.length)
  
  // Check localStorage for mock users
  if (typeof window !== 'undefined') {
    const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]')
    console.log('Mock users in localStorage:', mockUsers.length)
    console.log('Mock users:', mockUsers)
    
    const user = mockUsers.find((u: any) => u.email === email)
    console.log('Found user by email:', user)
    
    if (user) {
      console.log('User password match:', user.password === password)
    }
  }
  
  // Check environment variables
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set')
}

export function debugSignup(email: string, password: string, name: string, role: string) {
  console.log('🔍 Debug Signup Process')
  console.log('Email:', email)
  console.log('Password length:', password.length)
  console.log('Name:', name)
  console.log('Role:', role)
  
  // Check if user already exists
  if (typeof window !== 'undefined') {
    const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]')
    const existingUser = mockUsers.find((u: any) => u.email === email)
    console.log('User already exists:', !!existingUser)
  }
}

export function clearMockUsers() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mockUsers')
    console.log('✅ Mock users cleared')
  }
}

export function listMockUsers() {
  if (typeof window !== 'undefined') {
    const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]')
    console.log('📋 Mock Users:')
    mockUsers.forEach((user: any, index: number) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`)
    })
    return mockUsers
  }
  return []
}

export function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...')
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set')
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url_here') {
    console.error('❌ Supabase URL not configured')
    return false
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your_supabase_anon_key_here') {
    console.error('❌ Supabase Key not configured')
    return false
  }
  
  console.log('✅ Supabase configuration looks good')
  return true
}

export function diagnoseSigninIssue(email: string, password: string) {
  console.log('🔍 Diagnosing Signin Issue...')
  console.log('Email:', email)
  console.log('Password length:', password.length)
  
  // Check Supabase configuration
  const supabaseConfigured = testSupabaseConnection()
  
  // Check mock users
  const mockUsers = listMockUsers()
  const mockUser = mockUsers.find((u: any) => u.email === email)
  
  console.log('Supabase configured:', supabaseConfigured)
  console.log('Mock user found:', !!mockUser)
  console.log('Mock user password match:', mockUser ? mockUser.password === password : false)
  
  if (!supabaseConfigured && !mockUser) {
    console.error('❌ No authentication method available')
    return 'No authentication method available'
  }
  
  if (supabaseConfigured && !mockUser) {
    console.log('✅ Supabase configured, will try Supabase authentication')
    return 'Will try Supabase authentication'
  }
  
  if (!supabaseConfigured && mockUser) {
    console.log('✅ Mock user found, will use mock authentication')
    return 'Will use mock authentication'
  }
  
  return 'Multiple authentication methods available'
}
