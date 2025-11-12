/**
 * React Query hooks for Comments API
 *
 * This module provides custom hooks for fetching and managing comments
 * with optimistic updates for a better user experience.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from '@/lib/api-client';
import type { Comment, ApiResponse } from '@/lib/api-client';
import { ideaKeys } from './useIdeas';
import { useAuth } from '@/context/AuthContext';

/**
 * Query key factory for comments
 */
export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (ideaId: string) => [...commentKeys.lists(), ideaId] as const,
};

/**
 * Fetch all comments for a specific idea
 *
 * @param ideaId - The idea's unique identifier
 * @param options - Additional React Query options
 *
 * @example
 * ```tsx
 * function CommentsList({ ideaId }: { ideaId: string }) {
 *   const { data, isLoading } = useComments(ideaId);
 *
 *   if (isLoading) return <div>Loading comments...</div>;
 *
 *   return (
 *     <div>
 *       {data?.data?.map(comment => (
 *         <div key={comment.id}>{comment.content}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useComments(
  ideaId: string,
  options?: Omit<UseQueryOptions<ApiResponse<Comment[]>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: commentKeys.list(ideaId),
    queryFn: () => getComments(ideaId),
    enabled: !!ideaId,
    ...options,
  });
}

/**
 * Create a new comment with optimistic updates
 *
 * @example
 * ```tsx
 * function CommentForm({ ideaId }: { ideaId: string }) {
 *   const [content, setContent] = useState('');
 *   const createMutation = useCreateComment();
 *
 *   const handleSubmit = (e: React.FormEvent) => {
 *     e.preventDefault();
 *     createMutation.mutate({
 *       ideaId,
 *       content,
 *     });
 *     setContent('');
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <textarea value={content} onChange={(e) => setContent(e.target.value)} />
 *       <button type="submit" disabled={createMutation.isPending}>
 *         {createMutation.isPending ? 'Posting...' : 'Post Comment'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useCreateComment() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: ({
      ideaId,
      content,
      parentCommentId,
    }: {
      ideaId: string;
      content: string;
      parentCommentId?: string;
    }) => createComment(ideaId, content, parentCommentId),

    // Optimistic update
    onMutate: async ({ ideaId, content, parentCommentId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: commentKeys.list(ideaId) });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData<ApiResponse<Comment[]>>(
        commentKeys.list(ideaId)
      );

      // Optimistically update to the new value
      if (previousComments?.data && user) {
        const optimisticComment: Comment = {
          id: `temp-${Date.now()}`,
          idea_id: ideaId,
          user_id: user.id,
          parent_comment_id: parentCommentId || null,
          content,
          flagged_for_moderation: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user: {
            display_name: profile?.display_name || null,
            email: user.email || null,
          },
        };

        queryClient.setQueryData<ApiResponse<Comment[]>>(
          commentKeys.list(ideaId),
          {
            ...previousComments,
            data: [...previousComments.data, optimisticComment],
          }
        );
      }

      return { previousComments };
    },

    // If mutation fails, rollback to previous value
    onError: (err, { ideaId }, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          commentKeys.list(ideaId),
          context.previousComments
        );
      }
      console.error('🔴 COMMENT MUTATION ERROR:', err);
      console.error('   Error details:', {
        message: (err as any)?.message,
        response: (err as any)?.response?.data,
        status: (err as any)?.response?.status,
        url: (err as any)?.config?.url,
      });
    },

    // Always refetch after error or success
    onSettled: (data, error, { ideaId }) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(ideaId) });
      // Also invalidate the idea to update comment count
      queryClient.invalidateQueries({ queryKey: ideaKeys.detail(ideaId) });
    },
  });
}

/**
 * Update an existing comment with optimistic updates
 *
 * @example
 * ```tsx
 * function EditComment({ comment }: { comment: Comment }) {
 *   const [content, setContent] = useState(comment.content);
 *   const updateMutation = useUpdateComment();
 *
 *   const handleUpdate = () => {
 *     updateMutation.mutate({
 *       commentId: comment.id,
 *       content,
 *       ideaId: comment.idea_id,
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <textarea value={content} onChange={(e) => setContent(e.target.value)} />
 *       <button onClick={handleUpdate} disabled={updateMutation.isPending}>
 *         Update
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
      ideaId: string;
    }) => updateComment(commentId, content),

    // Optimistic update
    onMutate: async ({ commentId, content, ideaId }) => {
      await queryClient.cancelQueries({ queryKey: commentKeys.list(ideaId) });

      const previousComments = queryClient.getQueryData<ApiResponse<Comment[]>>(
        commentKeys.list(ideaId)
      );

      if (previousComments?.data) {
        queryClient.setQueryData<ApiResponse<Comment[]>>(
          commentKeys.list(ideaId),
          {
            ...previousComments,
            data: previousComments.data.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    content,
                    updated_at: new Date().toISOString(),
                  }
                : comment
            ),
          }
        );
      }

      return { previousComments };
    },

    onError: (err, { ideaId }, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          commentKeys.list(ideaId),
          context.previousComments
        );
      }
      console.error('Error updating comment:', err);
    },

    onSettled: (data, error, { ideaId }) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(ideaId) });
    },
  });
}

/**
 * Delete a comment with optimistic updates
 *
 * @example
 * ```tsx
 * function DeleteCommentButton({ comment }: { comment: Comment }) {
 *   const deleteMutation = useDeleteComment();
 *
 *   const handleDelete = () => {
 *     if (confirm('Are you sure you want to delete this comment?')) {
 *       deleteMutation.mutate({
 *         commentId: comment.id,
 *         ideaId: comment.idea_id,
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
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
    }: {
      commentId: string;
      ideaId: string;
    }) => deleteComment(commentId),

    // Optimistic update
    onMutate: async ({ commentId, ideaId }) => {
      await queryClient.cancelQueries({ queryKey: commentKeys.list(ideaId) });

      const previousComments = queryClient.getQueryData<ApiResponse<Comment[]>>(
        commentKeys.list(ideaId)
      );

      if (previousComments?.data) {
        queryClient.setQueryData<ApiResponse<Comment[]>>(
          commentKeys.list(ideaId),
          {
            ...previousComments,
            data: previousComments.data.filter(
              (comment) => comment.id !== commentId
            ),
          }
        );
      }

      return { previousComments };
    },

    onError: (err, { ideaId }, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          commentKeys.list(ideaId),
          context.previousComments
        );
      }
      console.error('Error deleting comment:', err);
    },

    onSettled: (data, error, { ideaId }) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(ideaId) });
      // Also invalidate the idea to update comment count
      queryClient.invalidateQueries({ queryKey: ideaKeys.detail(ideaId) });
    },
  });
}

/**
 * Type exports for convenience
 */
export type { Comment };
