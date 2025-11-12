/**
 * React Query hooks for Ideas API
 *
 * This module provides custom hooks for fetching and managing ideas data
 * using TanStack Query for caching and state management.
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getIdeas, getIdeaById, searchIdeas, incrementView } from '@/lib/api-client';
import type { Idea, ApiResponse, IdeaFilters } from '@/lib/api-client';

/**
 * Query key factory for ideas
 * Helps maintain consistent cache keys across the application
 */
export const ideaKeys = {
  all: ['ideas'] as const,
  lists: () => [...ideaKeys.all, 'list'] as const,
  list: (filters?: IdeaFilters) => [...ideaKeys.lists(), filters] as const,
  details: () => [...ideaKeys.all, 'detail'] as const,
  detail: (id: string) => [...ideaKeys.details(), id] as const,
  search: (query: string) => [...ideaKeys.all, 'search', query] as const,
};

/**
 * Fetch a list of ideas with optional filters
 *
 * @param filters - Optional filters for category, difficulty, search, etc.
 * @param options - Additional React Query options
 *
 * @example
 * ```tsx
 * function IdeasList() {
 *   const { data, isLoading, error } = useIdeas({
 *     category: 'Education',
 *     difficulty: 'Beginner',
 *   });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <ul>
 *       {data?.data?.map(idea => (
 *         <li key={idea.id}>{idea.title}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useIdeas(
  filters?: IdeaFilters,
  options?: Omit<UseQueryOptions<ApiResponse<Idea[]>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ideaKeys.list(filters),
    queryFn: async () => {
      try {
        return await getIdeas(filters);
      } catch (error) {
        console.error('Error fetching ideas:', error);
        throw error;
      }
    },
    retry: false, // Disable retries to prevent cascading errors
    ...options,
  });
}

/**
 * Fetch a single idea by ID
 *
 * @param id - The idea's unique identifier
 * @param options - Additional React Query options
 *
 * @example
 * ```tsx
 * function IdeaDetail({ id }: { id: string }) {
 *   const { data, isLoading } = useIdea(id);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       <h1>{data?.data?.title}</h1>
 *       <p>{data?.data?.description}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useIdea(
  id: string,
  options?: Omit<UseQueryOptions<ApiResponse<Idea>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ideaKeys.detail(id),
    queryFn: () => getIdeaById(id),
    enabled: !!id, // Only run query if id is provided
    ...options,
  });
}

/**
 * Search ideas by query string
 *
 * @param query - Search query string
 * @param options - Additional React Query options
 *
 * @example
 * ```tsx
 * function SearchResults({ query }: { query: string }) {
 *   const { data, isLoading } = useSearchIdeas(query, {
 *     enabled: query.length > 2, // Only search if query is long enough
 *   });
 *
 *   if (isLoading) return <div>Searching...</div>;
 *
 *   return (
 *     <div>
 *       {data?.data?.map(idea => (
 *         <div key={idea.id}>{idea.title}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useSearchIdeas(
  query: string,
  options?: Omit<UseQueryOptions<ApiResponse<Idea[]>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ideaKeys.search(query),
    queryFn: () => searchIdeas(query),
    enabled: query.length > 0, // Only search if query is not empty
    ...options,
  });
}

/**
 * Increment view count for an idea
 * This is typically called when a user views an idea detail page
 *
 * @param ideaId - The idea's unique identifier
 *
 * @example
 * ```tsx
 * function IdeaDetail({ id }: { id: string }) {
 *   const { data } = useIdea(id);
 *
 *   useEffect(() => {
 *     // Track view when component mounts
 *     incrementView(id).catch(console.error);
 *   }, [id]);
 *
 *   return <div>{data?.data?.title}</div>;
 * }
 * ```
 */
export { incrementView };

/**
 * Type exports for convenience
 */
export type { Idea, IdeaFilters };
