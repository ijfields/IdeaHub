import express, { Request, Response } from 'express';

const router = express.Router();

/**
 * Base API route
 * GET /api
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'IdeaHub API',
    version: process.env.API_VERSION || 'v1',
    endpoints: {
      health: '/health',
      api: '/api',
      users: '/api/users',
      projects: '/api/projects',
      projectsByIdea: '/api/ideas/:ideaId/projects',
      projectStats: '/api/projects/stats',
      comments: '/api/comments',
      commentsByIdea: '/api/ideas/:ideaId/comments',
      metrics: '/api/metrics',
      metricsPageView: '/api/metrics/page-view',
      metricsDashboard: '/api/metrics/dashboard',
      metricsProjectsGoal: '/api/metrics/projects-goal',
      metricsToolUsage: '/api/metrics/tool-usage',
      metricsExport: '/api/metrics/export',
      ideas: '/api/ideas',
      // Future endpoints will be listed here
      // auth: '/api/auth',
    },
    documentation: 'https://github.com/yourusername/IdeaHub',
  });
});

// Route imports
import usersRouter from './users.js';
import projectsRouter from './projects.js';
import commentsRouter from './comments.js';
import metricsRouter from './metrics.js';
import ideasRouter from './ideas.js';

// Future route imports will go here
// import authRouter from './auth.js';

// Mount routers
router.use('/users', usersRouter);
router.use('/projects', projectsRouter);
router.use('/', commentsRouter); // Mounts /comments and /ideas/:ideaId/comments routes
router.use('/ideas', ideasRouter); // Main ideas routes (includes /ideas/:ideaId/projects GET route and /ideas/:id/view POST route)
router.use('/metrics', metricsRouter);
// Alias /analytics to /metrics for frontend compatibility
router.use('/analytics', metricsRouter);

// Future route mounting will go here
// router.use('/auth', authRouter);

export default router;
