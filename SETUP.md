# Smart Timetable Generator - Setup Guide

## Environment Configuration

To fix the "Signup failed" error, you need to configure your Supabase environment variables.

### Step 1: Create Environment File

Create a `.env.local` file in your project root with the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key

# JWT Secret for authentication
JWT_SECRET=your_jwt_secret_here

# Database URL (if using direct connection)
DATABASE_URL=your_database_url_here
```

### Step 2: Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a new project or use an existing one
3. Go to Settings > API
4. Copy your Project URL and anon/public key
5. Replace the placeholder values in `.env.local`

### Step 3: Set Up Database

1. Run the database schema from `database/schema.sql` in your Supabase SQL editor
2. This will create all necessary tables and relationships

### Step 4: Configure Authentication

1. In Supabase dashboard, go to Authentication > Settings
2. Enable email authentication
3. Configure your site URL (usually `http://localhost:3000` for development)
4. **Important**: Set "Confirm email" to **OFF** for development (or handle email confirmation)
5. Add your domain to "Site URL" and "Redirect URLs":
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

### Step 5: Test the Application

1. Restart your development server: `npm run dev`
2. Try creating an account - the signup should now work!

## Common Issues

### "Supabase configuration is missing"
- Make sure your `.env.local` file exists and has the correct values
- Restart your development server after adding environment variables

### "Signup failed: Invalid email"
- Check your Supabase authentication settings
- Ensure email authentication is enabled

### Database errors
- Make sure you've run the schema.sql file in your Supabase database
- Check that all tables are created properly

## Need Help?

If you're still experiencing issues:
1. Check the browser console for detailed error messages
2. Verify your Supabase project is active and accessible
3. Ensure your database schema is properly set up
