import { supabase } from './supabase'

export async function verifySupabaseUser(email: string) {
  console.log('🔍 Verifying Supabase user:', email)
  
  try {
    // Check if user exists in Supabase auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return { exists: false, error: authError.message }
    }
    
    const user = authUsers.users.find(u => u.email === email)
    
    if (user) {
      console.log('✅ User found in Supabase auth:', {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at,
        last_sign_in_at: user.last_sign_in_at
      })
      
      return {
        exists: true,
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          email_confirmed_at: user.email_confirmed_at,
          last_sign_in_at: user.last_sign_in_at
        }
      }
    } else {
      console.log('❌ User not found in Supabase auth')
      return { exists: false, error: 'User not found' }
    }
  } catch (error) {
    console.error('❌ Error verifying user:', error)
    return { exists: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function testSupabaseSignup(email: string, password: string, name: string, role: string) {
  console.log('🧪 Testing Supabase signup...')
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    })
    
    if (error) {
      console.error('❌ Supabase signup test failed:', error)
      return {
        success: false,
        error: error.message,
        details: {
          message: error.message,
          status: error.status
        }
      }
    }
    
    console.log('✅ Supabase signup test successful:', {
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at
      } : null,
      session: data.session ? 'Created' : 'Not created'
    })
    
    return {
      success: true,
      user: data.user,
      session: data.session
    }
  } catch (error) {
    console.error('❌ Supabase signup test error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function testSupabaseSignin(email: string, password: string) {
  console.log('🧪 Testing Supabase signin...')
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('❌ Supabase signin test failed:', error)
      return {
        success: false,
        error: error.message,
        details: {
          message: error.message,
          status: error.status
        }
      }
    }
    
    console.log('✅ Supabase signin test successful:', {
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        last_sign_in_at: data.user.last_sign_in_at
      } : null,
      session: data.session ? 'Created' : 'Not created'
    })
    
    return {
      success: true,
      user: data.user,
      session: data.session
    }
  } catch (error) {
    console.error('❌ Supabase signin test error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function listSupabaseUsers() {
  console.log('📋 Listing Supabase users...')
  
  try {
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error listing auth users:', authError)
      return { users: [], error: authError.message }
    }
    
    console.log('📋 Found', authUsers.users.length, 'users in Supabase auth')
    authUsers.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.id}) - Created: ${user.created_at}`)
    })
    
    return {
      users: authUsers.users,
      count: authUsers.users.length
    }
  } catch (error) {
    console.error('❌ Error listing users:', error)
    return { users: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
