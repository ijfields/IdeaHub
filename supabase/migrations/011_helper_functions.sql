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
