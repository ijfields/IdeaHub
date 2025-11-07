/**
 * Application Router Configuration
 *
 * Sets up all routes for the AI Ideas Hub application using React Router v6.
 * Includes both public and protected routes.
 *
 * Routes:
 * - "/" - Home page (public)
 * - "/ideas" - Ideas list page (public, limited content for guests)
 * - "/ideas/:id" - Idea detail page (public, limited content for guests)
 * - "/login" - Login page (public)
 * - "/signup" - Signup page (public)
 * - "/profile" - User profile page (protected)
 * - "/dashboard" - Admin dashboard (protected)
 * - "*" - 404 Not Found page
 */

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';

// Page imports
import Home from '@/pages/Home';
import IdeasList from '@/pages/IdeasList';
import IdeaDetail from '@/pages/IdeaDetail';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Profile from '@/pages/Profile';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import ThemeTest from '@/pages/ThemeTest';

/**
 * Router configuration using createBrowserRouter
 *
 * This provides the most complete routing features including:
 * - Data loading
 * - Error handling
 * - Nested routes
 * - Code splitting support
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <NotFound />,
  },
  {
    path: '/theme-test',
    element: <ThemeTest />,
  },
  {
    path: '/ideas',
    element: <IdeasList />,
  },
  {
    path: '/ideas/:id',
    element: <IdeaDetail />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

/**
 * App Router Component
 *
 * Provides the router to the application.
 * This component should be rendered at the root of your app.
 *
 * @example
 * ```tsx
 * import { AppRouter } from '@/router';
 *
 * function App() {
 *   return <AppRouter />;
 * }
 * ```
 */
export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
