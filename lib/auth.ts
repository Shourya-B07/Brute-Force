import jwt from 'jsonwebtoken'
import { supabase } from './supabase'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthUser {
  id: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  name: string
  needsEmailConfirmation?: boolean
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  try {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || !supabaseKey || supabaseKey === 'your_supabase_anon_key_here') {
      console.error('❌ Supabase not configured. Using fallback authentication for development.')
      
      // Check if user exists in mock users
      if (typeof window !== 'undefined') {
        const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]')
        const user = mockUsers.find((u: any) => u.email === email && u.password === password)
        
        if (user) {
          console.log('✅ Mock user authenticated for development:', user)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } else {
          console.error('❌ Mock user not found or invalid credentials')
          return null
        }
      }
      
      // Fallback - create a mock user if none exists
      const mockUser: AuthUser = {
        id: `mock-${Date.now()}`,
        email,
        name: email.split('@')[0],
        role: 'student', // Default role for development
      }
      
      console.log('✅ Mock user created for development:', mockUser)
      return mockUser
    }

    console.log('🔐 Attempting authentication for:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('❌ Supabase auth error:', error.message)
      // Return more specific error information
      throw new Error(`Authentication failed: ${error.message}`)
    }

    if (!data.user) {
      console.error('❌ No user data returned from Supabase')
      return null
    }

    console.log('✅ Supabase authentication successful for user:', data.user.id)

    // Get user role from our custom user table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (userError) {
      console.error('❌ Database query error:', userError.message)
      return null
    }

    if (!userData) {
      console.error('❌ User not found in custom users table')
      console.log('🔧 Attempting to create user record...')
      
      // Try to create the user record in our custom users table
      const { data: newUserData, error: createError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          role: 'student' // Default role
        })
        .select()
        .single()
      
      if (createError || !newUserData) {
        console.error('❌ Failed to create user record:', createError?.message)
        return null
      }
      
      console.log('✅ User record created successfully')
      
      // Since this is a fallback case with default 'student' role, create student record
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          user_id: newUserData.id,
          name: newUserData.name,
          email: newUserData.email,
          class_name: 'Unassigned',
          subjects: []
        })

      if (studentError) {
        console.error('❌ Failed to create student record:', studentError.message)
      } else {
        console.log('✅ Student record created successfully')
      }
      
      return {
        id: newUserData.id,
        email: newUserData.email,
        role: newUserData.role,
        name: newUserData.name,
      }
    }

    console.log('✅ User data retrieved:', { id: userData.id, email: userData.email, role: userData.role, name: userData.name })

    // Ensure role-specific records exist
    if (userData.role === 'teacher') {
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', userData.id)
        .single()

      if (teacherError && teacherError.code === 'PGRST116') {
        // Teacher record doesn't exist, create it
        console.log('🔧 Creating missing teacher record...')
        const { error: createTeacherError } = await supabase
          .from('teachers')
          .insert({
            user_id: userData.id,
            name: userData.name,
            email: userData.email,
            subjects: [],
            max_hours_per_day: 8,
            max_hours_per_week: 40,
            availability: []
          })

        if (createTeacherError) {
          console.error('❌ Failed to create teacher record:', createTeacherError.message)
        } else {
          console.log('✅ Teacher record created successfully')
        }
      }
    } else if (userData.role === 'student') {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', userData.id)
        .single()

      if (studentError && studentError.code === 'PGRST116') {
        // Student record doesn't exist, create it
        console.log('🔧 Creating missing student record...')
        const { error: createStudentError } = await supabase
          .from('students')
          .insert({
            user_id: userData.id,
            name: userData.name,
            email: userData.email,
            class_name: 'Unassigned',
            subjects: []
          })

        if (createStudentError) {
          console.error('❌ Failed to create student record:', createStudentError.message)
        } else {
          console.log('✅ Student record created successfully')
        }
      }
    }

    return {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      name: userData.name,
    }
  } catch (error) {
    console.error('❌ Authentication error:', error)
    return null
  }
}

export async function createUser(email: string, password: string, name: string, role: 'student' | 'teacher' | 'admin'): Promise<AuthUser | null> {
  try {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || !supabaseKey || supabaseKey === 'your_supabase_anon_key_here') {
      console.error('❌ Supabase not configured. Using fallback authentication for development.')
      
      // Fallback for development - create a mock user
      const mockUser: AuthUser = {
        id: `mock-${Date.now()}`,
        email,
        name,
        role,
      }
      
      // Store mock user data in localStorage for development
      if (typeof window !== 'undefined') {
        const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]')
        existingUsers.push({
          ...mockUser,
          password: password, // Store for mock authentication
          createdAt: new Date().toISOString()
        })
        localStorage.setItem('mockUsers', JSON.stringify(existingUsers))
      }
      
      console.log('✅ Mock user created for development:', mockUser)
      return mockUser
    }

    console.log('🔐 Attempting to create user:', email, 'with role:', role)
    
    // Try signup with minimal options first
    let { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    
    // If the first attempt fails with 400, try without redirect
    if (error && error.status === 400) {
      console.log('🔄 First signup attempt failed, trying without redirect...')
      const retryResult = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: role
          }
        }
      })
      data = retryResult.data
      error = retryResult.error
    }

    if (error) {
      console.error('❌ Supabase auth signup error:', error)
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText
      })
      
      // Handle specific error cases
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        throw new Error('An account with this email already exists. Please try signing in instead.')
      } else if (error.message.includes('Invalid email') || error.message.includes('invalid email')) {
        throw new Error('Please enter a valid email address.')
      } else if (error.message.includes('Password') || error.message.includes('password')) {
        throw new Error('Password must be at least 6 characters long and contain letters and numbers.')
      } else if (error.message.includes('confirm') || error.message.includes('email confirmation')) {
        throw new Error('Email confirmation is required. Please check your email and click the confirmation link.')
      } else if (error.status === 400) {
        throw new Error('Invalid signup request. Please check your email format and password strength.')
      } else {
        throw new Error(`Signup failed: ${error.message}`)
      }
    }

    if (!data.user) {
      console.error('❌ No user data returned from Supabase')
      throw new Error('Signup failed: No user data returned')
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      console.log('📧 Email confirmation required. Please check your email.')
      // Don't throw an error here, just inform the user
      return {
        id: data.user.id,
        email: data.user.email || email,
        role: role,
        name: name,
        needsEmailConfirmation: true
      }
    }

    // Only create database records if user is fully authenticated (has session)
    if (data.session) {
      // Create user record in our custom users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email,
          name,
          role,
        })
        .select()
        .single()

      if (userError) {
        console.error('❌ Database user creation error:', userError.message)
        throw new Error(`Database error: ${userError.message}`)
      }

      if (!userData) {
        console.error('❌ No user data returned from database')
        throw new Error('Database error: No user data returned')
      }

      // Create role-specific records
      if (role === 'teacher') {
        console.log('🔧 Creating teacher record for user:', data.user.id)
        
        const teacherData = {
          user_id: data.user.id,
          name,
          email,
          subjects: [],
          max_hours_per_day: 8,
          max_hours_per_week: 40,
          availability: []
        }
        
        console.log('🔧 Teacher data to insert:', teacherData)
        
        // Check if teacher record already exists
        const { data: existingTeacher, error: checkError } = await supabase
          .from('teachers')
          .select('id')
          .eq('user_id', data.user.id)
          .single()

        if (existingTeacher) {
          console.log('✅ Teacher record already exists for user:', data.user.id)
        } else {
          const { data: teacherResult, error: teacherError } = await supabase
            .from('teachers')
            .insert(teacherData)
            .select()

          if (teacherError) {
            console.error('❌ Teacher record creation error:', teacherError)
            console.error('❌ Error details:', {
              message: teacherError.message,
              details: teacherError.details,
              hint: teacherError.hint,
              code: teacherError.code
            })
            // Don't fail the entire signup, but log the error for debugging
            console.warn('⚠️ Teacher record creation failed, but user account was created')
          } else {
            console.log('✅ Teacher record created successfully:', teacherResult)
          }
        }
      } else if (role === 'student') {
        console.log('🔧 Creating student record for user:', data.user.id)
        
        // Check if student record already exists
        const { data: existingStudent, error: checkError } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', data.user.id)
          .single()

        if (existingStudent) {
          console.log('✅ Student record already exists for user:', data.user.id)
        } else {
          const { data: studentResult, error: studentError } = await supabase
            .from('students')
            .insert({
              user_id: data.user.id,
              name,
              email,
              class_name: 'Unassigned', // Default class, can be updated later
              subjects: []
            })
            .select()

          if (studentError) {
            console.error('❌ Student record creation error:', studentError)
            console.error('❌ Error details:', {
              message: studentError.message,
              details: studentError.details,
              hint: studentError.hint,
              code: studentError.code
            })
            // Don't fail the entire signup, but log the error for debugging
            console.warn('⚠️ Student record creation failed, but user account was created')
          } else {
            console.log('✅ Student record created successfully:', studentResult)
          }
        }
      }

      return {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        name: userData.name,
      }
    } else {
      // User needs email confirmation
      return {
        id: data.user.id,
        email: data.user.email || email,
        role: role,
        name: name,
        needsEmailConfirmation: true
      }
    }
  } catch (error) {
    console.error('User creation error:', error)
    return null
  }
}
