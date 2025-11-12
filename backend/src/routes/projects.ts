import express, { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * Validation middleware for URL format
 */
const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * POST /api/projects
 * Submit a new project link
 * Requires authentication
 */
router.post(
  '/',
  authenticate,
  [
    body('idea_id').isUUID().withMessage('Invalid idea ID'),
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 255 })
      .withMessage('Title must not exceed 255 characters'),
    body('url')
      .trim()
      .notEmpty()
      .withMessage('URL is required')
      .custom(isValidUrl)
      .withMessage('Invalid URL format'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description must not exceed 2000 characters'),
    body('tools_used')
      .optional()
      .isArray()
      .withMessage('tools_used must be an array')
      .custom((value: unknown[]) => {
        if (!Array.isArray(value)) return false;
        return value.every((item) => typeof item === 'string');
      })
      .withMessage('tools_used must be an array of strings'),
  ],
  async (req: Request, res: Response) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation Error', errors: errors.array() });
      }

      const { idea_id, title, url, description, tools_used } = req.body;
      const userId = req.userId;

      // Check if Supabase admin client is available
      if (!supabaseAdmin) {
        console.error('Backend: Supabase admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY.');
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Database connection not available',
        });
      }

      // Verify the idea exists
      const { data: idea, error: ideaError } = await supabaseAdmin
        .from('ideas')
        .select('id, project_count')
        .eq('id', idea_id)
        .single();

      if (ideaError || !idea) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Idea not found',
        });
      }

      // Insert the project link
      const { data: project, error: insertError } = await supabaseAdmin
        .from('project_links')
        .insert({
          idea_id,
          user_id: userId,
          title,
          url,
          description: description || null,
          tools_used: tools_used || [],
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating project link:', insertError);
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to create project link',
        });
      }

      // Increment project_count on the ideas table
      const { error: updateError } = await supabaseAdmin.rpc('increment_project_count', {
        idea_uuid: idea_id,
      });

      // If the RPC doesn't exist, fall back to manual increment
      if (updateError) {
        console.warn('RPC increment_project_count not found, using manual increment');
        const { error: manualUpdateError } = await supabaseAdmin
          .from('ideas')
          .update({ project_count: (idea as any).project_count + 1 })
          .eq('id', idea_id);

        if (manualUpdateError) {
          console.error('Error incrementing project count:', manualUpdateError);
          // Don't fail the request, project was created successfully
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Project link created successfully',
        data: project,
      });
    } catch (error) {
      console.error('Error in POST /projects:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      });
    }
  }
);

/**
 * PATCH /api/projects/:id
 * Update a project link (author only)
 * Requires authentication
 */
router.patch(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid project ID'),
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isLength({ max: 255 })
      .withMessage('Title must not exceed 255 characters'),
    body('url')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('URL cannot be empty')
      .custom(isValidUrl)
      .withMessage('Invalid URL format'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description must not exceed 2000 characters'),
    body('tools_used')
      .optional()
      .isArray()
      .withMessage('tools_used must be an array')
      .custom((value: unknown[]) => {
        if (!Array.isArray(value)) return false;
        return value.every((item) => typeof item === 'string');
      })
      .withMessage('tools_used must be an array of strings'),
  ],
  async (req: Request, res: Response) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation Error', errors: errors.array() });
      }

      const { id } = req.params;
      const userId = req.userId;
      const { title, url, description, tools_used } = req.body;

      // Check if at least one field is provided for update
      if (!title && !url && description === undefined && !tools_used) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'At least one field must be provided for update',
        });
      }

      // Check if Supabase admin client is available
      if (!supabaseAdmin) {
        console.error('Backend: Supabase admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY.');
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Database connection not available',
        });
      }

      // Fetch the existing project to verify ownership
      const { data: existingProject, error: fetchError } = await supabaseAdmin
        .from('project_links')
        .select('user_id')
        .eq('id', id)
        .single();

      if (fetchError || !existingProject) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Project link not found',
        });
      }

      // Verify user is the author
      if (existingProject.user_id !== userId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to update this project link',
        });
      }

      // Build update object with only provided fields
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (title) updateData.title = title;
      if (url) updateData.url = url;
      if (description !== undefined) updateData.description = description;
      if (tools_used) updateData.tools_used = tools_used;

      // Update the project link
      const { data: updatedProject, error: updateError } = await supabaseAdmin
        .from('project_links')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating project link:', updateError);
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to update project link',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Project link updated successfully',
        data: updatedProject,
      });
    } catch (error) {
      console.error('Error in PATCH /projects/:id:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      });
    }
  }
);

/**
 * DELETE /api/projects/:id
 * Delete a project link (author only)
 * Requires authentication
 */
router.delete(
  '/:id',
  authenticate,
  param('id').isUUID().withMessage('Invalid project ID'),
  async (req: Request, res: Response) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation Error', errors: errors.array() });
      }

      const { id } = req.params;
      const userId = req.userId;

      // Check if Supabase admin client is available
      if (!supabaseAdmin) {
        console.error('Backend: Supabase admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY.');
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Database connection not available',
        });
      }

      // Fetch the existing project to verify ownership and get idea_id
      const { data: existingProject, error: fetchError } = await supabaseAdmin
        .from('project_links')
        .select('user_id, idea_id')
        .eq('id', id)
        .single();

      if (fetchError || !existingProject) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Project link not found',
        });
      }

      // Verify user is the author
      if (existingProject.user_id !== userId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to delete this project link',
        });
      }

      // Delete the project link
      const { error: deleteError } = await supabaseAdmin.from('project_links').delete().eq('id', id);

      if (deleteError) {
        console.error('Error deleting project link:', deleteError);
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to delete project link',
        });
      }

      // Decrement project_count on the ideas table
      const { error: updateError } = await supabaseAdmin.rpc('decrement_project_count', {
        idea_uuid: existingProject.idea_id,
      });

      // If the RPC doesn't exist, fall back to manual decrement
      if (updateError) {
        console.warn('RPC decrement_project_count not found, using manual decrement');
        const { data: idea } = await supabaseAdmin
          .from('ideas')
          .select('project_count')
          .eq('id', existingProject.idea_id)
          .single();

        if (idea && idea.project_count > 0) {
          const { error: manualUpdateError } = await supabaseAdmin
            .from('ideas')
            .update({ project_count: idea.project_count - 1 })
            .eq('id', existingProject.idea_id);

          if (manualUpdateError) {
            console.error('Error decrementing project count:', manualUpdateError);
            // Don't fail the request, project was deleted successfully
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Project link deleted successfully',
      });
    } catch (error) {
      console.error('Error in DELETE /projects/:id:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      });
    }
  }
);

/**
 * GET /api/projects/stats
 * Get project count statistics for the campaign dashboard
 * No authentication required (public read)
 */
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      console.error('Backend: Supabase admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY.');
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Database connection not available',
      });
    }

    // Get total project count
    const { count: totalProjects, error: countError } = await supabaseAdmin
      .from('project_links')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting projects:', countError);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch project statistics',
      });
    }

    // Get all projects to analyze tools usage
    const { data: allProjects, error: projectsError } = await supabaseAdmin
      .from('project_links')
      .select('tools_used, idea_id, ideas!project_links_idea_id_fkey(category)');

    if (projectsError) {
      console.error('Error fetching projects for stats:', projectsError);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch project statistics',
      });
    }

    // Count projects per tool
    const toolStats: Record<string, number> = {};
    const categoryStats: Record<string, number> = {};

    allProjects.forEach((project: any) => {
      // Count tools
      if (project.tools_used && Array.isArray(project.tools_used)) {
        project.tools_used.forEach((tool: string) => {
          const normalizedTool = tool.trim();
          toolStats[normalizedTool] = (toolStats[normalizedTool] || 0) + 1;
        });
      }

      // Count categories
      if (project.ideas && project.ideas.category) {
        const category = project.ideas.category;
        categoryStats[category] = (categoryStats[category] || 0) + 1;
      }
    });

    // Extract specific tools for the campaign (Claude, Bolt, Lovable)
    const campaignTools = {
      claude: toolStats['Claude'] || 0,
      bolt: toolStats['Bolt'] || 0,
      lovable: toolStats['Lovable'] || 0,
      other: Object.entries(toolStats)
        .filter(([tool]) => !['Claude', 'Bolt', 'Lovable'].includes(tool))
        .reduce((sum, [, count]) => sum + count, 0),
    };

    return res.status(200).json({
      success: true,
      data: {
        total_projects: totalProjects || 0,
        campaign_goal: 4000,
        progress_percentage: ((totalProjects || 0) / 4000) * 100,
        tools: {
          breakdown: campaignTools,
          all_tools: toolStats,
        },
        categories: categoryStats,
      },
    });
  } catch (error) {
    console.error('Error in GET /projects/stats:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  }
});

export default router;
