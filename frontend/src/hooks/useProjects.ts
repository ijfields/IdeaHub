/**
 * React Query hooks for Project Links API
 *
 * This module provides custom hooks for fetching and managing project links
 * with optimistic updates for a better user experience.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from '@/lib/api-client';
import type { ProjectLink, ApiResponse } from '@/lib/api-client';
import { ideaKeys } from './useIdeas';

/**
 * Query key factory for projects
 */
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (ideaId: string) => [...projectKeys.lists(), ideaId] as const,
};

/**
 * Fetch all project links for a specific idea
 *
 * @param ideaId - The idea's unique identifier
 * @param options - Additional React Query options
 *
 * @example
 * ```tsx
 * function ProjectsList({ ideaId }: { ideaId: string }) {
 *   const { data, isLoading } = useProjects(ideaId);
 *
 *   if (isLoading) return <div>Loading projects...</div>;
 *
 *   return (
 *     <div>
 *       {data?.data?.map(project => (
 *         <div key={project.id}>
 *           <h3>{project.title}</h3>
 *           <a href={project.url}>{project.url}</a>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useProjects(
  ideaId: string,
  options?: Omit<
    UseQueryOptions<ApiResponse<ProjectLink[]>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: projectKeys.list(ideaId),
    queryFn: () => getProjects(ideaId),
    enabled: !!ideaId,
    ...options,
  });
}

/**
 * Create a new project link with optimistic updates
 *
 * @example
 * ```tsx
 * function ProjectForm({ ideaId }: { ideaId: string }) {
 *   const [formData, setFormData] = useState({
 *     title: '',
 *     url: '',
 *     description: '',
 *     tools_used: [],
 *   });
 *   const createMutation = useCreateProject();
 *
 *   const handleSubmit = (e: React.FormEvent) => {
 *     e.preventDefault();
 *     createMutation.mutate({
 *       ideaId,
 *       data: formData,
 *     });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input
 *         value={formData.title}
 *         onChange={(e) => setFormData({ ...formData, title: e.target.value })}
 *       />
 *       <button type="submit" disabled={createMutation.isPending}>
 *         {createMutation.isPending ? 'Submitting...' : 'Submit Project'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ideaId,
      data,
    }: {
      ideaId: string;
      data: {
        title: string;
        url: string;
        description?: string;
        tools_used: string[];
      };
    }) => createProject(ideaId, data),

    // Optimistic update
    onMutate: async ({ ideaId, data }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.list(ideaId) });

      const previousProjects = queryClient.getQueryData<
        ApiResponse<ProjectLink[]>
      >(projectKeys.list(ideaId));

      if (previousProjects?.data) {
        const optimisticProject: ProjectLink = {
          id: `temp-${Date.now()}`,
          idea_id: ideaId,
          user_id: 'current-user',
          title: data.title,
          url: data.url,
          description: data.description || null,
          tools_used: data.tools_used,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData<ApiResponse<ProjectLink[]>>(
          projectKeys.list(ideaId),
          {
            ...previousProjects,
            data: [...previousProjects.data, optimisticProject],
          }
        );
      }

      return { previousProjects };
    },

    onError: (err, { ideaId }, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(
          projectKeys.list(ideaId),
          context.previousProjects
        );
      }
      console.error('Error creating project:', err);
    },

    onSettled: (data, error, { ideaId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list(ideaId) });
      // Also invalidate the idea to update project count
      queryClient.invalidateQueries({ queryKey: ideaKeys.detail(ideaId) });
    },
  });
}

/**
 * Update an existing project link with optimistic updates
 *
 * @example
 * ```tsx
 * function EditProject({ project }: { project: ProjectLink }) {
 *   const [formData, setFormData] = useState({
 *     title: project.title,
 *     url: project.url,
 *     description: project.description || '',
 *     tools_used: project.tools_used,
 *   });
 *   const updateMutation = useUpdateProject();
 *
 *   const handleUpdate = () => {
 *     updateMutation.mutate({
 *       projectId: project.id,
 *       ideaId: project.idea_id,
 *       data: formData,
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <input
 *         value={formData.title}
 *         onChange={(e) => setFormData({ ...formData, title: e.target.value })}
 *       />
 *       <button onClick={handleUpdate} disabled={updateMutation.isPending}>
 *         Update
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      ideaId: string;
      data: {
        title?: string;
        url?: string;
        description?: string;
        tools_used?: string[];
      };
    }) => updateProject(projectId, data),

    onMutate: async ({ projectId, ideaId, data }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.list(ideaId) });

      const previousProjects = queryClient.getQueryData<
        ApiResponse<ProjectLink[]>
      >(projectKeys.list(ideaId));

      if (previousProjects?.data) {
        queryClient.setQueryData<ApiResponse<ProjectLink[]>>(
          projectKeys.list(ideaId),
          {
            ...previousProjects,
            data: previousProjects.data.map((project) =>
              project.id === projectId
                ? {
                    ...project,
                    ...data,
                    updated_at: new Date().toISOString(),
                  }
                : project
            ),
          }
        );
      }

      return { previousProjects };
    },

    onError: (err, { ideaId }, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(
          projectKeys.list(ideaId),
          context.previousProjects
        );
      }
      console.error('Error updating project:', err);
    },

    onSettled: (data, error, { ideaId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list(ideaId) });
    },
  });
}

/**
 * Delete a project link with optimistic updates
 *
 * @example
 * ```tsx
 * function DeleteProjectButton({ project }: { project: ProjectLink }) {
 *   const deleteMutation = useDeleteProject();
 *
 *   const handleDelete = () => {
 *     if (confirm('Are you sure you want to delete this project?')) {
 *       deleteMutation.mutate({
 *         projectId: project.id,
 *         ideaId: project.idea_id,
 *       });
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleDelete} disabled={deleteMutation.isPending}>
 *       Delete
 *     </button>
 *   );
 * }
 * ```
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
    }: {
      projectId: string;
      ideaId: string;
    }) => deleteProject(projectId),

    onMutate: async ({ projectId, ideaId }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.list(ideaId) });

      const previousProjects = queryClient.getQueryData<
        ApiResponse<ProjectLink[]>
      >(projectKeys.list(ideaId));

      if (previousProjects?.data) {
        queryClient.setQueryData<ApiResponse<ProjectLink[]>>(
          projectKeys.list(ideaId),
          {
            ...previousProjects,
            data: previousProjects.data.filter(
              (project) => project.id !== projectId
            ),
          }
        );
      }

      return { previousProjects };
    },

    onError: (err, { ideaId }, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(
          projectKeys.list(ideaId),
          context.previousProjects
        );
      }
      console.error('Error deleting project:', err);
    },

    onSettled: (data, error, { ideaId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list(ideaId) });
      // Also invalidate the idea to update project count
      queryClient.invalidateQueries({ queryKey: ideaKeys.detail(ideaId) });
    },
  });
}

/**
 * Type exports for convenience
 */
export type { ProjectLink };
