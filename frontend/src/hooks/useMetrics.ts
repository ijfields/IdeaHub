import { useQuery } from '@tanstack/react-query';

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
      // Get auth token from localStorage (Supabase stores it there)
      const supabaseAuth = localStorage.getItem('supabase.auth.token');
      let token = null;

      if (supabaseAuth) {
        try {
          const authData = JSON.parse(supabaseAuth);
          token = authData?.access_token || authData?.currentSession?.access_token;
        } catch (e) {
          console.error('Failed to parse auth token:', e);
        }
      }

      const response = await fetch(`${API_URL}/api/metrics/dashboard`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard metrics');
      }

      const data = await response.json();
      return data.data;
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
      return data.data;
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
      totalIdeas: 87, // Static for now (update when you add all 87 ideas)
      visitsGoal: 4000, // Campaign goal is 4k VISITS (page views)
      visitsProgress: 0, // Guests can't see visit count
    },
    isLoading: projectsGoal.isLoading,
    error: projectsGoal.error,
  };
}
