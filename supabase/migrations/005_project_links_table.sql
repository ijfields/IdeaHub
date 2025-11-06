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
