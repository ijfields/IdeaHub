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
