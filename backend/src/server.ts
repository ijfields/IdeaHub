import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { ApiError } from './utils/errors.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
// Enhanced morgan logging to see all requests
app.use(morgan('dev', {
  skip: (req) => req.url === '/health', // Skip health check spam
}));
// Add request logging middleware
app.use((req, res, next) => {
  console.log(`\n📥 BACKEND: ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler - must come after all other routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handling middleware - must come last
app.use((err: ApiError | Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  const statusCode = (err as ApiError).statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: err.name || 'Error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
});

// Start server (only in non-Vercel environments)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║   IdeaHub Backend API Server              ║
╚════════════════════════════════════════════╝

🚀 Server running on port ${PORT}
📍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Health check: http://localhost:${PORT}/health
⏰ Started at: ${new Date().toLocaleString()}

    `);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', error => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });
}

// Export for Vercel serverless functions
export default app;
