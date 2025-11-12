/**
 * User Dashboard Page (Protected)
 *
 * Displays user's projects and activity.
 * Shows user's submitted projects and statistics.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, FolderKanban, MessageSquare, Loader2 } from 'lucide-react';
import type { ProjectLink } from '@/types/database';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<ProjectLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    projectsCount: 0,
    commentsCount: 0,
  });

  useEffect(() => {
    if (user && !authLoading) {
      fetchUserProjects();
      fetchUserStats();
    }
  }, [user, authLoading]);

  // Show loading state during auth check
  if (authLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Redirect if not authenticated (ProtectedRoute should handle this, but double-check)
  if (!authLoading && !user) {
    return null; // ProtectedRoute will handle redirect
  }

  // Ensure user exists before rendering (should be guaranteed by ProtectedRoute)
  if (!user) {
    return null;
  }

  const fetchUserProjects = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('project_links')
        .select('*, ideas(title, category)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        setProjects([]); // Set empty array on error
        return;
      }
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const [projectsResult, commentsResult] = await Promise.all([
        supabase
          .from('project_links')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ]);

      setStats({
        projectsCount: projectsResult.count || 0,
        commentsCount: commentsResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats on error
      setStats({
        projectsCount: 0,
        commentsCount: 0,
      });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">
            View your projects and activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                Projects Submitted
              </CardDescription>
              <CardTitle className="text-4xl">{stats.projectsCount}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments Made
              </CardDescription>
              <CardTitle className="text-4xl">{stats.commentsCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Projects List */}
        <Card>
          <CardHeader>
            <CardTitle>My Projects</CardTitle>
            <CardDescription>
              Projects you've submitted to the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No projects yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Start building and share your projects with the community!
                </p>
                <Button asChild>
                  <Link to="/ideas">Browse Ideas</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{project.title}</h3>
                        {project.ideas && (
                          <Badge variant="outline" className="text-xs">
                            {(project.ideas as any).category}
                          </Badge>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      {project.tools_used && project.tools_used.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {project.tools_used.map((tool) => (
                            <Badge key={tool} variant="secondary" className="text-xs">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {project.url && !project.url.startsWith('http://localhost') && !project.url.startsWith('https://localhost') ? (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          View Project
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {project.url ? 'Invalid project URL (localhost not allowed)' : 'No project URL provided'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
