# Fix Supabase 400 Bad Request Error

## The Problem
You're getting a 400 Bad Request error from Supabase during signup. This is usually caused by Supabase authentication settings.

## Quick Fix Steps

### 1. Check Supabase Authentication Settings

Go to your Supabase Dashboard → Authentication → Settings:

#### **Email Settings:**
- ✅ **Enable email confirmations**: Set to **OFF** for development
- ✅ **Enable email change confirmations**: Set to **OFF** for development
- ✅ **Enable phone confirmations**: Set to **OFF** for development

#### **URL Configuration:**
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: Add these URLs:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/**`

### 2. Check Password Requirements

Supabase has strict password requirements. Make sure passwords:
- ✅ Are at least 6 characters long
- ✅ Contain both letters and numbers
- ✅ Don't contain common passwords

### 3. Check Email Authentication

Go to Authentication → Providers → Email:
- ✅ **Enable email provider**: Should be **ON**
- ✅ **Enable email confirmations**: Should be **OFF** for development

### 4. Test with Simple Credentials

Try signing up with:
- **Email**: `test@example.com`
- **Password**: `password123`
- **Name**: `Test User`
- **Role**: `Student`

## Advanced Configuration

### If Still Getting 400 Error:

#### **Option A: Disable Email Confirmation (Recommended for Development)**

1. Go to Authentication → Settings
2. Find "Enable email confirmations"
3. Set to **OFF**
4. Save changes

#### **Option B: Configure Email Templates**

1. Go to Authentication → Email Templates
2. Update the "Confirm signup" template
3. Set redirect URL to: `{{ .SiteURL }}/auth/callback`

#### **Option C: Check Row Level Security (RLS)**

1. Go to Authentication → Policies
2. Make sure RLS is properly configured
3. Check if there are any restrictive policies

## Environment Variables Check

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: Replace the placeholder values with your actual Supabase credentials.

## Testing the Fix

1. **Clear browser cache** and localStorage
2. **Restart your development server**: `npm run dev`
3. **Try signing up** with a new email
4. **Check browser console** for detailed error messages

## Common Issues and Solutions

### Issue: "Invalid redirect URL"
**Solution**: Add `http://localhost:3000/auth/callback` to Redirect URLs in Supabase

### Issue: "Email confirmation required"
**Solution**: Disable email confirmations in Supabase settings

### Issue: "Password too weak"
**Solution**: Use a stronger password like `password123`

### Issue: "User already exists"
**Solution**: Try with a different email address

## Still Having Issues?

If you're still getting 400 errors:

1. **Check the browser console** for the exact error message
2. **Try the fallback authentication** (the app should work without Supabase)
3. **Contact support** with the specific error details

## Fallback Mode

The app includes a fallback authentication system that works without Supabase configuration. If you're having persistent issues, the app will automatically use mock authentication for development.
