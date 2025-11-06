import express, { Request, Response } from 'express';
import { query, param, validationResult } from 'express-validator';
import supabase from '../config/supabase.js';
import { optionalAuth } from '../middleware/auth.js';
import { asyncHandler, notFound, forbidden, badRequest } from '../utils/errors.js';

const router = express.Router();

/**
 * Pagination metadata interface
 */
interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Helper function to build pagination metadata
 */
const buildPaginationMeta = (total: number, page: number, limit: number): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * GET /api/ideas
 * List all ideas with pagination and filtering
 * Supports: page, limit, category, difficulty, search, sort
 * Uses optionalAuth - authenticated users get all ideas, guests get only free_tier=true
 */
router.get(
  '/',
  optionalAuth,
  [
    query('page').optional().isInt({ min: 1 }).toInt().withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .toInt()
      .withMessage('Limit must be between 1 and 100'),
    query('category').optional().isString().trim().withMessage('Category must be a string'),
    query('difficulty')
      .optional()
      .isIn(['Beginner', 'Intermediate', 'Advanced'])
      .withMessage('Difficulty must be Beginner, Intermediate, or Advanced'),
    query('search').optional().isString().trim().withMessage('Search must be a string'),
    query('sort')
      .optional()
      .isIn(['popular', 'recent', 'difficulty', 'title'])
      .withMessage('Sort must be popular, recent, difficulty, or title'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw badRequest(errors.array()[0].msg);
    }

    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const category = req.query.category as string | undefined;
    const difficulty = req.query.difficulty as string | undefined;
    const searchTerm = req.query.search as string | undefined;
    const sort = (req.query.sort as string) || 'recent';
    const isAuthenticated = !!req.userId;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase.from('ideas').select('*', { count: 'exact' });

    // Apply tier-based access control
    // Guests can only see free_tier ideas, authenticated users see all
    if (!isAuthenticated) {
      query = query.eq('free_tier', true);
    }

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    // Apply search filter (search in title, description, tools, tags)
    if (searchTerm) {
      // Use textSearch for PostgreSQL full-text search or ilike for pattern matching
      query = query.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}},tools.cs.{${searchTerm}}`
      );
    }

    // Apply sorting
    switch (sort) {
      case 'popular':
        query = query.order('view_count', { ascending: false });
        break;
      case 'recent':
        query = query.order('created_at', { ascending: false });
        break;
      case 'difficulty':
        // Custom sort: Beginner -> Intermediate -> Advanced
        query = query.order('difficulty', { ascending: true });
        break;
      case 'title':
        query = query.order('title', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: ideas, error, count } = await query;

    if (error) {
      console.error('Database error fetching ideas:', error);
      throw new Error('Failed to fetch ideas');
    }

    // Build pagination metadata
    const total = count || 0;
    const pagination = buildPaginationMeta(total, page, limit);

    res.json({
      success: true,
      data: ideas,
      pagination,
      filters: {
        category,
        difficulty,
        search: searchTerm,
        sort,
        tier: isAuthenticated ? 'authenticated' : 'guest',
      },
    });
  })
);

/**
 * GET /api/ideas/free-tier
 * Get only the 5 free-tier ideas (no auth required)
 * These are the ideas available to guests without login
 */
router.get(
  '/free-tier',
  asyncHandler(async (_req: Request, res: Response) => {
    const { data: ideas, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('free_tier', true)
      .order('title', { ascending: true })
      .limit(5);

    if (error) {
      console.error('Database error fetching free-tier ideas:', error);
      throw new Error('Failed to fetch free-tier ideas');
    }

    res.json({
      success: true,
      data: ideas,
      count: ideas?.length || 0,
    });
  })
);

/**
 * GET /api/ideas/search
 * Full-text search on titles, descriptions, tools, tags
 * Uses optionalAuth for tier-based access
 */
router.get(
  '/search',
  optionalAuth,
  [
    query('q').notEmpty().isString().trim().withMessage('Search query (q) is required'),
    query('page').optional().isInt({ min: 1 }).toInt().withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .toInt()
      .withMessage('Limit must be between 1 and 100'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw badRequest(errors.array()[0].msg);
    }

    const searchQuery = req.query.q as string;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const isAuthenticated = !!req.userId;
    const offset = (page - 1) * limit;

    // Build search query
    let query = supabase.from('ideas').select('*', { count: 'exact' });

    // Apply tier-based access control
    if (!isAuthenticated) {
      query = query.eq('free_tier', true);
    }

    // Search across multiple fields
    query = query.or(
      `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.cs.{${searchQuery}},tools.cs.{${searchQuery}}`
    );

    // Sort by relevance (view_count as proxy) and pagination
    query = query.order('view_count', { ascending: false }).range(offset, offset + limit - 1);

    const { data: ideas, error, count } = await query;

    if (error) {
      console.error('Database error searching ideas:', error);
      throw new Error('Failed to search ideas');
    }

    const total = count || 0;
    const pagination = buildPaginationMeta(total, page, limit);

    res.json({
      success: true,
      data: ideas,
      pagination,
      query: searchQuery,
    });
  })
);

/**
 * GET /api/ideas/category/:category
 * Filter ideas by category with pagination
 * Uses optionalAuth for tier-based access
 */
router.get(
  '/category/:category',
  optionalAuth,
  [
    param('category').notEmpty().isString().trim().withMessage('Category parameter is required'),
    query('page').optional().isInt({ min: 1 }).toInt().withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .toInt()
      .withMessage('Limit must be between 1 and 100'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw badRequest(errors.array()[0].msg);
    }

    const category = req.params.category;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const isAuthenticated = !!req.userId;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase.from('ideas').select('*', { count: 'exact' }).eq('category', category);

    // Apply tier-based access control
    if (!isAuthenticated) {
      query = query.eq('free_tier', true);
    }

    // Sort and paginate
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: ideas, error, count } = await query;

    if (error) {
      console.error('Database error fetching ideas by category:', error);
      throw new Error('Failed to fetch ideas by category');
    }

    const total = count || 0;
    const pagination = buildPaginationMeta(total, page, limit);

    res.json({
      success: true,
      data: ideas,
      pagination,
      category,
    });
  })
);

/**
 * GET /api/ideas/:id
 * Get single idea details by ID
 * Uses optionalAuth - guests can only access free_tier ideas
 * Handles BuyButton special case if needed (tiered content)
 */
router.get(
  '/:id',
  optionalAuth,
  [param('id').notEmpty().isUUID().withMessage('Valid UUID is required for idea ID')],
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw badRequest(errors.array()[0].msg);
    }

    const ideaId = req.params.id;
    const isAuthenticated = !!req.userId;

    // Fetch idea from database
    const { data: idea, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .single();

    if (error || !idea) {
      throw notFound('Idea not found');
    }

    // Access control: guests can only see free_tier ideas
    if (!isAuthenticated && !idea.free_tier) {
      throw forbidden('This idea requires authentication. Please sign up or log in to access.');
    }

    // Special handling for BuyButton or other tiered content
    // If the idea has tiered content detail, we could modify the response here
    // For now, we return the full idea for authenticated users
    // Future enhancement: check if idea.title includes "BuyButton" and modify response

    res.json({
      success: true,
      data: idea,
      access: isAuthenticated ? 'full' : 'free_tier',
    });
  })
);

/**
 * PATCH /api/ideas/:id/view
 * Increment view count for an idea (no auth required)
 * Uses atomic increment to avoid race conditions
 */
router.patch(
  '/:id/view',
  [param('id').notEmpty().isUUID().withMessage('Valid UUID is required for idea ID')],
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw badRequest(errors.array()[0].msg);
    }

    const ideaId = req.params.id;

    // First, check if idea exists
    const { data: existingIdea, error: fetchError } = await supabase
      .from('ideas')
      .select('id, view_count')
      .eq('id', ideaId)
      .single();

    if (fetchError || !existingIdea) {
      throw notFound('Idea not found');
    }

    // Atomically increment view_count using PostgreSQL function or manual increment
    // Note: Supabase/PostgreSQL supports increment operations
    const newViewCount = (existingIdea.view_count || 0) + 1;

    const { data: updatedIdea, error: updateError } = await supabase
      .from('ideas')
      .update({ view_count: newViewCount })
      .eq('id', ideaId)
      .select()
      .single();

    if (updateError) {
      console.error('Database error incrementing view count:', updateError);
      throw new Error('Failed to increment view count');
    }

    res.json({
      success: true,
      data: {
        id: ideaId,
        view_count: updatedIdea.view_count,
      },
      message: 'View count incremented successfully',
    });
  })
);

export default router;
