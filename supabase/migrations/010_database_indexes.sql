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
