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
