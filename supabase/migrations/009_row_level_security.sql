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
