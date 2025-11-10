import express, { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, badRequest, notFound, forbidden } from '../utils/errors.js';

const router = express.Router();

// Log all requests to comments router for debugging
router.use((req, res, next) => {
  console.log(`📝 COMMENTS ROUTER: ${req.method} ${req.path}`);
  next();
});

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

    if (!supabaseAdmin) {
      throw new Error('Database connection not available');
    }

    // Fetch all comments for the idea with user information
    // Join with users table to get display_name
    // Use supabaseAdmin to bypass RLS for public read access
    const { data: comments, error } = await supabaseAdmin
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

    // Transform comments to match frontend expectations (user object structure)
    const transformedComments = (comments || []).map((comment: any) => {
      // Fetch user data if not included in join
      let userDisplayName = comment.users?.display_name || null;
      let userEmail = comment.users?.email || null;
      
      return {
        id: comment.id,
        idea_id: comment.idea_id,
        user_id: comment.user_id,
        parent_comment_id: comment.parent_comment_id,
        content: comment.content,
        flagged_for_moderation: comment.flagged_for_moderation,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        user: {
          display_name: userDisplayName,
          email: userEmail,
        },
      };
    });

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
 * POST /api/ideas/:ideaId/comments
 * Create a new top-level comment on an idea (alternative endpoint)
 * Requires authentication
 * This endpoint matches the frontend API client expectations
 */
router.post(
  '/ideas/:ideaId/comments',
  authenticate,
  [
    param('ideaId').isUUID().withMessage('Invalid idea ID format'),
    body('content')
      .trim()
      .isLength({ min: MIN_COMMENT_LENGTH, max: MAX_COMMENT_LENGTH })
      .withMessage(`Comment must be between ${MIN_COMMENT_LENGTH} and ${MAX_COMMENT_LENGTH} characters`),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('🔴 BACKEND: Validation errors:', errors.array());
      throw badRequest(errors.array()[0].msg);
    }

    const { ideaId } = req.params;
    const { content, parent_comment_id } = req.body;
    const userId = req.userId!; // Safe to assert because authenticate middleware ensures it exists

    console.log('\n🔵 BACKEND: POST /api/ideas/:ideaId/comments');
    console.log('   Idea ID:', ideaId);
    console.log('   User ID:', userId);
    console.log('   Content length:', content?.length || 0);
    console.log('   Content preview:', content?.substring(0, 50) || 'empty');
    console.log('   Parent comment ID:', parent_comment_id || 'none');
    console.log('   Request body:', JSON.stringify(req.body, null, 2));
    console.log('═══════════════════════════════════════════════════════════\n');

    if (!supabaseAdmin) {
      console.error('🔴 BACKEND: Supabase admin client not initialized');
      throw new Error('Database connection not available');
    }

    // Verify the idea exists
    const { data: idea, error: ideaError } = await supabaseAdmin
      .from('ideas')
      .select('id')
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      console.error('🔴 BACKEND: Idea not found:', ideaError);
      throw notFound('Idea not found');
    }

    // Create the comment (use supabaseAdmin to bypass RLS)
    const { data: newComment, error: commentError } = await supabaseAdmin
      .from('comments')
      .insert({
        idea_id: ideaId,
        user_id: userId,
        parent_comment_id: parent_comment_id || null,
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
      console.error('🔴 BACKEND: Error creating comment:', commentError);
      throw new Error('Failed to create comment');
    }

    console.log('🟢 BACKEND: Comment created successfully');
    console.log('   Comment ID:', newComment?.id);
    console.log('   Raw newComment:', JSON.stringify(newComment, null, 2));
    console.log('   User display name:', (newComment as any)?.users?.display_name || 'Anonymous');
    console.log('   User email:', (newComment as any)?.users?.email || 'None');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Increment comment count on the ideas table
    const { error: updateError } = await supabaseAdmin.rpc('increment_comment_count', {
      idea_id_param: ideaId,
    });

    if (updateError) {
      console.error('🔴 BACKEND: Error incrementing comment count:', updateError);
      // Don't throw - comment was created successfully, just log the error
    }

    // Transform response to match frontend expectations
    const commentData: any = newComment;
    
    // If users data wasn't joined, fetch it separately
    let userDisplayName = commentData.users?.display_name || null;
    let userEmail = commentData.users?.email || null;
    
    if (!userDisplayName && !userEmail && commentData.user_id) {
      console.log('🔵 BACKEND: User data not in join, fetching separately...');
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('display_name, email')
        .eq('id', commentData.user_id)
        .single();
      
      if (!userError && userData) {
        userDisplayName = userData.display_name;
        userEmail = userData.email;
        console.log('🟢 BACKEND: Fetched user data:', { display_name: userDisplayName, email: userEmail });
      } else {
        console.error('🔴 BACKEND: Error fetching user data:', userError);
      }
    }
    
    const response = {
      id: commentData.id,
      idea_id: commentData.idea_id,
      user_id: commentData.user_id,
      parent_comment_id: commentData.parent_comment_id,
      content: commentData.content,
      flagged_for_moderation: commentData.flagged_for_moderation,
      created_at: commentData.created_at,
      updated_at: commentData.updated_at,
      user: {
        display_name: userDisplayName,
        email: userEmail,
      },
    };
    
    console.log('🟢 BACKEND: Final response:', JSON.stringify(response, null, 2));

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: response,
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

    if (!supabaseAdmin) {
      throw new Error('Database connection not available');
    }

    // Verify the idea exists
    const { data: idea, error: ideaError } = await supabaseAdmin
      .from('ideas')
      .select('id')
      .eq('id', idea_id)
      .single();

    if (ideaError || !idea) {
      throw notFound('Idea not found');
    }

    // Create the comment (use supabaseAdmin to bypass RLS)
    const { data: newComment, error: commentError } = await supabaseAdmin
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
    const { error: updateError } = await supabaseAdmin.rpc('increment_comment_count', {
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

    if (!supabaseAdmin) {
      throw new Error('Database connection not available');
    }

    // Verify the parent comment exists and get the idea_id
    const { data: parentComment, error: parentError } = await supabaseAdmin
      .from('comments')
      .select('id, idea_id')
      .eq('id', parentCommentId)
      .single();

    if (parentError || !parentComment) {
      throw notFound('Parent comment not found');
    }

    // Create the reply (use supabaseAdmin to bypass RLS)
    const { data: newReply, error: replyError } = await supabaseAdmin
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
    const { error: updateError } = await supabaseAdmin.rpc('increment_comment_count', {
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

    if (!supabaseAdmin) {
      throw new Error('Database connection not available');
    }

    // Verify the comment exists and check ownership
    const { data: existingComment, error: fetchError } = await supabaseAdmin
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

    // Update the comment (use supabaseAdmin to bypass RLS)
    const { data: updatedComment, error: updateError } = await supabaseAdmin
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
      console.error('🔴 BACKEND: Error updating comment:', updateError);
      console.error('   Update error details:', JSON.stringify(updateError, null, 2));
      throw new Error('Failed to update comment');
    }

    console.log('🟢 BACKEND: Comment updated successfully');
    console.log('   Comment ID:', updatedComment?.id);
    console.log('   Raw updatedComment:', JSON.stringify(updatedComment, null, 2));

    // Transform response to match frontend expectations
    const updatedData: any = updatedComment;
    
    // If users data wasn't joined, fetch it separately
    let userDisplayName = updatedData.users?.display_name || null;
    let userEmail = updatedData.users?.email || null;
    
    if (!userDisplayName && !userEmail && updatedData.user_id) {
      console.log('🔵 BACKEND: User data not in join, fetching separately...');
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('display_name, email')
        .eq('id', updatedData.user_id)
        .single();
      
      if (!userError && userData) {
        userDisplayName = userData.display_name;
        userEmail = userData.email;
        console.log('🟢 BACKEND: Fetched user data:', { display_name: userDisplayName, email: userEmail });
      } else {
        console.error('🔴 BACKEND: Error fetching user data:', userError);
      }
    }
    
    const response = {
      id: updatedData.id,
      idea_id: updatedData.idea_id,
      user_id: updatedData.user_id,
      parent_comment_id: updatedData.parent_comment_id,
      content: updatedData.content,
      flagged_for_moderation: updatedData.flagged_for_moderation,
      created_at: updatedData.created_at,
      updated_at: updatedData.updated_at,
      user: {
        display_name: userDisplayName,
        email: userEmail,
      },
    };
    
    console.log('🟢 BACKEND: Final update response:', JSON.stringify(response, null, 2));

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: response,
    });
  })
);

/**
 * PUT /api/comments/:id
 * Update an existing comment (alternative endpoint for PUT method)
 * Requires authentication and ownership verification
 * This endpoint matches the frontend API client expectations
 */
router.put(
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

    if (!supabaseAdmin) {
      throw new Error('Database connection not available');
    }

    console.log('\n🔵 BACKEND: PUT /api/comments/:id');
    console.log('   Comment ID:', commentId);
    console.log('   User ID:', userId);
    console.log('   Content length:', content?.length || 0);
    console.log('═══════════════════════════════════════════════════════════\n');

    // Verify the comment exists and check ownership
    const { data: existingComment, error: fetchError } = await supabaseAdmin
      .from('comments')
      .select('id, user_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !existingComment) {
      console.error('🔴 BACKEND: Comment not found:', fetchError);
      throw notFound('Comment not found');
    }

    // Verify user is the comment author
    if (existingComment.user_id !== userId) {
      console.error('🔴 BACKEND: User is not the comment author');
      throw forbidden('You can only edit your own comments');
    }

    // Update the comment (use supabaseAdmin to bypass RLS)
    const { data: updatedComment, error: updateError } = await supabaseAdmin
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
      console.error('🔴 BACKEND: Error updating comment:', updateError);
      console.error('   Update error details:', JSON.stringify(updateError, null, 2));
      throw new Error('Failed to update comment');
    }

    console.log('🟢 BACKEND: Comment updated successfully');
    console.log('   Comment ID:', updatedComment?.id);
    console.log('   Raw updatedComment:', JSON.stringify(updatedComment, null, 2));

    // Transform response to match frontend expectations
    const updatedData: any = updatedComment;
    
    // If users data wasn't joined, fetch it separately
    let userDisplayName = updatedData.users?.display_name || null;
    let userEmail = updatedData.users?.email || null;
    
    if (!userDisplayName && !userEmail && updatedData.user_id) {
      console.log('🔵 BACKEND: User data not in join, fetching separately...');
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('display_name, email')
        .eq('id', updatedData.user_id)
        .single();
      
      if (!userError && userData) {
        userDisplayName = userData.display_name;
        userEmail = userData.email;
        console.log('🟢 BACKEND: Fetched user data:', { display_name: userDisplayName, email: userEmail });
      } else {
        console.error('🔴 BACKEND: Error fetching user data:', userError);
      }
    }
    
    const response = {
      id: updatedData.id,
      idea_id: updatedData.idea_id,
      user_id: updatedData.user_id,
      parent_comment_id: updatedData.parent_comment_id,
      content: updatedData.content,
      flagged_for_moderation: updatedData.flagged_for_moderation,
      created_at: updatedData.created_at,
      updated_at: updatedData.updated_at,
      user: {
        display_name: userDisplayName,
        email: userEmail,
      },
    };
    
    console.log('🟢 BACKEND: Final update response:', JSON.stringify(response, null, 2));
    console.log('═══════════════════════════════════════════════════════════\n');

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

    if (!supabaseAdmin) {
      throw new Error('Database connection not available');
    }

    // Verify the comment exists and check ownership
    const { data: existingComment, error: fetchError } = await supabaseAdmin
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
    const { data: allComments, error: countError } = await supabaseAdmin
      .from('comments')
      .select('id')
      .or(`id.eq.${commentId},parent_comment_id.eq.${commentId}`);

    const deleteCount = allComments?.length || 1;

    if (countError) {
      console.error('Error counting comments for deletion:', countError);
    }

    // Delete the comment (CASCADE should handle nested replies)
    // Use supabaseAdmin to bypass RLS
    const { error: deleteError } = await supabaseAdmin.from('comments').delete().eq('id', commentId);

    if (deleteError) {
      console.error('Error deleting comment:', deleteError);
      throw new Error('Failed to delete comment');
    }

    // Decrement comment count on the ideas table
    const { error: updateError } = await supabaseAdmin.rpc('decrement_comment_count', {
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

    if (!supabaseAdmin) {
      throw new Error('Database connection not available');
    }

    // Verify the comment exists
    const { data: existingComment, error: fetchError } = await supabaseAdmin
      .from('comments')
      .select('id, flagged_for_moderation')
      .eq('id', commentId)
      .single();

    if (fetchError || !existingComment) {
      throw notFound('Comment not found');
    }

    // Flag the comment for moderation (use supabaseAdmin to bypass RLS)
    const { error: flagError } = await supabaseAdmin
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
