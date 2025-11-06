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
