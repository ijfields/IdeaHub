# Supabase Setup Guide - AI Ideas Hub

This guide provides step-by-step instructions for setting up Supabase as the backend database and authentication provider for the AI Ideas Hub platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Creating a Supabase Project](#creating-a-supabase-project)
3. [Obtaining Credentials](#obtaining-credentials)
4. [Navigating the Supabase Dashboard](#navigating-the-supabase-dashboard)
5. [Running Database Migrations](#running-database-migrations)
6. [Verifying Your Setup](#verifying-your-setup)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Prerequisites

Before you begin, ensure you have:

- A GitHub, GitLab, or Bitbucket account (for Supabase authentication)
- Node.js v18+ installed on your machine
- Basic familiarity with SQL and PostgreSQL (helpful but not required)
- The Supabase CLI installed (optional but recommended)

### Installing Supabase CLI (Optional)

The Supabase CLI is useful for managing migrations and local development:

```bash
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

---

## Creating a Supabase Project

### Step 1: Sign Up for Supabase

1. Navigate to [https://supabase.com](https://supabase.com)
2. Click the "Start your project" button in the top right
3. Sign in using your GitHub, GitLab, or Bitbucket account
4. Grant Supabase the necessary permissions when prompted

### Step 2: Create a New Project

1. After signing in, you'll see your Supabase dashboard
2. Click the "New Project" button
3. Fill in the project details:
   - **Name**: `ai-ideas-hub` (or your preferred name)
   - **Database Password**: Create a strong password (save this securely!)
   - **Region**: Choose the region closest to your target audience
   - **Pricing Plan**: Select "Free" for development (sufficient for MVP)

4. Click "Create new project"
5. Wait 2-3 minutes for Supabase to provision your database

**Important**: Save your database password immediately! You'll need it if you want to connect directly to PostgreSQL.

---

## Obtaining Credentials

Once your project is created, you'll need three key pieces of information:

### 1. Project URL

1. In your Supabase dashboard, click on your project
2. Navigate to **Settings** (gear icon in the left sidebar)
3. Click on **API** in the settings menu
4. Find the **Project URL** under "Project Configuration"
   - Format: `https://xxxxxxxxxxxxx.supabase.co`
5. Copy this URL

### 2. API Keys

On the same **Settings > API** page, you'll find:

#### Anon (Public) Key
- Located under "Project API keys"
- Labeled as `anon` `public`
- This key is safe to use in your frontend code
- It respects Row Level Security (RLS) policies
- Copy the entire key (starts with `eyJ...`)

#### Service Role Key
- Located under "Project API keys"
- Labeled as `service_role` `secret`
- **WARNING**: This key bypasses RLS policies - keep it secret!
- Only use this key in your backend/server-side code
- Never expose this in your frontend or commit it to version control
- Copy the entire key (starts with `eyJ...`)

### 3. Setting Up Environment Variables

Create a `.env` file in your backend directory:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Create a `.env` file in your frontend directory:

```env
# Supabase Configuration (Frontend)
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Security Note**: Add `.env` to your `.gitignore` file to prevent committing credentials!

---

## Navigating the Supabase Dashboard

### Key Sections

#### 1. Table Editor
- **Location**: Left sidebar, table icon
- **Purpose**: View and manually edit database tables
- **Useful for**: Browsing data, making quick edits, verifying migrations
- **Tip**: After running migrations, verify your tables appear here

#### 2. SQL Editor
- **Location**: Left sidebar, code icon
- **Purpose**: Run custom SQL queries
- **Useful for**: Running migrations manually, testing queries, data analysis
- **Features**:
  - Multiple query tabs
  - Query history
  - Save favorite queries

#### 3. Authentication
- **Location**: Left sidebar, key icon
- **Purpose**: Manage users and authentication settings
- **Features**:
  - View all registered users
  - Configure email templates
  - Set up OAuth providers (Google, GitHub, etc.)
  - Configure redirect URLs

#### 4. Database
- **Location**: Left sidebar, database icon
- **Submenus**:
  - **Tables**: Same as Table Editor
  - **Triggers**: View database triggers
  - **Functions**: View database functions
  - **Extensions**: Enable PostgreSQL extensions
  - **Roles**: Manage database roles
  - **Replication**: Set up database replication
  - **Webhooks**: Configure database webhooks

#### 5. API Documentation
- **Location**: Left sidebar, book icon
- **Purpose**: Auto-generated API documentation for your database
- **Features**:
  - View all available endpoints
  - See example requests/responses
  - Copy code snippets for your chosen language
  - Extremely helpful for understanding how to query your data

#### 6. Logs
- **Location**: Left sidebar, file icon
- **Purpose**: View real-time logs for debugging
- **Useful for**: Troubleshooting RLS policies, API errors, function logs

---

## Running Database Migrations

### Option 1: Using the Provided Migration Script (Recommended)

We've created a convenient script to run all migrations in order:

```bash
# From the project root
cd /home/user/IdeaHub

# Make the script executable
chmod +x supabase/run-migrations.sh

# Run the migrations
./supabase/run-migrations.sh
```

The script will:
- Check if Supabase CLI is installed
- Prompt you to link to your Supabase project
- Run all migrations in numerical order
- Provide feedback on success/failure

### Option 2: Using Supabase CLI Manually

If you prefer to run migrations manually:

```bash
# Link to your Supabase project (one-time setup)
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push

# Or run a specific migration
supabase db execute -f supabase/migrations/001_initial_schema.sql
```

**Finding your project-ref**:
1. Go to your Supabase dashboard
2. Navigate to Settings > General
3. Find "Reference ID" under Project Settings

### Option 3: Using the SQL Editor (Manual)

For each migration file:

1. Open the Supabase dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click "+ New query"
4. Copy the contents of the migration file (e.g., `001_initial_schema.sql`)
5. Paste into the SQL Editor
6. Click "Run" or press Ctrl+Enter (Cmd+Enter on Mac)
7. Verify the query executed successfully (green checkmark)
8. Repeat for each migration in numerical order

**Important**: Run migrations in order (001, 002, 003, etc.) as later migrations depend on earlier ones.

---

## Verifying Your Setup

After running all migrations, verify everything is set up correctly:

### 1. Check Tables Were Created

1. Navigate to **Table Editor** in the Supabase dashboard
2. You should see the following tables:
   - `ideas`
   - `users`
   - `comments`
   - `project_links`
   - `page_views`
   - `metrics`
   - `news_banners`

### 2. Verify Row Level Security (RLS)

1. Go to **Authentication > Policies** in the dashboard
2. For each table, you should see policies listed
3. Example policies:
   - `ideas`: "Public read for free tier ideas"
   - `comments`: "Authenticated users can create comments"
   - `project_links`: "Users can create project links"

### 3. Test Database Functions

In the SQL Editor, run:

```sql
-- Test the increment_view_count function
SELECT increment_view_count('some-valid-idea-id');

-- Check if it worked
SELECT view_count FROM ideas WHERE id = 'some-valid-idea-id';
```

### 4. Check Indexes

In the SQL Editor, run:

```sql
-- View all indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### 5. Test Authentication

1. Navigate to **Authentication > Users**
2. Click "Add user" to create a test user
3. Use the Supabase client in your app to sign in
4. Verify the user appears in the `users` table

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: "extension uuid-ossp does not exist"

**Solution**: Run the first migration (001_initial_schema.sql) which enables the UUID extension:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

#### Issue: "relation 'auth.users' does not exist"

**Cause**: The `auth` schema is automatically created by Supabase, but you might be running migrations before the project is fully initialized.

**Solution**:
1. Wait a few minutes for project initialization to complete
2. Verify you can see the Authentication section in the dashboard
3. Re-run the migration

#### Issue: "permission denied for schema public"

**Cause**: Using the wrong API key or insufficient permissions.

**Solution**:
- Ensure you're using the `service_role` key for server-side operations
- Check that your database password is correct
- Verify you're the project owner

#### Issue: RLS policies blocking legitimate queries

**Symptoms**:
- Queries return empty results even though data exists
- Frontend can't fetch data that should be public

**Solution**:
1. Check the RLS policies in **Authentication > Policies**
2. Temporarily disable RLS for testing:
   ```sql
   ALTER TABLE ideas DISABLE ROW LEVEL SECURITY;
   ```
3. Re-enable after fixing the policy:
   ```sql
   ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
   ```
4. Review and update the policy in migration 009

#### Issue: "Failed to link to remote project"

**Solution**:
1. Ensure Supabase CLI is up to date: `npm update -g supabase`
2. Check your project reference ID is correct
3. Verify you're logged in: `supabase login`

#### Issue: Migrations run but tables don't appear

**Solution**:
1. Check the **Logs** section for errors
2. Refresh the Table Editor page
3. Run this query in SQL Editor to verify:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

#### Issue: "Cannot insert NULL into column"

**Cause**: Missing required fields or incorrect default values.

**Solution**:
1. Check the migration file for the table
2. Verify all `NOT NULL` columns have defaults or are provided
3. Review the error message for the specific column name

---

## Best Practices

### 1. Environment Variables

- Never commit `.env` files to version control
- Use different projects for development, staging, and production
- Rotate keys regularly, especially if exposed accidentally

### 2. Row Level Security (RLS)

- Always enable RLS on tables containing user data
- Test policies thoroughly before deploying to production
- Use the `anon` key in frontend; it respects RLS policies
- Use the `service_role` key only in backend; it bypasses RLS

### 3. Database Migrations

- Never edit migration files after they've been applied
- Create new migrations for schema changes
- Test migrations on a development project first
- Back up your database before running migrations in production

### 4. API Keys

- Use the `anon` key for client-side applications
- Keep the `service_role` key secret and server-side only
- Regenerate keys if they're ever exposed
- Use environment variables, never hardcode keys

### 5. Performance

- Create indexes for frequently queried columns
- Use `EXPLAIN ANALYZE` to optimize slow queries
- Enable real-time only for tables that need it
- Monitor database size in the dashboard

### 6. Monitoring

- Regularly check the Logs section for errors
- Monitor API usage in Settings > Usage
- Set up email alerts for critical events
- Review authentication logs for suspicious activity

### 7. Backups

- Supabase automatically backs up your database daily (Pro plan)
- For the free tier, periodically export your data:
  ```bash
  # Using Supabase CLI
  supabase db dump -f backup.sql
  ```

---

## Next Steps

After completing this setup:

1. Run the seed data migration to populate initial ideas
2. Configure your backend `.env` with the credentials
3. Configure your frontend `.env` with the credentials
4. Test the connection from your application
5. Start building your API routes
6. Implement authentication flows

---

## Additional Resources

- [Supabase Official Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Database Functions Guide](https://supabase.com/docs/guides/database/functions)

---

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review Supabase Logs in the dashboard
3. Search [Supabase Discussions](https://github.com/supabase/supabase/discussions)
4. Ask on the [Supabase Discord](https://discord.supabase.com)
5. Check project-specific documentation in `/docs`

---

**Document Version**: 1.0
**Last Updated**: November 6, 2025
**Maintained by**: AI Ideas Hub Development Team
