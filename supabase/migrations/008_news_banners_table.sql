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
