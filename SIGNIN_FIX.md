# Fix Supabase Signin 400 Error

## The Problem
You're getting a 400 Bad Request error from Supabase's `/auth/v1/token` endpoint during signin. This is a common Supabase authentication configuration issue.

## Quick Fix Steps

### 1. Check Supabase Authentication Settings

Go to your Supabase Dashboard → Authentication → Settings:

#### **Email Settings:**
- ✅ **Enable email confirmations**: Set to **OFF** for immediate signin
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

### 3. Verify User Exists

The 400 error often means the user doesn't exist in Supabase's auth system. Check:

1. **Go to Authentication → Users** in Supabase Dashboard
2. **Look for your user** by email
3. **If user doesn't exist**, you need to sign up first
4. **If user exists but not confirmed**, disable email confirmation

### 4. Test with Simple Credentials

Try signing in with:
- **Email**: `test@example.com`
- **Password**: `password123`

## Common Causes and Solutions

### **Cause 1: Email Confirmation Required**
**Solution**: Disable email confirmation in Supabase settings
1. Go to Authentication → Settings
2. Set "Enable email confirmations" to **OFF**
3. Save changes

### **Cause 2: User Doesn't Exist**
**Solution**: Create the user first
1. Try signing up with the same credentials
2. Then try signing in

### **Cause 3: Invalid Supabase Configuration**
**Solution**: Check environment variables
1. Verify `.env.local` has correct Supabase URL and key
2. Restart development server after changes

### **Cause 4: Authentication Provider Disabled**
**Solution**: Enable email authentication
1. Go to Authentication → Providers → Email
2. Make sure "Enable email provider" is **ON**

## Debug Steps

### **Step 1: Check Browser Console**
1. Open browser developer tools
2. Go to Console tab
3. Try signing in
4. Look for detailed error messages

### **Step 2: Check Network Tab**
1. Go to Network tab in developer tools
2. Try signing in
3. Look for the failed request to `/auth/v1/token`
4. Check the response for error details

### **Step 3: Test with Debug Page**
1. Go to `/debug` page
2. Test signup first
3. Then test signin with same credentials
4. Check console for detailed logs

## Alternative Solutions

### **Option 1: Use Fallback Authentication**
If Supabase continues to have issues, the app includes fallback authentication:
1. The app will automatically use mock authentication
2. Users can sign in without Supabase configuration
3. Perfect for development and testing

### **Option 2: Reset Supabase Configuration**
1. Go to Supabase Dashboard → Settings → API
2. Regenerate your anon key
3. Update your `.env.local` file
4. Restart your development server

### **Option 3: Check Row Level Security (RLS)**
1. Go to Authentication → Policies
2. Make sure RLS is properly configured
3. Check if there are any restrictive policies

## Testing the Fix

### **Test 1: Basic Signin**
1. Go to signin form
2. Enter valid credentials
3. Should redirect to dashboard without errors

### **Test 2: Error Handling**
1. Try invalid credentials
2. Should show clear error message
3. Should not show 400 error in console

### **Test 3: Debug Mode**
1. Go to `/debug` page
2. Test signup and signin
3. Check console for detailed logs

## Still Having Issues?

If you're still getting 400 errors:

1. **Check the exact error message** in browser console
2. **Verify Supabase project is active** and accessible
3. **Try the fallback authentication** mode
4. **Contact support** with specific error details

## Fallback Mode

The app includes automatic fallback authentication that works without Supabase:
- No configuration required
- Perfect for development
- Full functionality without external dependencies

The signin should work smoothly after applying these fixes!
