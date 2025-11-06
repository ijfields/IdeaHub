-- Migration 013: Comment Count Functions
-- Description: Create helper functions for managing comment counts on ideas
-- Created: 2025-11-06

-- ============================================================================
-- COMMENT COUNT FUNCTIONS
-- ============================================================================

-- Function to increment comment count on an idea
-- Called when a new comment is created
CREATE OR REPLACE FUNCTION increment_comment_count(idea_id_param UUID)
RETURNS void AS $$
BEGIN
    UPDATE ideas
    SET comment_count = comment_count + 1
    WHERE id = idea_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_comment_count IS 'Increment the comment count for a specific idea by 1';

-- Function to decrement comment count on an idea
-- Called when comments are deleted
-- Supports decrementing by a specific count (for nested comment deletion)
CREATE OR REPLACE FUNCTION decrement_comment_count(
    idea_id_param UUID,
    count_param INTEGER DEFAULT 1
)
RETURNS void AS $$
BEGIN
    UPDATE ideas
    SET comment_count = GREATEST(0, comment_count - count_param)
    WHERE id = idea_id_param;

    -- Note: Using GREATEST to ensure comment_count never goes below 0
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION decrement_comment_count IS 'Decrement the comment count for a specific idea, ensuring it never goes below 0';

-- ============================================================================
-- OPTIONAL: Database Trigger for Automatic Comment Count Management
-- ============================================================================
-- Note: These triggers can be used instead of manually calling the functions
-- from the API. Uncomment if you prefer automatic counting.

/*
-- Trigger function to auto-increment comment count on insert
CREATE OR REPLACE FUNCTION auto_increment_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ideas
    SET comment_count = comment_count + 1
    WHERE id = NEW.idea_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-decrement comment count on delete
CREATE OR REPLACE FUNCTION auto_decrement_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ideas
    SET comment_count = GREATEST(0, comment_count - 1)
    WHERE id = OLD.idea_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER increment_comment_count_trigger
    AFTER INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION auto_increment_comment_count();

CREATE TRIGGER decrement_comment_count_trigger
    AFTER DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION auto_decrement_comment_count();
*/
