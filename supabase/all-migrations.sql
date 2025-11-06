-- Migration 001: Initial Schema Setup
-- Description: Enable UUID extension and set up basic database configuration
-- Created: 2025-11-06

-- Enable UUID extension for generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing (if needed)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone to UTC for consistency
SET timezone = 'UTC';

-- Create a custom type for difficulty levels (used in ideas table)
DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('Beginner', 'Intermediate', 'Advanced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create a custom type for user tiers
DO $$ BEGIN
    CREATE TYPE user_tier AS ENUM ('free', 'premium');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add comment for documentation
COMMENT ON EXTENSION "uuid-ossp" IS 'Extension for generating UUIDs';
COMMENT ON TYPE difficulty_level IS 'Enum type for idea difficulty levels';
COMMENT ON TYPE user_tier IS 'Enum type for user subscription tiers';
-- Migration 002: Ideas Table
-- Description: Create the ideas table to store all 87 AI project ideas
-- Created: 2025-11-06

-- Create ideas table
CREATE TABLE IF NOT EXISTS ideas (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Core fields
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    difficulty difficulty_level NOT NULL DEFAULT 'Beginner',

    -- Arrays for tools and tags
    tools TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',

    -- Additional metadata
    monetization_potential TEXT,
    estimated_build_time VARCHAR(50),

    -- Access control
    free_tier BOOLEAN DEFAULT false,

    -- Engagement metrics (counters)
    view_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    project_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT ideas_title_not_empty CHECK (char_length(trim(title)) > 0),
    CONSTRAINT ideas_description_not_empty CHECK (char_length(trim(description)) > 0),
    CONSTRAINT ideas_view_count_positive CHECK (view_count >= 0),
    CONSTRAINT ideas_comment_count_positive CHECK (comment_count >= 0),
    CONSTRAINT ideas_project_count_positive CHECK (project_count >= 0)
);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ideas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ideas_updated_at_trigger
    BEFORE UPDATE ON ideas
    FOR EACH ROW
    EXECUTE FUNCTION update_ideas_updated_at();

-- Add table comments for documentation
COMMENT ON TABLE ideas IS 'Stores all 87 AI project ideas with metadata and engagement metrics';
COMMENT ON COLUMN ideas.id IS 'Unique identifier for the idea';
COMMENT ON COLUMN ideas.title IS 'Title of the AI project idea';
COMMENT ON COLUMN ideas.description IS 'Detailed description of the project idea';
COMMENT ON COLUMN ideas.category IS 'Category grouping (e.g., B2B SaaS Tools, Education, etc.)';
COMMENT ON COLUMN ideas.difficulty IS 'Difficulty level: Beginner, Intermediate, or Advanced';
COMMENT ON COLUMN ideas.tools IS 'Array of recommended AI tools (Claude, Bolt, Lovable, etc.)';
COMMENT ON COLUMN ideas.tags IS 'Array of tags for search and filtering';
COMMENT ON COLUMN ideas.monetization_potential IS 'Description of potential revenue streams';
COMMENT ON COLUMN ideas.estimated_build_time IS 'Estimated time to complete the project';
COMMENT ON COLUMN ideas.free_tier IS 'Whether this idea is accessible to non-authenticated users';
COMMENT ON COLUMN ideas.view_count IS 'Number of times this idea has been viewed';
COMMENT ON COLUMN ideas.comment_count IS 'Number of comments on this idea';
COMMENT ON COLUMN ideas.project_count IS 'Number of user projects built from this idea';
-- Migration 003: Users Table
-- Description: Create users table to extend Supabase auth.users with profile information
-- Created: 2025-11-06

-- Create users table that extends auth.users
CREATE TABLE IF NOT EXISTS users (
    -- Primary key that references Supabase auth.users
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Profile information
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,

    -- Subscription tier
    tier user_tier DEFAULT 'free',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT users_email_not_empty CHECK (char_length(trim(email)) > 0),
    CONSTRAINT users_email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_display_name_length CHECK (char_length(display_name) <= 100),
    CONSTRAINT users_bio_length CHECK (char_length(bio) <= 1000)
);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();

-- Create function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, tier)
    VALUES (NEW.id, NEW.email, 'free');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- Add table comments for documentation
COMMENT ON TABLE users IS 'User profiles extending Supabase auth.users with additional metadata';
COMMENT ON COLUMN users.id IS 'User ID from auth.users';
COMMENT ON COLUMN users.email IS 'User email address';
COMMENT ON COLUMN users.display_name IS 'Public display name for the user';
COMMENT ON COLUMN users.bio IS 'User biography or description';
COMMENT ON COLUMN users.tier IS 'Subscription tier: free or premium (for future use)';
COMMENT ON COLUMN users.created_at IS 'When the user profile was created';
COMMENT ON COLUMN users.updated_at IS 'When the user profile was last updated';
-- Migration 004: Comments Table
-- Description: Create comments table with support for nested/threaded comments
-- Created: 2025-11-06

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Foreign keys
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- For nested comments (NULL for top-level comments)
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,

    -- Content
    content TEXT NOT NULL,

    -- Moderation
    flagged_for_moderation BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT comments_content_not_empty CHECK (char_length(trim(content)) > 0),
    CONSTRAINT comments_content_max_length CHECK (char_length(content) <= 5000),
    -- Prevent self-referencing comments
    CONSTRAINT comments_no_self_reference CHECK (id != parent_comment_id)
);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comments_updated_at_trigger
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_comments_updated_at();

-- Create function to increment comment count on ideas table when comment is added
CREATE OR REPLACE FUNCTION increment_idea_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Only increment for top-level comments (not replies)
    IF NEW.parent_comment_id IS NULL THEN
        UPDATE ideas
        SET comment_count = comment_count + 1
        WHERE id = NEW.idea_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to increment comment count
CREATE TRIGGER comments_increment_count_trigger
    AFTER INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION increment_idea_comment_count();

-- Create function to decrement comment count on ideas table when comment is deleted
CREATE OR REPLACE FUNCTION decrement_idea_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Only decrement for top-level comments (not replies)
    IF OLD.parent_comment_id IS NULL THEN
        UPDATE ideas
        SET comment_count = GREATEST(comment_count - 1, 0)
        WHERE id = OLD.idea_id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to decrement comment count
CREATE TRIGGER comments_decrement_count_trigger
    AFTER DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION decrement_idea_comment_count();

-- Add table comments for documentation
COMMENT ON TABLE comments IS 'User comments on ideas with support for nested replies';
COMMENT ON COLUMN comments.id IS 'Unique identifier for the comment';
COMMENT ON COLUMN comments.idea_id IS 'Reference to the idea being commented on';
COMMENT ON COLUMN comments.user_id IS 'Reference to the user who created the comment';
COMMENT ON COLUMN comments.parent_comment_id IS 'Reference to parent comment for nested replies (NULL for top-level)';
COMMENT ON COLUMN comments.content IS 'The comment text content';
COMMENT ON COLUMN comments.flagged_for_moderation IS 'Whether this comment has been flagged for moderation';
COMMENT ON COLUMN comments.created_at IS 'When the comment was created';
COMMENT ON COLUMN comments.updated_at IS 'When the comment was last updated';
-- Migration 005: Project Links Table
-- Description: Create project_links table to track user implementations of ideas
-- Created: 2025-11-06

-- Create project_links table
CREATE TABLE IF NOT EXISTS project_links (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Foreign keys
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Project information
    title VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    description TEXT,

    -- Tools used for analytics
    tools_used TEXT[] DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT project_links_title_not_empty CHECK (char_length(trim(title)) > 0),
    CONSTRAINT project_links_url_not_empty CHECK (char_length(trim(url)) > 0),
    CONSTRAINT project_links_url_valid CHECK (url ~* '^https?://'),
    CONSTRAINT project_links_description_max_length CHECK (char_length(description) <= 500)
);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_project_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_links_updated_at_trigger
    BEFORE UPDATE ON project_links
    FOR EACH ROW
    EXECUTE FUNCTION update_project_links_updated_at();

-- Create function to increment project count on ideas table when project link is added
CREATE OR REPLACE FUNCTION increment_idea_project_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ideas
    SET project_count = project_count + 1
    WHERE id = NEW.idea_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to increment project count
CREATE TRIGGER project_links_increment_count_trigger
    AFTER INSERT ON project_links
    FOR EACH ROW
    EXECUTE FUNCTION increment_idea_project_count();

-- Create function to decrement project count on ideas table when project link is deleted
CREATE OR REPLACE FUNCTION decrement_idea_project_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ideas
    SET project_count = GREATEST(project_count - 1, 0)
    WHERE id = OLD.idea_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to decrement project count
CREATE TRIGGER project_links_decrement_count_trigger
    AFTER DELETE ON project_links
    FOR EACH ROW
    EXECUTE FUNCTION decrement_idea_project_count();

-- Create function to update metrics table when project is added
CREATE OR REPLACE FUNCTION update_project_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update daily project count metric
    INSERT INTO metrics (metric_key, metric_value, date)
    VALUES ('projects_total', 1, CURRENT_DATE)
    ON CONFLICT (metric_key, date)
    DO UPDATE SET
        metric_value = metrics.metric_value + 1,
        timestamp = NOW();

    -- Track tool usage metrics
    IF array_length(NEW.tools_used, 1) > 0 THEN
        -- For each tool used, increment its count
        DECLARE
            tool TEXT;
        BEGIN
            FOREACH tool IN ARRAY NEW.tools_used
            LOOP
                INSERT INTO metrics (metric_key, metric_value, date)
                VALUES ('tool_' || lower(tool), 1, CURRENT_DATE)
                ON CONFLICT (metric_key, date)
                DO UPDATE SET
                    metric_value = metrics.metric_value + 1,
                    timestamp = NOW();
            END LOOP;
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger will be created after the metrics table exists (in migration 007)
-- For now, we'll add a comment to remind us
COMMENT ON FUNCTION update_project_metrics() IS 'Updates metrics table when new project is created (trigger added in migration 007)';

-- Add table comments for documentation
COMMENT ON TABLE project_links IS 'User-submitted project implementations of ideas';
COMMENT ON COLUMN project_links.id IS 'Unique identifier for the project link';
COMMENT ON COLUMN project_links.idea_id IS 'Reference to the idea this project implements';
COMMENT ON COLUMN project_links.user_id IS 'Reference to the user who created the project';
COMMENT ON COLUMN project_links.title IS 'Title of the project';
COMMENT ON COLUMN project_links.url IS 'URL to the project (GitHub, live demo, etc.)';
COMMENT ON COLUMN project_links.description IS 'Brief description of the project implementation';
COMMENT ON COLUMN project_links.tools_used IS 'Array of AI tools used (Claude, Bolt, Lovable, etc.)';
COMMENT ON COLUMN project_links.created_at IS 'When the project was submitted';
COMMENT ON COLUMN project_links.updated_at IS 'When the project was last updated';
-- Migration 006: Page Views Table
-- Description: Create page_views table for analytics and tracking user behavior
-- Created: 2025-11-06

-- Create page_views table
CREATE TABLE IF NOT EXISTS page_views (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User tracking (nullable for anonymous visitors)
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Page information
    page VARCHAR(100) NOT NULL,

    -- Optional idea reference for idea detail pages
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,

    -- Timestamp
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT page_views_page_not_empty CHECK (char_length(trim(page)) > 0)
);

-- Add table comments for documentation
COMMENT ON TABLE page_views IS 'Tracks page views for analytics, supports both authenticated and anonymous users';
COMMENT ON COLUMN page_views.id IS 'Unique identifier for the page view';
COMMENT ON COLUMN page_views.user_id IS 'Reference to user (NULL for anonymous visitors)';
COMMENT ON COLUMN page_views.page IS 'Page identifier (e.g., home, idea-detail, dashboard)';
COMMENT ON COLUMN page_views.idea_id IS 'Reference to idea if viewing idea detail page';
COMMENT ON COLUMN page_views.timestamp IS 'When the page was viewed';
-- Migration 007: Metrics Table
-- Description: Create metrics table for tracking campaign success and analytics
-- Created: 2025-11-06

-- Create metrics table
CREATE TABLE IF NOT EXISTS metrics (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Metric information
    metric_key VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL DEFAULT 0,

    -- Date tracking for daily metrics
    date DATE DEFAULT CURRENT_DATE,

    -- Timestamp
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT metrics_key_not_empty CHECK (char_length(trim(metric_key)) > 0),
    -- Unique constraint to prevent duplicate metrics for the same day
    CONSTRAINT metrics_unique_key_date UNIQUE (metric_key, date)
);

-- Create trigger to add project link metrics (referenced in migration 005)
CREATE TRIGGER project_links_update_metrics_trigger
    AFTER INSERT ON project_links
    FOR EACH ROW
    EXECUTE FUNCTION update_project_metrics();

-- Add table comments for documentation
COMMENT ON TABLE metrics IS 'Stores campaign metrics and analytics data';
COMMENT ON COLUMN metrics.id IS 'Unique identifier for the metric entry';
COMMENT ON COLUMN metrics.metric_key IS 'Key identifying the metric (e.g., projects_total, tool_claude, registrations)';
COMMENT ON COLUMN metrics.metric_value IS 'Numeric value of the metric';
COMMENT ON COLUMN metrics.date IS 'Date for daily metric tracking';
COMMENT ON COLUMN metrics.timestamp IS 'When the metric was recorded';

-- Create some initial metric rows for tracking
INSERT INTO metrics (metric_key, metric_value, date) VALUES
    ('projects_total', 0, CURRENT_DATE),
    ('registrations_total', 0, CURRENT_DATE),
    ('comments_total', 0, CURRENT_DATE),
    ('tool_claude', 0, CURRENT_DATE),
    ('tool_bolt', 0, CURRENT_DATE),
    ('tool_lovable', 0, CURRENT_DATE)
ON CONFLICT (metric_key, date) DO NOTHING;
-- Migration 008: News Banners Table
-- Description: Create news_banners table for campaign announcements and updates
-- Created: 2025-11-06

-- Create news_banners table
CREATE TABLE IF NOT EXISTS news_banners (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Banner content
    title VARCHAR(255) NOT NULL,
    description TEXT,
    link VARCHAR(500),

    -- Status
    active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT news_banners_title_not_empty CHECK (char_length(trim(title)) > 0),
    CONSTRAINT news_banners_link_valid CHECK (link IS NULL OR link ~* '^https?://'),
    CONSTRAINT news_banners_expires_after_created CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Add table comments for documentation
COMMENT ON TABLE news_banners IS 'Admin-managed news banners for campaign announcements';
COMMENT ON COLUMN news_banners.id IS 'Unique identifier for the news banner';
COMMENT ON COLUMN news_banners.title IS 'Banner title/headline';
COMMENT ON COLUMN news_banners.description IS 'Banner description or message';
COMMENT ON COLUMN news_banners.link IS 'Optional link URL for more information';
COMMENT ON COLUMN news_banners.active IS 'Whether the banner is currently active';
COMMENT ON COLUMN news_banners.created_at IS 'When the banner was created';
COMMENT ON COLUMN news_banners.expires_at IS 'When the banner should stop showing (NULL for no expiration)';

-- Insert initial campaign banner
INSERT INTO news_banners (title, description, link, active, expires_at) VALUES (
    'Welcome to AI Ideas Hub!',
    'Explore 87 curated AI project ideas and start building with Claude Code. Free credits available until November 18, 2025!',
    'https://claude.ai/code',
    true,
    '2025-11-18 23:59:59+00'
);
-- Migration 009: Row Level Security (RLS) Policies
-- Description: Enable RLS and create policies for tiered access control
-- Created: 2025-11-06

-- ============================================================================
-- IDEAS TABLE POLICIES
-- ============================================================================

-- Enable RLS on ideas table
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read free tier ideas
CREATE POLICY "ideas_public_read_free_tier"
    ON ideas
    FOR SELECT
    USING (free_tier = true);

-- Policy: Authenticated users can read all ideas
CREATE POLICY "ideas_authenticated_read_all"
    ON ideas
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Only service role can insert/update/delete ideas (admin only)
CREATE POLICY "ideas_service_role_all"
    ON ideas
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read user profiles (for displaying usernames on comments, etc.)
CREATE POLICY "users_public_read"
    ON users
    FOR SELECT
    USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "users_update_own"
    ON users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile (handled by trigger, but allow explicit)
CREATE POLICY "users_insert_own"
    ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- COMMENTS TABLE POLICIES
-- ============================================================================

-- Enable RLS on comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read comments
CREATE POLICY "comments_public_read"
    ON comments
    FOR SELECT
    USING (true);

-- Policy: Authenticated users can create comments
CREATE POLICY "comments_authenticated_insert"
    ON comments
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own comments
CREATE POLICY "comments_update_own"
    ON comments
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own comments
CREATE POLICY "comments_delete_own"
    ON comments
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Service role can delete any comment (moderation)
CREATE POLICY "comments_service_role_delete"
    ON comments
    FOR DELETE
    TO service_role
    USING (true);

-- ============================================================================
-- PROJECT LINKS TABLE POLICIES
-- ============================================================================

-- Enable RLS on project_links table
ALTER TABLE project_links ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read project links
CREATE POLICY "project_links_public_read"
    ON project_links
    FOR SELECT
    USING (true);

-- Policy: Authenticated users can create project links
CREATE POLICY "project_links_authenticated_insert"
    ON project_links
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own project links
CREATE POLICY "project_links_update_own"
    ON project_links
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own project links
CREATE POLICY "project_links_delete_own"
    ON project_links
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================================================
-- PAGE VIEWS TABLE POLICIES
-- ============================================================================

-- Enable RLS on page_views table
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert page views (for tracking anonymous visitors)
CREATE POLICY "page_views_public_insert"
    ON page_views
    FOR INSERT
    WITH CHECK (true);

-- Policy: Users can only read their own page views
CREATE POLICY "page_views_read_own"
    ON page_views
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Service role can read all page views (for analytics)
CREATE POLICY "page_views_service_role_read"
    ON page_views
    FOR SELECT
    TO service_role
    USING (true);

-- ============================================================================
-- METRICS TABLE POLICIES
-- ============================================================================

-- Enable RLS on metrics table
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read metrics (for dashboard)
CREATE POLICY "metrics_authenticated_read"
    ON metrics
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Only service role can insert/update metrics
CREATE POLICY "metrics_service_role_all"
    ON metrics
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Allow functions to insert metrics (for auto-tracking)
CREATE POLICY "metrics_function_insert"
    ON metrics
    FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- NEWS BANNERS TABLE POLICIES
-- ============================================================================

-- Enable RLS on news_banners table
ALTER TABLE news_banners ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active, non-expired banners
CREATE POLICY "news_banners_public_read_active"
    ON news_banners
    FOR SELECT
    USING (
        active = true
        AND (expires_at IS NULL OR expires_at > NOW())
    );

-- Policy: Only service role can manage banners (admin only)
CREATE POLICY "news_banners_service_role_all"
    ON news_banners
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "ideas_public_read_free_tier" ON ideas IS 'Allow public access to free tier ideas';
COMMENT ON POLICY "ideas_authenticated_read_all" ON ideas IS 'Authenticated users can access all 87 ideas';
COMMENT ON POLICY "users_public_read" ON users IS 'Public can read user profiles for comment attribution';
COMMENT ON POLICY "users_update_own" ON users IS 'Users can only update their own profile';
COMMENT ON POLICY "comments_public_read" ON comments IS 'All comments are publicly readable';
COMMENT ON POLICY "comments_authenticated_insert" ON comments IS 'Only authenticated users can create comments';
COMMENT ON POLICY "project_links_public_read" ON project_links IS 'All project links are publicly readable';
COMMENT ON POLICY "project_links_authenticated_insert" ON project_links IS 'Only authenticated users can submit projects';
COMMENT ON POLICY "metrics_authenticated_read" ON metrics IS 'Authenticated users can view campaign metrics';
-- Migration 010: Database Indexes
-- Description: Create indexes for optimizing query performance
-- Created: 2025-11-06

-- ============================================================================
-- IDEAS TABLE INDEXES
-- ============================================================================

-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_ideas_category
    ON ideas(category);

-- Index for filtering by difficulty
CREATE INDEX IF NOT EXISTS idx_ideas_difficulty
    ON ideas(difficulty);

-- Index for filtering by free_tier (for access control)
CREATE INDEX IF NOT EXISTS idx_ideas_free_tier
    ON ideas(free_tier);

-- Index for sorting by creation date (newest first)
CREATE INDEX IF NOT EXISTS idx_ideas_created_at_desc
    ON ideas(created_at DESC);

-- Index for sorting by view count (most popular)
CREATE INDEX IF NOT EXISTS idx_ideas_view_count_desc
    ON ideas(view_count DESC);

-- Index for sorting by project count (most built)
CREATE INDEX IF NOT EXISTS idx_ideas_project_count_desc
    ON ideas(project_count DESC);

-- Composite index for category + difficulty filtering
CREATE INDEX IF NOT EXISTS idx_ideas_category_difficulty
    ON ideas(category, difficulty);

-- Full-text search index on title
CREATE INDEX IF NOT EXISTS idx_ideas_title_search
    ON ideas USING gin(to_tsvector('english', title));

-- Full-text search index on description
CREATE INDEX IF NOT EXISTS idx_ideas_description_search
    ON ideas USING gin(to_tsvector('english', description));

-- Composite full-text search index on title and description
CREATE INDEX IF NOT EXISTS idx_ideas_full_text_search
    ON ideas USING gin(
        to_tsvector('english', title || ' ' || coalesce(description, ''))
    );

-- GIN index for tools array (for filtering by tool)
CREATE INDEX IF NOT EXISTS idx_ideas_tools_gin
    ON ideas USING gin(tools);

-- GIN index for tags array (for filtering by tag)
CREATE INDEX IF NOT EXISTS idx_ideas_tags_gin
    ON ideas USING gin(tags);

-- ============================================================================
-- USERS TABLE INDEXES
-- ============================================================================

-- Index on email for lookup
CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);

-- Index on display_name for search
CREATE INDEX IF NOT EXISTS idx_users_display_name
    ON users(display_name);

-- Index on tier for filtering
CREATE INDEX IF NOT EXISTS idx_users_tier
    ON users(tier);

-- ============================================================================
-- COMMENTS TABLE INDEXES
-- ============================================================================

-- Index for fetching comments by idea
CREATE INDEX IF NOT EXISTS idx_comments_idea_id
    ON comments(idea_id);

-- Index for fetching comments by user
CREATE INDEX IF NOT EXISTS idx_comments_user_id
    ON comments(user_id);

-- Index for fetching replies to a comment
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id
    ON comments(parent_comment_id)
    WHERE parent_comment_id IS NOT NULL;

-- Composite index for fetching comments by idea, sorted by date
CREATE INDEX IF NOT EXISTS idx_comments_idea_created_desc
    ON comments(idea_id, created_at DESC);

-- Index for finding top-level comments (where parent_comment_id IS NULL)
CREATE INDEX IF NOT EXISTS idx_comments_top_level
    ON comments(idea_id, created_at DESC)
    WHERE parent_comment_id IS NULL;

-- Index for moderation queue
CREATE INDEX IF NOT EXISTS idx_comments_flagged
    ON comments(flagged_for_moderation)
    WHERE flagged_for_moderation = true;

-- ============================================================================
-- PROJECT LINKS TABLE INDEXES
-- ============================================================================

-- Index for fetching projects by idea
CREATE INDEX IF NOT EXISTS idx_project_links_idea_id
    ON project_links(idea_id);

-- Index for fetching projects by user
CREATE INDEX IF NOT EXISTS idx_project_links_user_id
    ON project_links(user_id);

-- Composite index for fetching projects by idea, sorted by date
CREATE INDEX IF NOT EXISTS idx_project_links_idea_created_desc
    ON project_links(idea_id, created_at DESC);

-- Index for sorting projects by creation date
CREATE INDEX IF NOT EXISTS idx_project_links_created_at_desc
    ON project_links(created_at DESC);

-- GIN index for tools_used array (for analytics)
CREATE INDEX IF NOT EXISTS idx_project_links_tools_used_gin
    ON project_links USING gin(tools_used);

-- ============================================================================
-- PAGE VIEWS TABLE INDEXES
-- ============================================================================

-- Index for fetching page views by user
CREATE INDEX IF NOT EXISTS idx_page_views_user_id
    ON page_views(user_id)
    WHERE user_id IS NOT NULL;

-- Index for fetching page views by idea
CREATE INDEX IF NOT EXISTS idx_page_views_idea_id
    ON page_views(idea_id)
    WHERE idea_id IS NOT NULL;

-- Index for fetching page views by page type
CREATE INDEX IF NOT EXISTS idx_page_views_page
    ON page_views(page);

-- Index for time-based queries (analytics)
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp_desc
    ON page_views(timestamp DESC);

-- Composite index for idea analytics
CREATE INDEX IF NOT EXISTS idx_page_views_idea_timestamp
    ON page_views(idea_id, timestamp DESC)
    WHERE idea_id IS NOT NULL;

-- ============================================================================
-- METRICS TABLE INDEXES
-- ============================================================================

-- Index for fetching metrics by key
CREATE INDEX IF NOT EXISTS idx_metrics_metric_key
    ON metrics(metric_key);

-- Index for fetching metrics by date
CREATE INDEX IF NOT EXISTS idx_metrics_date_desc
    ON metrics(date DESC);

-- Composite index for fetching specific metric over time
CREATE INDEX IF NOT EXISTS idx_metrics_key_date
    ON metrics(metric_key, date DESC);

-- ============================================================================
-- NEWS BANNERS TABLE INDEXES
-- ============================================================================

-- Index for fetching active banners
CREATE INDEX IF NOT EXISTS idx_news_banners_active
    ON news_banners(active)
    WHERE active = true;

-- Index for checking expiration
CREATE INDEX IF NOT EXISTS idx_news_banners_expires_at
    ON news_banners(expires_at)
    WHERE expires_at IS NOT NULL;

-- Composite index for active, non-expired banners
CREATE INDEX IF NOT EXISTS idx_news_banners_active_valid
    ON news_banners(active, expires_at)
    WHERE active = true;

-- ============================================================================
-- ANALYZE TABLES
-- ============================================================================

-- Update table statistics for query planner
ANALYZE ideas;
ANALYZE users;
ANALYZE comments;
ANALYZE project_links;
ANALYZE page_views;
ANALYZE metrics;
ANALYZE news_banners;
-- Migration 011: Helper Functions
-- Description: Create utility functions for common database operations
-- Created: 2025-11-06

-- ============================================================================
-- VIEW COUNT FUNCTIONS
-- ============================================================================

-- Function to increment view count on an idea
CREATE OR REPLACE FUNCTION increment_view_count(idea_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE ideas
    SET view_count = view_count + 1
    WHERE id = idea_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_view_count IS 'Increment the view count for a specific idea';

-- Function to record a page view
CREATE OR REPLACE FUNCTION record_page_view(
    p_user_id UUID,
    p_page VARCHAR(100),
    p_idea_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    view_id UUID;
BEGIN
    INSERT INTO page_views (user_id, page, idea_id)
    VALUES (p_user_id, p_page, p_idea_id)
    RETURNING id INTO view_id;

    -- If viewing an idea, increment its view count
    IF p_idea_id IS NOT NULL THEN
        PERFORM increment_view_count(p_idea_id);
    END IF;

    RETURN view_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION record_page_view IS 'Record a page view and optionally increment idea view count';

-- ============================================================================
-- SEARCH FUNCTIONS
-- ============================================================================

-- Function for full-text search across ideas
CREATE OR REPLACE FUNCTION search_ideas(search_query TEXT)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    difficulty difficulty_level,
    tools TEXT[],
    tags TEXT[],
    free_tier BOOLEAN,
    view_count INTEGER,
    comment_count INTEGER,
    project_count INTEGER,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.title,
        i.description,
        i.category,
        i.difficulty,
        i.tools,
        i.tags,
        i.free_tier,
        i.view_count,
        i.comment_count,
        i.project_count,
        ts_rank(
            to_tsvector('english', i.title || ' ' || i.description),
            plainto_tsquery('english', search_query)
        ) AS rank
    FROM ideas i
    WHERE to_tsvector('english', i.title || ' ' || i.description)
        @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC, i.view_count DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_ideas IS 'Full-text search across idea titles and descriptions with relevance ranking';

-- ============================================================================
-- ANALYTICS FUNCTIONS
-- ============================================================================

-- Function to get campaign progress metrics
CREATE OR REPLACE FUNCTION get_campaign_metrics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_projects', COALESCE(SUM(project_count), 0),
        'total_ideas', COUNT(*),
        'total_comments', COALESCE(SUM(comment_count), 0),
        'total_views', COALESCE(SUM(view_count), 0),
        'goal_progress', ROUND((COALESCE(SUM(project_count), 0)::NUMERIC / 4000::NUMERIC) * 100, 2)
    )
    INTO result
    FROM ideas;

    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_campaign_metrics IS 'Get overall campaign metrics including progress toward 4000 projects goal';

-- Function to get tool usage statistics
CREATE OR REPLACE FUNCTION get_tool_usage_stats()
RETURNS TABLE (
    tool_name TEXT,
    usage_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        unnest(tools_used) AS tool_name,
        COUNT(*) AS usage_count
    FROM project_links
    GROUP BY unnest(tools_used)
    ORDER BY usage_count DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_tool_usage_stats IS 'Get statistics on which AI tools are being used most frequently';

-- Function to get trending ideas (most active in last 7 days)
CREATE OR REPLACE FUNCTION get_trending_ideas(days_back INTEGER DEFAULT 7)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    category VARCHAR(100),
    recent_views BIGINT,
    recent_comments BIGINT,
    recent_projects BIGINT,
    trend_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH recent_activity AS (
        SELECT
            i.id,
            i.title,
            i.category,
            COUNT(DISTINCT pv.id) AS recent_views,
            COUNT(DISTINCT c.id) AS recent_comments,
            COUNT(DISTINCT pl.id) AS recent_projects
        FROM ideas i
        LEFT JOIN page_views pv ON pv.idea_id = i.id
            AND pv.timestamp >= NOW() - (days_back || ' days')::INTERVAL
        LEFT JOIN comments c ON c.idea_id = i.id
            AND c.created_at >= NOW() - (days_back || ' days')::INTERVAL
        LEFT JOIN project_links pl ON pl.idea_id = i.id
            AND pl.created_at >= NOW() - (days_back || ' days')::INTERVAL
        GROUP BY i.id, i.title, i.category
    )
    SELECT
        ra.id,
        ra.title,
        ra.category,
        ra.recent_views,
        ra.recent_comments,
        ra.recent_projects,
        -- Trend score: weighted combination of recent activity
        (ra.recent_views * 1 + ra.recent_comments * 5 + ra.recent_projects * 10)::NUMERIC AS trend_score
    FROM recent_activity ra
    WHERE (ra.recent_views + ra.recent_comments + ra.recent_projects) > 0
    ORDER BY trend_score DESC, ra.recent_views DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_trending_ideas IS 'Get top trending ideas based on recent activity';

-- ============================================================================
-- COMMENT THREAD FUNCTIONS
-- ============================================================================

-- Function to get comment thread with nested replies
CREATE OR REPLACE FUNCTION get_comment_thread(p_idea_id UUID)
RETURNS TABLE (
    id UUID,
    idea_id UUID,
    user_id UUID,
    parent_comment_id UUID,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    user_display_name VARCHAR(100),
    reply_count BIGINT,
    depth INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE comment_tree AS (
        -- Base case: top-level comments
        SELECT
            c.id,
            c.idea_id,
            c.user_id,
            c.parent_comment_id,
            c.content,
            c.created_at,
            c.updated_at,
            u.display_name AS user_display_name,
            0 AS depth
        FROM comments c
        JOIN users u ON u.id = c.user_id
        WHERE c.idea_id = p_idea_id
            AND c.parent_comment_id IS NULL
            AND c.flagged_for_moderation = false

        UNION ALL

        -- Recursive case: replies to comments
        SELECT
            c.id,
            c.idea_id,
            c.user_id,
            c.parent_comment_id,
            c.content,
            c.created_at,
            c.updated_at,
            u.display_name AS user_display_name,
            ct.depth + 1
        FROM comments c
        JOIN users u ON u.id = c.user_id
        JOIN comment_tree ct ON c.parent_comment_id = ct.id
        WHERE c.flagged_for_moderation = false
    ),
    reply_counts AS (
        SELECT
            parent_comment_id,
            COUNT(*) AS count
        FROM comments
        WHERE idea_id = p_idea_id
            AND parent_comment_id IS NOT NULL
        GROUP BY parent_comment_id
    )
    SELECT
        ct.id,
        ct.idea_id,
        ct.user_id,
        ct.parent_comment_id,
        ct.content,
        ct.created_at,
        ct.updated_at,
        ct.user_display_name,
        COALESCE(rc.count, 0) AS reply_count,
        ct.depth
    FROM comment_tree ct
    LEFT JOIN reply_counts rc ON rc.parent_comment_id = ct.id
    ORDER BY ct.depth, ct.created_at ASC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_comment_thread IS 'Get all comments for an idea organized as a threaded tree structure';

-- ============================================================================
-- USER STATS FUNCTIONS
-- ============================================================================

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_comments', (
            SELECT COUNT(*) FROM comments WHERE user_id = p_user_id
        ),
        'total_projects', (
            SELECT COUNT(*) FROM project_links WHERE user_id = p_user_id
        ),
        'member_since', (
            SELECT created_at FROM users WHERE id = p_user_id
        ),
        'favorite_tools', (
            SELECT json_agg(tool_name)
            FROM (
                SELECT unnest(tools_used) AS tool_name, COUNT(*) AS count
                FROM project_links
                WHERE user_id = p_user_id
                GROUP BY unnest(tools_used)
                ORDER BY count DESC
                LIMIT 3
            ) AS top_tools
        )
    )
    INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_user_stats IS 'Get comprehensive statistics for a user';

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to clean up old page views (optional maintenance function)
CREATE OR REPLACE FUNCTION cleanup_old_page_views(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM page_views
    WHERE timestamp < NOW() - (days_to_keep || ' days')::INTERVAL;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_page_views IS 'Delete page views older than specified days (default 90)';

-- Function to get popular ideas by category
CREATE OR REPLACE FUNCTION get_popular_ideas_by_category(p_category VARCHAR(100), p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    difficulty difficulty_level,
    view_count INTEGER,
    project_count INTEGER,
    comment_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.title,
        i.description,
        i.difficulty,
        i.view_count,
        i.project_count,
        i.comment_count
    FROM ideas i
    WHERE i.category = p_category
    ORDER BY i.view_count DESC, i.project_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_popular_ideas_by_category IS 'Get most popular ideas in a specific category';
-- Migration 012: Seed Data
-- Description: Insert sample ideas including the 5 free tier ideas and BuyButton
-- Created: 2025-11-06
-- Note: This is optional seed data for development/testing

-- ============================================================================
-- FREE TIER IDEAS (Accessible to non-authenticated users)
-- ============================================================================

-- Idea 1: Africana History Quiz & Trivia Platform
INSERT INTO ideas (
    title,
    description,
    category,
    difficulty,
    tools,
    tags,
    monetization_potential,
    estimated_build_time,
    free_tier
) VALUES (
    'Africana History Quiz & Trivia Platform',
    'Create an interactive quiz platform that tests knowledge of African and African diaspora history, culture, and achievements. Features include multiple difficulty levels, timed challenges, leaderboards, and educational content explaining correct answers. Perfect for educators, students, and anyone interested in learning more about Africana history in an engaging way.',
    'Education & Learning',
    'Beginner',
    ARRAY['Claude', 'Bolt', 'Lovable'],
    ARRAY['education', 'quiz', 'history', 'culture', 'interactive'],
    'Freemium model with basic quizzes free and premium content subscription. Potential for educational institution licensing. Advertising revenue from educational partners.',
    '2-3 weeks',
    true
);

-- Idea 2: Personal Finance Dashboard
INSERT INTO ideas (
    title,
    description,
    category,
    difficulty,
    tools,
    tags,
    monetization_potential,
    estimated_build_time,
    free_tier
) VALUES (
    'Personal Finance Dashboard',
    'Build a comprehensive personal finance dashboard that helps users track expenses, set budgets, visualize spending patterns, and achieve financial goals. Integrates with bank APIs or allows manual entry. Features include expense categorization, monthly/yearly reports, savings goals tracking, and financial insights powered by AI to identify spending trends and suggest improvements.',
    'Personal Productivity & Finance',
    'Intermediate',
    ARRAY['Claude', 'Lovable', 'Google AI Studio'],
    ARRAY['finance', 'budgeting', 'productivity', 'analytics', 'dashboard'],
    'Freemium model with basic features free and premium analytics/insights. Affiliate partnerships with financial services. White-label licensing for financial advisors.',
    '3-4 weeks',
    true
);

-- Idea 3: Habit Tracker with Analytics
INSERT INTO ideas (
    title,
    description,
    category,
    difficulty,
    tools,
    tags,
    monetization_potential,
    estimated_build_time,
    free_tier
) VALUES (
    'Habit Tracker with Analytics',
    'Design a habit tracking application that helps users build and maintain positive habits through daily check-ins, streak tracking, and visual analytics. Features include customizable habit templates, reminder notifications, progress visualization, and AI-powered insights on habit patterns and success factors. Includes social accountability features where users can share progress with friends.',
    'Health & Wellness',
    'Beginner',
    ARRAY['Claude', 'Bolt'],
    ARRAY['habits', 'productivity', 'wellness', 'tracking', 'analytics'],
    'Freemium with basic tracking free and premium analytics/social features. In-app purchases for habit template packs. Corporate wellness program licensing.',
    '2-3 weeks',
    true
);

-- Idea 4: Social Media Content Repurposer
INSERT INTO ideas (
    title,
    description,
    category,
    difficulty,
    tools,
    tags,
    monotization_potential,
    estimated_build_time,
    free_tier
) VALUES (
    'Social Media Content Repurposer',
    'Create a tool that takes long-form content (blog posts, articles, videos) and automatically repurposes it into multiple social media formats. Uses AI to generate platform-specific versions: Twitter threads, LinkedIn posts, Instagram captions, TikTok scripts, etc. Includes hashtag suggestions, optimal posting time recommendations, and content calendar integration.',
    'Marketing & Content Creation',
    'Intermediate',
    ARRAY['Claude', 'Google AI Studio'],
    ARRAY['content-creation', 'social-media', 'marketing', 'automation', 'AI'],
    'Subscription-based pricing tiers by content volume. Agency white-label licensing. Integration marketplace fees. Credits-based pay-per-use option.',
    '3-4 weeks',
    true
);

-- Idea 5: Africana Community Event Planner
INSERT INTO ideas (
    title,
    description,
    category,
    difficulty,
    tools,
    tags,
    monetization_potential,
    estimated_build_time,
    free_tier
) VALUES (
    'Africana Community Event Planner',
    'Develop a community event planning platform specifically designed for African and African diaspora cultural events, festivals, workshops, and gatherings. Features include event discovery, RSVP management, vendor coordination, cultural resource library, and community forum. Helps organizers manage logistics while helping community members discover relevant events.',
    'Community & Cultural Groups',
    'Intermediate',
    ARRAY['Claude', 'Bolt', 'Lovable'],
    ARRAY['community', 'events', 'culture', 'planning', 'networking'],
    'Freemium with basic event listing free and premium features for organizers. Ticketing transaction fees. Vendor directory listing fees. Sponsored event promotions.',
    '4-5 weeks',
    true
);

-- ============================================================================
-- BUYBUTTON IDEA (Special conversion hook - not free tier)
-- ============================================================================

-- BuyButton: Premium conversion example
INSERT INTO ideas (
    title,
    description,
    category,
    difficulty,
    tools,
    tags,
    monetization_potential,
    estimated_build_time,
    free_tier
) VALUES (
    'BuyButton: One-Click Commerce Widget',
    'A lightweight, embeddable "Buy Now" button that can be added to any website, blog, or social media profile. Handles the entire transaction flow including payments, inventory, shipping, and customer management. Perfect for creators, bloggers, and small businesses who want to sell products without building a full e-commerce site. Think "Stripe for selling physical products" - a single line of code that turns any webpage into a storefront.',
    'B2B SaaS Tools',
    'Advanced',
    ARRAY['Claude', 'Bolt'],
    ARRAY['e-commerce', 'saas', 'payments', 'monetization', 'entrepreneurship'],
    'Transaction fee model (2-3% per sale). Premium tiers with advanced features like analytics, custom branding, and multi-product support. White-label licensing for agencies. Estimated $50k-200k ARR potential within first year with proper marketing.',
    '6-8 weeks',
    false
);

-- ============================================================================
-- ADDITIONAL SAMPLE IDEAS (Non-free tier)
-- ============================================================================

-- Sample idea from B2B SaaS Tools category
INSERT INTO ideas (
    title,
    description,
    category,
    difficulty,
    tools,
    tags,
    monetization_potential,
    estimated_build_time,
    free_tier
) VALUES (
    'Meeting Notes AI Assistant',
    'An AI-powered meeting assistant that joins your video calls, transcribes conversations in real-time, identifies action items, and generates comprehensive meeting summaries. Automatically distributes notes to attendees and integrates with project management tools to create tasks from action items. Supports multiple languages and can identify different speakers.',
    'B2B SaaS Tools',
    'Advanced',
    ARRAY['Claude', 'Google AI Studio'],
    ARRAY['AI', 'productivity', 'meetings', 'transcription', 'automation'],
    'Subscription-based SaaS pricing ($10-50/user/month). Enterprise licensing for large organizations. API access for integration partners.',
    '5-6 weeks',
    false
);

-- Sample idea from Education & Learning category
INSERT INTO ideas (
    title,
    description,
    category,
    difficulty,
    tools,
    tags,
    monetization_potential,
    estimated_build_time,
    free_tier
) VALUES (
    'Code Learning Playground',
    'An interactive coding environment where beginners can learn programming through hands-on challenges and instant feedback. Features AI-powered hints, step-by-step tutorials, and a community forum for peer learning. Supports multiple programming languages and includes gamification elements like badges and leaderboards.',
    'Education & Learning',
    'Intermediate',
    ARRAY['Claude', 'Bolt'],
    ARRAY['education', 'coding', 'programming', 'learning', 'interactive'],
    'Freemium model with basic lessons free. Premium courses and certifications. Corporate training licenses. Bootcamp partnerships.',
    '4-5 weeks',
    false
);

-- Sample idea from Games and Puzzles category
INSERT INTO ideas (
    title,
    description,
    category,
    difficulty,
    tools,
    tags,
    monetization_potential,
    estimated_build_time,
    free_tier
) VALUES (
    'Daily Word Puzzle Generator',
    'A daily word puzzle game platform that generates unique crosswords, word searches, and anagrams using AI. Players can compete on leaderboards, create custom puzzles, and challenge friends. Includes difficulty levels from beginner to expert and themed puzzle collections.',
    'Games and Puzzles',
    'Beginner',
    ARRAY['Claude', 'Lovable'],
    ARRAY['games', 'puzzles', 'word-games', 'entertainment', 'AI'],
    'Ad-supported free version with premium ad-free subscription. In-app purchases for puzzle packs. Licensing to educational institutions and newspapers.',
    '2-3 weeks',
    false
);

-- Sample idea from Think Tank & Research category
INSERT INTO ideas (
    title,
    description,
    category,
    difficulty,
    tools,
    tags,
    monetization_potential,
    estimated_build_time,
    free_tier
) VALUES (
    'Research Paper Summarizer',
    'An AI tool that reads academic research papers and generates concise, accessible summaries highlighting key findings, methodologies, and implications. Helps researchers stay current with their field and makes academic research more accessible to the general public. Includes citation management and comparison features.',
    'Think Tank & Research',
    'Intermediate',
    ARRAY['Claude', 'Google AI Studio'],
    ARRAY['research', 'AI', 'summarization', 'academic', 'knowledge'],
    'Subscription model for academics and institutions. API access for research platforms. Premium features for citation tracking and collaboration.',
    '3-4 weeks',
    false
);

-- ============================================================================
-- SEED DATA SUMMARY
-- ============================================================================

-- Log seed data completion
DO $$
DECLARE
    idea_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO idea_count FROM ideas;
    RAISE NOTICE 'Seed data completed. Total ideas in database: %', idea_count;
END $$;
