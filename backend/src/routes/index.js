import express from 'express';

const router = express.Router();

/**
 * Base API route
 * GET /api
 */
router.get('/', (req, res) => {
  res.json({
    message: 'IdeaHub API',
    version: process.env.API_VERSION || 'v1',
    endpoints: {
      health: '/health',
      api: '/api',
      // Future endpoints will be listed here
      // ideas: '/api/ideas',
      // comments: '/api/comments',
      // projects: '/api/projects',
      // auth: '/api/auth',
    },
    documentation: 'https://github.com/yourusername/IdeaHub',
  });
});

// Future route imports will go here
// import ideasRouter from './ideas.js';
// import commentsRouter from './comments.js';
// import projectsRouter from './projects.js';
// import authRouter from './auth.js';

// Future route mounting will go here
// router.use('/ideas', ideasRouter);
// router.use('/comments', commentsRouter);
// router.use('/projects', projectsRouter);
// router.use('/auth', authRouter);

export default router;
