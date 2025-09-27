# Fix Supabase Password Storage Issue

## The Problem
Users are not being stored in Supabase with their passwords, so signin fails because there's no password to authenticate against.

## Root Causes
1. **Email confirmation required** - Supabase requires email confirmation before storing password
2. **Invalid Supabase configuration** - Missing or incorrect settings
3. **Authentication provider disabled** - Email authentication not enabled
4. **User creation failing** - Signup process not completing properly

## Step-by-Step Fix

### 1. Check Supabase Authentication Settings

Go to your Supabase Dashboard → Authentication → Settings:

#### **Email Settings:**
- ✅ **Enable email confirmations**: Set to **OFF** (This is crucial!)
- ✅ **Enable email change confirmations**: Set to **OFF**
- ✅ **Enable phone confirmations**: Set to **OFF**

#### **URL Configuration:**
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: Add these URLs:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/**`

### 2. Check Authentication Providers

Go to Authentication → Providers → Email:
- ✅ **Enable email provider**: Should be **ON**
- ✅ **Enable email confirmations**: Should be **OFF** for development

### 3. Test User Creation

Use the debug page to test:

1. **Go to `/debug` page**
2. **Enter test credentials**:
   - Email: `test@example.com`
   - Password: `password123`
   - Name: `Test User`
   - Role: `Student`
3. **Click "Test Supabase Signup"**
4. **Check the result** - should show "✅ Supabase signup successful"

### 4. Verify User in Supabase

1. **Click "List Supabase Users"** to see all users
2. **Click "Verify User"** to check if your user exists
3. **Check Supabase Dashboard** → Authentication → Users

## Debugging Steps

### **Step 1: Check Browser Console**
1. Open browser developer tools
2. Go to Console tab
3. Try signup
4. Look for detailed logs about user creation

### **Step 2: Use Debug Tools**
1. Go to `/debug` page
2. Use "Test Supabase Signup" to test user creation
3. Use "Verify User" to check if user exists
4. Use "List Supabase Users" to see all users

### **Step 3: Check Supabase Dashboard**
1. Go to your Supabase project
2. Navigate to Authentication → Users
3. Look for your test user
4. Check if user has confirmed email

## Common Issues and Solutions

### **Issue 1: "Email confirmation required"**
**Solution**: Disable email confirmation in Supabase settings
1. Go to Authentication → Settings
2. Set "Enable email confirmations" to **OFF**
3. Save changes

### **Issue 2: "User not found in Supabase"**
**Solution**: User creation failed
1. Check Supabase configuration
2. Verify environment variables
3. Try creating user manually in Supabase Dashboard

### **Issue 3: "Invalid credentials" during signin**
**Solution**: User exists but password not stored
1. Check if user was created properly
2. Verify email confirmation is disabled
3. Try creating user again

## Testing the Complete Flow

### **Test 1: User Creation**
1. Go to `/debug` page
2. Click "Test Supabase Signup"
3. Should show "✅ Supabase signup successful"
4. Click "Verify User" to confirm user exists

### **Test 2: User Authentication**
1. Use same credentials from Test 1
2. Click "Test Supabase Signin"
3. Should show "✅ Supabase signin successful"

### **Test 3: Complete Flow**
1. Go to main app signup form
2. Create account with test credentials
3. Try signing in with same credentials
4. Should work without errors

## Environment Variables Check

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: Replace placeholder values with your actual Supabase credentials.

## Supabase Dashboard Verification

### **Check Users Table:**
1. Go to Supabase Dashboard → Authentication → Users
2. Look for your test user
3. Check if user has:
   - ✅ Email confirmed
   - ✅ Created timestamp
   - ✅ Last sign in (if tested)

### **Check Database:**
1. Go to Supabase Dashboard → Table Editor
2. Check `users` table for your custom user record
3. Check `teachers` or `students` table for role-specific records

## Still Having Issues?

If users are still not being stored:

1. **Check Supabase project status** - ensure it's active
2. **Verify API keys** - ensure they're correct and active
3. **Check Row Level Security** - ensure RLS allows user creation
4. **Try manual user creation** in Supabase Dashboard
5. **Contact Supabase support** with specific error details

## Fallback Solution

If Supabase continues to have issues, the app includes fallback authentication:
- Mock users stored in localStorage
- Full functionality without Supabase
- Perfect for development and testing

The password storage should work correctly after applying these fixes!
