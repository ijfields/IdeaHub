// Vercel serverless function entry point
// This imports the compiled Express app and exports it for Vercel

// Import the compiled server from dist
import app from '../dist/server.js';

// Export the Express app as the default export for Vercel
export default app;
