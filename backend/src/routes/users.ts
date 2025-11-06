import express, { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import supabase from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/users/:id/profile
 * Get public user profile information
 * No authentication required
 */
router.get(
  '/:id/profile',
  [
    // Validate UUID format
    param('id').isUUID().withMessage('Invalid user ID format'),
  ],
  async (req: Request, res: Response) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation Error',
          details: errors.array(),
        });
      }

      const userId = req.params.id;

      // Query user profile - exclude email for privacy
      const { data: user, error } = await supabase
        .from('users')
        .select('display_name, bio, created_at, tier')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User profile not found',
        });
      }

      // Return public profile
      return res.json({
        profile: user,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch user profile',
      });
    }
  }
);

/**
 * PATCH /api/users/profile
 * Update own user profile
 * Requires authentication
 */
router.patch(
  '/profile',
  authenticate,
  [
    // Validate display_name if provided
    body('display_name')
      .optional()
      .isString()
      .withMessage('Display name must be a string')
      .trim()
      .isLength({ max: 100 })
      .withMessage('Display name must not exceed 100 characters'),

    // Validate bio if provided
    body('bio')
      .optional()
      .isString()
      .withMessage('Bio must be a string')
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio must not exceed 500 characters'),
  ],
  async (req: Request, res: Response) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation Error',
          details: errors.array(),
        });
      }

      const userId = req.userId!; // Guaranteed by authenticate middleware
      const { display_name, bio } = req.body;

      // Check if at least one field is being updated
      if (display_name === undefined && bio === undefined) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'At least one field (display_name or bio) must be provided',
        });
      }

      // Build update object with only provided fields
      const updates: { display_name?: string; bio?: string } = {};
      if (display_name !== undefined) updates.display_name = display_name;
      if (bio !== undefined) updates.bio = bio;

      // Update user profile
      // Note: updated_at is automatically updated by database trigger
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select('id, email, display_name, bio, tier, created_at, updated_at')
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to update user profile',
        });
      }

      // Return updated profile
      return res.json({
        message: 'Profile updated successfully',
        profile: updatedUser,
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update user profile',
      });
    }
  }
);

/**
 * GET /api/users/:id/projects
 * Get all projects submitted by a specific user
 * No authentication required
 */
router.get(
  '/:id/projects',
  [
    // Validate UUID format
    param('id').isUUID().withMessage('Invalid user ID format'),
  ],
  async (req: Request, res: Response) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation Error',
          details: errors.array(),
        });
      }

      const userId = req.params.id;

      // Query project_links with idea title via join
      const { data: projects, error } = await supabase
        .from('project_links')
        .select(
          `
          id,
          title,
          url,
          description,
          tools_used,
          created_at,
          updated_at,
          idea_id,
          ideas (
            id,
            title
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user projects:', error);
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to fetch user projects',
        });
      }

      // Format response to include idea_title at top level
      const formattedProjects = (projects || []).map((project: any) => ({
        id: project.id,
        title: project.title,
        url: project.url,
        description: project.description,
        tools_used: project.tools_used,
        created_at: project.created_at,
        updated_at: project.updated_at,
        idea_id: project.idea_id,
        idea_title: project.ideas?.title || null,
      }));

      return res.json({
        projects: formattedProjects,
        count: formattedProjects.length,
      });
    } catch (error) {
      console.error('Error fetching user projects:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch user projects',
      });
    }
  }
);

/**
 * GET /api/users/:id/comments
 * Get all comments by a specific user
 * No authentication required
 * Excludes flagged comments
 */
router.get(
  '/:id/comments',
  [
    // Validate UUID format
    param('id').isUUID().withMessage('Invalid user ID format'),
  ],
  async (req: Request, res: Response) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation Error',
          details: errors.array(),
        });
      }

      const userId = req.params.id;

      // Query comments with idea title via join
      // Exclude flagged comments for moderation
      const { data: comments, error } = await supabase
        .from('comments')
        .select(
          `
          id,
          content,
          parent_comment_id,
          created_at,
          updated_at,
          idea_id,
          ideas (
            id,
            title
          )
        `
        )
        .eq('user_id', userId)
        .eq('flagged_for_moderation', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user comments:', error);
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to fetch user comments',
        });
      }

      // Format response to include idea_title at top level
      const formattedComments = (comments || []).map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        parent_comment_id: comment.parent_comment_id,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        idea_id: comment.idea_id,
        idea_title: comment.ideas?.title || null,
      }));

      return res.json({
        comments: formattedComments,
        count: formattedComments.length,
      });
    } catch (error) {
      console.error('Error fetching user comments:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch user comments',
      });
    }
  }
);

export default router;
