import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface DashboardMetrics {
  totalUsers: number;
  totalProjects: number;
  totalComments: number;
  totalIdeas: number;
  totalPageViews: number;
  uniqueVisitors: number;
  recentRegistrations: Array<{ date: string; count: number }>;
  mostViewedIdeas: Array<{ id: string; title: string; view_count: number }>;
  mostCommentedIdeas: Array<{ id: string; title: string; comment_count: number }>;
  mostBuiltIdeas: Array<{ id: string; title: string; project_count: number }>;
}

interface ProjectsGoalMetrics {
  total_projects: number;
  total_ideas: number;
  campaign_goal: number;
  progress_percentage: number;
  days_remaining: number;
}

/**
 * Hook to fetch dashboard metrics (admin view)
 * Requires authentication
 */
export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: ['metrics', 'dashboard'],
    queryFn: async () => {
      // Get auth token from Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_URL}/api/metrics/dashboard`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard metrics');
      }

      const data = await response.json();
      // Backend returns snake_case, map to camelCase
      return {
        totalUsers: data.total_registrations || 0,
        totalProjects: data.total_projects || 0,
        totalComments: data.total_comments || 0,
        totalIdeas: data.total_ideas || 0,
        totalPageViews: data.total_page_views || 0,
        uniqueVisitors: data.unique_visitors || 0,
        recentRegistrations: data.recent_registrations || [],
        mostViewedIdeas: data.most_viewed_ideas || [],
        mostCommentedIdeas: data.most_commented_ideas || [],
        mostBuiltIdeas: data.most_built_ideas || [],
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch projects goal progress (public)
 * No authentication required
 */
export function useProjectsGoal() {
  return useQuery<ProjectsGoalMetrics>({
    queryKey: ['metrics', 'projects-goal'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/metrics/projects-goal`);

      if (!response.ok) {
        throw new Error('Failed to fetch projects goal');
      }

      const data = await response.json();
      // Backend returns snake_case, map to interface format
      return {
        total_projects: data.total_projects || 0,
        total_ideas: data.total_ideas || 0,
        campaign_goal: data.goal || 4000,
        progress_percentage: data.percentage || 0,
        days_remaining: 0, // Calculated on frontend if needed
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch public metrics (for homepage - no auth required)
 * Falls back to dashboard metrics if available
 */
export function usePublicMetrics() {
  const projectsGoal = useProjectsGoal();
  const dashboardMetrics = useDashboardMetrics();

  // If dashboard metrics available (user is authenticated), use those
  if (dashboardMetrics.isSuccess) {
    return {
      data: {
        totalUsers: dashboardMetrics.data.totalUsers,
        totalProjects: dashboardMetrics.data.totalProjects,
        totalComments: dashboardMetrics.data.totalComments,
        totalIdeas: dashboardMetrics.data.totalIdeas,
        visitsGoal: 4000, // Campaign goal is 4k VISITS (page views)
        visitsProgress: dashboardMetrics.data.totalPageViews || 0,
      },
      isLoading: false,
      error: null,
    };
  }

  // For unauthenticated users, show limited public metrics
  return {
    data: {
      totalUsers: null, // Hidden for guests
      totalProjects: projectsGoal.data?.total_projects || 0,
      totalComments: null, // Hidden for guests
      totalIdeas: projectsGoal.data?.total_ideas || 0,
      visitsGoal: 4000, // Campaign goal is 4k VISITS (page views)
      visitsProgress: 0, // Guests can't see visit count
    },
    isLoading: projectsGoal.isLoading,
    error: projectsGoal.error,
  };
}
