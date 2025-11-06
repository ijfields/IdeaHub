/**
 * React Query (TanStack Query) client configuration
 *
 * This module exports a configured QueryClient instance for managing
 * server state, caching, and data fetching across the application.
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Configured QueryClient instance with sensible defaults
 *
 * Configuration:
 * - Queries are cached for 5 minutes
 * - Stale queries refetch on window focus
 * - Failed queries retry up to 3 times with exponential backoff
 * - Errors are logged in development mode
 *
 * @example
 * ```tsx
 * import { QueryClientProvider } from '@tanstack/react-query';
 * import { queryClient } from '@/lib/query-client';
 *
 * function App() {
 *   return (
 *     <QueryClientProvider client={queryClient}>
 *       <YourApp />
 *     </QueryClientProvider>
 *   );
 * }
 * ```
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time in milliseconds before data is considered stale (5 minutes)
      staleTime: 1000 * 60 * 5,

      // Time in milliseconds before inactive queries are garbage collected (10 minutes)
      gcTime: 1000 * 60 * 10,

      // Refetch data when window regains focus
      refetchOnWindowFocus: true,

      // Refetch data when reconnecting to the internet
      refetchOnReconnect: true,

      // Number of retry attempts for failed queries
      retry: 3,

      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Number of retry attempts for failed mutations
      retry: 1,

      // Error handler for mutations
      onError: (error) => {
        // Log errors in development
        if (import.meta.env.DEV) {
          console.error('Mutation error:', error);
        }
      },
    },
  },
});
