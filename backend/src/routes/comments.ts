import express, { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import supabase from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, badRequest, notFound, forbidden } from '../utils/errors.js';

const router = express.Router();

// Validation constants
const MAX_COMMENT_LENGTH = 2000;
const MIN_COMMENT_LENGTH = 1;

/**
 * Helper function to build nested comment structure
 * Converts flat array of comments into hierarchical tree
 */
function buildCommentTree(comments: any[]): any[] {
  const commentMap = new Map();
  const rootComments: any[] = [];

  // First pass: create map of all comments with empty replies array
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: build tree structure
  comments.forEach((comment) => {
    const node = commentMap.get(comment.id);
    if (comment.parent_comment_id === null) {
      // Top-level comment
      rootComments.push(node);
    } else {
      // Reply to another comment
      const parent = commentMap.get(comment.parent_comment_id);
      if (parent) {
        parent.replies.push(node);
      }
    }
  });

  return rootComments;
}

/**
 * GET /api/ideas/:ideaId/comments
 * Get all comments for a specific idea
 * Public endpoint - no authentication required
 * Returns nested comment structure with user display names
 */
router.get(
  '/ideas/:ideaId/comments',
  [param('ideaId').isUUID().withMessage('Invalid idea ID format')],
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw badRequest('Invalid request parameters');
    }

    const { ideaId } = req.params;

    // Fetch all comments for the idea with user information
    // Join with users table to get display_name
    const { data: comments, error } = await supabase
      .from('comments')
      .select(
        `
        id,
        idea_id,
        user_id,
        parent_comment_id,
        content,
        flagged_for_moderation,
        created_at,
        updated_at,
        users (
          display_name,
          email
        )
      `
      )
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      throw new Error('Failed to fetch comments');
    }

    // Transform comments to include user info at top level
    const transformedComments = (comments || []).map((comment: any) => ({
      id: comment.id,
      idea_id: comment.idea_id,
      user_id: comment.user_id,
      parent_comment_id: comment.parent_comment_id,
      content: comment.content,
      flagged_for_moderation: comment.flagged_for_moderation,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      user_display_name: comment.users?.display_name || 'Anonymous',
    }));

    // Build nested comment tree
    const nestedComments = buildCommentTree(transformedComments);

    res.json({
      success: true,
      data: nestedComments,
      count: transformedComments.length,
    });
  })
);

/**
 * POST /api/comments
 * Create a new top-level comment on an idea
 * Requires authentication
 */
router.post(
  '/comments',
  authenticate,
  [
    body('idea_id').isUUID().withMessage('Invalid idea ID format'),
    body('content')
      .trim()
      .isLength({ min: MIN_COMMENT_LENGTH, max: MAX_COMMENT_LENGTH })
      .withMessage(`Comment must be between ${MIN_COMMENT_LENGTH} and ${MAX_COMMENT_LENGTH} characters`),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw badRequest(errors.array()[0].msg);
    }

    const { idea_id, content } = req.body;
    const userId = req.userId!; // Safe to assert because authenticate middleware ensures it exists

    // Verify the idea exists
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id')
      .eq('id', idea_id)
      .single();

    if (ideaError || !idea) {
      throw notFound('Idea not found');
    }

    // Create the comment
    const { data: newComment, error: commentError } = await supabase
      .from('comments')
      .insert({
        idea_id,
        user_id: userId,
        parent_comment_id: null, // Top-level comment
        content,
        flagged_for_moderation: false,
      })
      .select(
        `
        id,
        idea_id,
        user_id,
        parent_comment_id,
        content,
        flagged_for_moderation,
        created_at,
        updated_at,
        users (
          display_name,
          email
        )
      `
      )
      .single();

    if (commentError) {
      console.error('Error creating comment:', commentError);
      throw new Error('Failed to create comment');
    }

    // Increment comment count on the ideas table
    const { error: updateError } = await supabase.rpc('increment_comment_count', {
      idea_id_param: idea_id,
    });

    if (updateError) {
      console.error('Error incrementing comment count:', updateError);
      // Don't throw - comment was created successfully, just log the error
    }

    // Transform response
    const commentData: any = newComment;
    const response = {
      ...commentData,
      user_display_name: commentData.users?.display_name || 'Anonymous',
      users: undefined, // Remove nested users object
    };

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: response,
    });
  })
);

/**
 * POST /api/comments/:id/reply
 * Reply to an existing comment
 * Requires authentication
 */
router.post(
  '/comments/:id/reply',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid comment ID format'),
    body('content')
      .trim()
      .isLength({ min: MIN_COMMENT_LENGTH, max: MAX_COMMENT_LENGTH })
      .withMessage(`Comment must be between ${MIN_COMMENT_LENGTH} and ${MAX_COMMENT_LENGTH} characters`),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw badRequest(errors.array()[0].msg);
    }

    const { id: parentCommentId } = req.params;
    const { content } = req.body;
    const userId = req.userId!;

    // Verify the parent comment exists and get the idea_id
    const { data: parentComment, error: parentError } = await supabase
      .from('comments')
      .select('id, idea_id')
      .eq('id', parentCommentId)
      .single();

    if (parentError || !parentComment) {
      throw notFound('Parent comment not found');
    }

    // Create the reply
    const { data: newReply, error: replyError } = await supabase
      .from('comments')
      .insert({
        idea_id: parentComment.idea_id,
        user_id: userId,
        parent_comment_id: parentCommentId,
        content,
        flagged_for_moderation: false,
      })
      .select(
        `
        id,
        idea_id,
        user_id,
        parent_comment_id,
        content,
        flagged_for_moderation,
        created_at,
        updated_at,
        users (
          display_name,
          email
        )
      `
      )
      .single();

    if (replyError) {
      console.error('Error creating reply:', replyError);
      throw new Error('Failed to create reply');
    }

    // Increment comment count on the ideas table
    const { error: updateError } = await supabase.rpc('increment_comment_count', {
      idea_id_param: parentComment.idea_id,
    });

    if (updateError) {
      console.error('Error incrementing comment count:', updateError);
      // Don't throw - reply was created successfully, just log the error
    }

    // Transform response
    const replyData: any = newReply;
    const response = {
      ...replyData,
      user_display_name: replyData.users?.display_name || 'Anonymous',
      users: undefined, // Remove nested users object
    };

    res.status(201).json({
      success: true,
      message: 'Reply created successfully',
      data: response,
    });
  })
);

/**
 * PATCH /api/comments/:id
 * Update an existing comment
 * Requires authentication and ownership verification
 */
router.patch(
  '/comments/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid comment ID format'),
    body('content')
      .trim()
      .isLength({ min: MIN_COMMENT_LENGTH, max: MAX_COMMENT_LENGTH })
      .withMessage(`Comment must be between ${MIN_COMMENT_LENGTH} and ${MAX_COMMENT_LENGTH} characters`),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw badRequest(errors.array()[0].msg);
    }

    const { id: commentId } = req.params;
    const { content } = req.body;
    const userId = req.userId!;

    // Verify the comment exists and check ownership
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('id, user_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !existingComment) {
      throw notFound('Comment not found');
    }

    // Verify user is the comment author
    if (existingComment.user_id !== userId) {
      throw forbidden('You can only edit your own comments');
    }

    // Update the comment
    const { data: updatedComment, error: updateError } = await supabase
      .from('comments')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select(
        `
        id,
        idea_id,
        user_id,
        parent_comment_id,
        content,
        flagged_for_moderation,
        created_at,
        updated_at,
        users (
          display_name,
          email
        )
      `
      )
      .single();

    if (updateError) {
      console.error('Error updating comment:', updateError);
      throw new Error('Failed to update comment');
    }

    // Transform response
    const updatedData: any = updatedComment;
    const response = {
      ...updatedData,
      user_display_name: updatedData.users?.display_name || 'Anonymous',
      users: undefined, // Remove nested users object
    };

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: response,
    });
  })
);

/**
 * DELETE /api/comments/:id
 * Delete a comment and all its nested replies
 * Requires authentication and ownership verification
 * Decrements comment_count on ideas table
 */
router.delete(
  '/comments/:id',
  authenticate,
  [param('id').isUUID().withMessage('Invalid comment ID format')],
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw badRequest(errors.array()[0].msg);
    }

    const { id: commentId } = req.params;
    const userId = req.userId!;

    // Verify the comment exists and check ownership
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('id, user_id, idea_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !existingComment) {
      throw notFound('Comment not found');
    }

    // Verify user is the comment author
    if (existingComment.user_id !== userId) {
      throw forbidden('You can only delete your own comments');
    }

    // Count total comments to delete (parent + all nested replies)
    // This will help us accurately decrement the comment count
    const { data: allComments, error: countError } = await supabase
      .from('comments')
      .select('id')
      .or(`id.eq.${commentId},parent_comment_id.eq.${commentId}`);

    const deleteCount = allComments?.length || 1;

    if (countError) {
      console.error('Error counting comments for deletion:', countError);
    }

    // Delete the comment (CASCADE should handle nested replies)
    const { error: deleteError } = await supabase.from('comments').delete().eq('id', commentId);

    if (deleteError) {
      console.error('Error deleting comment:', deleteError);
      throw new Error('Failed to delete comment');
    }

    // Decrement comment count on the ideas table
    const { error: updateError } = await supabase.rpc('decrement_comment_count', {
      idea_id_param: existingComment.idea_id,
      count_param: deleteCount,
    });

    if (updateError) {
      console.error('Error decrementing comment count:', updateError);
      // Don't throw - comment was deleted successfully, just log the error
    }

    res.json({
      success: true,
      message: `Comment and ${deleteCount - 1} nested replies deleted successfully`,
      deleted_count: deleteCount,
    });
  })
);

/**
 * POST /api/comments/:id/flag
 * Flag a comment for moderation
 * Requires authentication
 */
router.post(
  '/comments/:id/flag',
  authenticate,
  [param('id').isUUID().withMessage('Invalid comment ID format')],
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw badRequest(errors.array()[0].msg);
    }

    const { id: commentId } = req.params;

    // Verify the comment exists
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('id, flagged_for_moderation')
      .eq('id', commentId)
      .single();

    if (fetchError || !existingComment) {
      throw notFound('Comment not found');
    }

    // Flag the comment for moderation
    const { error: flagError } = await supabase
      .from('comments')
      .update({
        flagged_for_moderation: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId);

    if (flagError) {
      console.error('Error flagging comment:', flagError);
      throw new Error('Failed to flag comment');
    }

    res.json({
      success: true,
      message: 'Comment flagged for moderation',
    });
  })
);

export default router;
