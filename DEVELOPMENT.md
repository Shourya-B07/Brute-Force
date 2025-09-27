# Development Setup - Quick Start

## Option 1: Quick Development (No Supabase Required)

For immediate development and testing, the app now includes a fallback authentication system that works without Supabase configuration.

### Steps:
1. **Start the development server**: `npm run dev`
2. **Create an account**: The app will use mock authentication
3. **Test the application**: All features work with mock data

### How it works:
- When Supabase is not configured, the app automatically uses mock authentication
- Users can sign up and sign in normally
- All data is stored in localStorage
- Perfect for development and testing

## Option 2: Full Supabase Setup

For production-like environment with real database:

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for project to be ready

### 2. Configure Environment
Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
JWT_SECRET=your_jwt_secret_here
```

### 3. Set Up Database
1. Go to Supabase Dashboard > SQL Editor
2. Copy and paste the contents of `database/schema.sql`
3. Run the SQL to create all tables

### 4. Configure Authentication
1. Go to Authentication > Settings
2. Set "Confirm email" to **OFF** for development
3. Add redirect URLs:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

## Troubleshooting

### "Signup failed" Error
- **If using Option 1**: The fallback should work automatically
- **If using Option 2**: Check your Supabase configuration and settings

### Database Errors
- Make sure you've run the schema.sql file
- Check that all tables are created properly

### Authentication Issues
- Verify your Supabase project is active
- Check that authentication is enabled
- Ensure redirect URLs are configured correctly

## Development vs Production

### Development (Option 1)
- ✅ No setup required
- ✅ Works immediately
- ✅ Perfect for testing
- ❌ Data not persistent
- ❌ No real database

### Production (Option 2)
- ✅ Real database
- ✅ Persistent data
- ✅ Production-ready
- ❌ Requires setup
- ❌ More complex

## Recommendation

**Start with Option 1** for immediate development, then move to Option 2 when you're ready for production features.
