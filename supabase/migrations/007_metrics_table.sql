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
