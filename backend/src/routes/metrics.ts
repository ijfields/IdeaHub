import express, { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import supabase from '../config/supabase.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { asyncHandler, badRequest, internalError } from '../utils/errors.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Rate limiter for page-view tracking: 100 requests per hour
const pageViewLimiter = createRateLimiter(100, 60 * 60 * 1000);

/**
 * Handler for page view tracking (shared between /page-view and /pageview routes)
 */
const pageViewHandler = asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw badRequest('Validation failed: ' + errors.array().map(e => e.msg).join(', '));
  }

  const { page, idea_id } = req.body;
  const user_id = req.userId || null; // null for guests

  // Insert page view record
  const { error } = await supabase.from('page_views').insert({
    user_id,
    page,
    idea_id: idea_id || null,
    timestamp: new Date().toISOString(),
  });

  if (error) {
    console.error('Error inserting page view:', error);
    throw internalError('Failed to record page view');
  }

  res.status(201).json({
    success: true,
    message: 'Page view recorded',
  });
});

/**
 * POST /api/metrics/page-view
 * Track page views (including guest users)
 * Uses optionalAuth to track authenticated users while allowing guests
 */
router.post(
  '/page-view',
  pageViewLimiter,
  optionalAuth,
  [
    body('page').isString().notEmpty().withMessage('Page is required'),
    body('idea_id').optional().isUUID().withMessage('Invalid idea_id format'),
  ],
  pageViewHandler
);

/**
 * POST /api/metrics/pageview (alias for /page-view)
 * Track page views (including guest users)
 * Frontend compatibility route
 */
router.post(
  '/pageview',
  pageViewLimiter,
  optionalAuth,
  [
    body('page').isString().notEmpty().withMessage('Page is required'),
    body('idea_id').optional().isUUID().withMessage('Invalid idea_id format'),
  ],
  pageViewHandler
);

/**
 * GET /api/metrics/dashboard
 * Get comprehensive admin dashboard metrics
 * Requires authentication (admin check can be added later)
 */
router.get(
  '/dashboard',
  authenticate,
  asyncHandler(async (_req: Request, res: Response) => {
    try {
      // Execute all queries in parallel for better performance
      const [
        usersResult,
        projectsResult,
        commentsResult,
        pageViewsResult,
        uniqueVisitorsResult,
        recentRegistrationsResult,
        mostViewedIdeasResult,
        mostCommentedIdeasResult,
        mostBuiltIdeasResult,
      ] = await Promise.all([
        // Total registrations
        supabase.from('users').select('id', { count: 'exact', head: true }),

        // Total projects
        supabase.from('project_links').select('id', { count: 'exact', head: true }),

        // Total comments
        supabase.from('comments').select('id', { count: 'exact', head: true }),

        // Total page views
        supabase.from('page_views').select('id', { count: 'exact', head: true }),

        // Unique visitors (authenticated users)
        supabase.from('page_views').select('user_id', { count: 'exact', head: false }),

        // Recent registrations (last 7 days)
        supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),

        // Most viewed ideas (top 10)
        supabase
          .from('ideas')
          .select('id, title, view_count')
          .order('view_count', { ascending: false })
          .limit(10),

        // Most commented ideas (top 10)
        supabase
          .from('ideas')
          .select('id, title, comment_count')
          .order('comment_count', { ascending: false })
          .limit(10),

        // Most built ideas (top 10)
        supabase
          .from('ideas')
          .select('id, title, project_count')
          .order('project_count', { ascending: false })
          .limit(10),
      ]);

      // Check for errors
      if (usersResult.error) throw usersResult.error;
      if (projectsResult.error) throw projectsResult.error;
      if (commentsResult.error) throw commentsResult.error;
      if (pageViewsResult.error) throw pageViewsResult.error;
      if (uniqueVisitorsResult.error) throw uniqueVisitorsResult.error;
      if (recentRegistrationsResult.error) throw recentRegistrationsResult.error;
      if (mostViewedIdeasResult.error) throw mostViewedIdeasResult.error;
      if (mostCommentedIdeasResult.error) throw mostCommentedIdeasResult.error;
      if (mostBuiltIdeasResult.error) throw mostBuiltIdeasResult.error;

      // Calculate unique visitors (including estimate for guests)
      const uniqueAuthUsers = new Set(
        uniqueVisitorsResult.data?.filter(v => v.user_id).map(v => v.user_id)
      ).size;
      const totalPageViews = pageViewsResult.count || 0;
      const authPageViews = uniqueVisitorsResult.data?.filter(v => v.user_id).length || 0;
      const guestPageViews = totalPageViews - authPageViews;
      // Estimate ~30% unique guest sessions based on typical guest browsing patterns
      const estimatedUniqueGuests = Math.round(guestPageViews * 0.3);
      const uniqueVisitors = uniqueAuthUsers + estimatedUniqueGuests;

      // Calculate projects goal progress
      const totalProjects = projectsResult.count || 0;
      const projectsGoal = 4000;
      const projectsPercentage = Math.round((totalProjects / projectsGoal) * 100 * 100) / 100;

      res.json({
        total_registrations: usersResult.count || 0,
        total_projects: totalProjects,
        total_comments: commentsResult.count || 0,
        total_page_views: totalPageViews,
        unique_visitors: uniqueVisitors,
        projects_goal_progress: {
          current: totalProjects,
          goal: projectsGoal,
          percentage: projectsPercentage,
        },
        recent_registrations: recentRegistrationsResult.count || 0,
        most_viewed_ideas: mostViewedIdeasResult.data || [],
        most_commented_ideas: mostCommentedIdeasResult.data || [],
        most_built_ideas: mostBuiltIdeasResult.data || [],
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw internalError('Failed to fetch dashboard metrics');
    }
  })
);

/**
 * GET /api/metrics/projects-goal
 * Get progress toward 4,000 projects goal
 * Public endpoint (no authentication required)
 */
router.get(
  '/projects-goal',
  asyncHandler(async (_req: Request, res: Response) => {
    const { count, error } = await supabase
      .from('project_links')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching projects count:', error);
      throw internalError('Failed to fetch projects goal progress');
    }

    const current = count || 0;
    const goal = 4000;
    const percentage = Math.round((current / goal) * 100 * 100) / 100;

    res.json({
      current,
      goal,
      percentage,
      updated_at: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/metrics/tool-usage
 * Get breakdown of tools used across all projects
 * Public endpoint (no authentication required)
 */
router.get(
  '/tool-usage',
  asyncHandler(async (_req: Request, res: Response) => {
    const { data, error } = await supabase.from('project_links').select('tools_used');

    if (error) {
      console.error('Error fetching tool usage:', error);
      throw internalError('Failed to fetch tool usage data');
    }

    // Aggregate tools from all project links
    const toolCounts: Record<string, number> = {
      Claude: 0,
      Bolt: 0,
      Lovable: 0,
      'Google Studio': 0,
      Other: 0,
    };

    data?.forEach(project => {
      if (project.tools_used && Array.isArray(project.tools_used)) {
        project.tools_used.forEach((tool: string) => {
          // Normalize tool names (case-insensitive matching)
          const normalizedTool = tool.toLowerCase();

          if (normalizedTool.includes('claude')) {
            toolCounts.Claude++;
          } else if (normalizedTool.includes('bolt')) {
            toolCounts.Bolt++;
          } else if (normalizedTool.includes('lovable')) {
            toolCounts.Lovable++;
          } else if (normalizedTool.includes('google') || normalizedTool.includes('studio')) {
            toolCounts['Google Studio']++;
          } else {
            toolCounts.Other++;
          }
        });
      }
    });

    res.json({
      ...toolCounts,
      updated_at: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/metrics/export
 * Export analytics data in CSV or JSON format
 * Requires authentication
 */
router.get(
  '/export',
  authenticate,
  [query('format').isIn(['csv', 'json']).withMessage('Format must be csv or json')],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw badRequest('Validation failed: ' + errors.array().map(e => e.msg).join(', '));
    }

    const format = (req.query.format as string) || 'json';

    try {
      // Fetch all dashboard metrics
      const [
        usersResult,
        projectsResult,
        commentsResult,
        pageViewsResult,
        uniqueVisitorsResult,
        recentRegistrationsResult,
        mostViewedIdeasResult,
        mostCommentedIdeasResult,
        mostBuiltIdeasResult,
      ] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('project_links').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
        supabase.from('page_views').select('id', { count: 'exact', head: true }),
        supabase.from('page_views').select('user_id', { count: 'exact', head: false }),
        supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from('ideas')
          .select('id, title, view_count')
          .order('view_count', { ascending: false })
          .limit(10),
        supabase
          .from('ideas')
          .select('id, title, comment_count')
          .order('comment_count', { ascending: false })
          .limit(10),
        supabase
          .from('ideas')
          .select('id, title, project_count')
          .order('project_count', { ascending: false })
          .limit(10),
      ]);

      // Calculate unique visitors
      const uniqueAuthUsers = new Set(
        uniqueVisitorsResult.data?.filter(v => v.user_id).map(v => v.user_id)
      ).size;
      const totalPageViews = pageViewsResult.count || 0;
      const authPageViews = uniqueVisitorsResult.data?.filter(v => v.user_id).length || 0;
      const guestPageViews = totalPageViews - authPageViews;
      const estimatedUniqueGuests = Math.round(guestPageViews * 0.3);
      const uniqueVisitors = uniqueAuthUsers + estimatedUniqueGuests;

      const totalProjects = projectsResult.count || 0;
      const projectsGoal = 4000;

      const metrics = {
        export_timestamp: new Date().toISOString(),
        total_registrations: usersResult.count || 0,
        total_projects: totalProjects,
        total_comments: commentsResult.count || 0,
        total_page_views: totalPageViews,
        unique_visitors: uniqueVisitors,
        projects_goal: projectsGoal,
        projects_goal_percentage: Math.round((totalProjects / projectsGoal) * 100 * 100) / 100,
        recent_registrations_7d: recentRegistrationsResult.count || 0,
        most_viewed_ideas: mostViewedIdeasResult.data || [],
        most_commented_ideas: mostCommentedIdeasResult.data || [],
        most_built_ideas: mostBuiltIdeasResult.data || [],
      };

      if (format === 'csv') {
        // Generate CSV format
        let csv = 'Metric,Value\n';
        csv += `Export Timestamp,${metrics.export_timestamp}\n`;
        csv += `Total Registrations,${metrics.total_registrations}\n`;
        csv += `Total Projects,${metrics.total_projects}\n`;
        csv += `Total Comments,${metrics.total_comments}\n`;
        csv += `Total Page Views,${metrics.total_page_views}\n`;
        csv += `Unique Visitors,${metrics.unique_visitors}\n`;
        csv += `Projects Goal,${metrics.projects_goal}\n`;
        csv += `Projects Goal Percentage,${metrics.projects_goal_percentage}%\n`;
        csv += `Recent Registrations (7 days),${metrics.recent_registrations_7d}\n`;
        csv += '\nMost Viewed Ideas\n';
        csv += 'ID,Title,View Count\n';
        metrics.most_viewed_ideas.forEach((idea: any) => {
          csv += `${idea.id},"${idea.title}",${idea.view_count}\n`;
        });
        csv += '\nMost Commented Ideas\n';
        csv += 'ID,Title,Comment Count\n';
        metrics.most_commented_ideas.forEach((idea: any) => {
          csv += `${idea.id},"${idea.title}",${idea.comment_count}\n`;
        });
        csv += '\nMost Built Ideas\n';
        csv += 'ID,Title,Project Count\n';
        metrics.most_built_ideas.forEach((idea: any) => {
          csv += `${idea.id},"${idea.title}",${idea.project_count}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="ideahub-metrics-${Date.now()}.csv"`
        );
        res.send(csv);
      } else {
        // Return JSON format
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="ideahub-metrics-${Date.now()}.json"`
        );
        res.json(metrics);
      }
    } catch (error) {
      console.error('Error exporting metrics:', error);
      throw internalError('Failed to export metrics');
    }
  })
);

export default router;
