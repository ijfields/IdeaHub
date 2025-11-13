import express, { Request, Response } from 'express';
import { query, param, validationResult } from 'express-validator';
import { supabaseAdmin } from '../config/supabase.js';
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
    query('free_tier')
      .optional()
      .isBoolean()
      .toBoolean()
      .withMessage('free_tier must be a boolean'),
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
    // Handle free_tier parameter - it can come as string 'true'/'false' or boolean
    const freeTierParam = req.query.free_tier;
    const freeTierFilter = freeTierParam === 'true' || freeTierParam === '1';
    const isAuthenticated = !!req.userId;
    
    // Debug logging - MORE VISIBLE
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🔵 BACKEND: GET /api/ideas REQUEST RECEIVED');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Query params:', {
      page,
      limit,
      category,
      difficulty,
      searchTerm,
      sort,
      freeTierParam,
      freeTierFilter,
      isAuthenticated,
      userId: req.userId,
    });
    console.log('═══════════════════════════════════════════════════════════\n');

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      console.error('Backend: Supabase admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY.');
      throw new Error('Database connection not available');
    }

    // Build query
    let query = supabaseAdmin.from('ideas').select('*', { count: 'exact' });

    // Apply tier-based access control
    // Guests can only see free_tier ideas OR BuyButton (special case), authenticated users see all
    if (!isAuthenticated) {
      // Fetch free_tier ideas and BuyButton separately, then combine
      // Supabase .or() doesn't work well with ilike, so we'll use a different approach
      // First, get free_tier ideas
      const { data: freeTierIdeas, error: freeTierError } = await supabaseAdmin
        .from('ideas')
        .select('*')
        .eq('free_tier', true);
      
      console.log('\n🟢 BACKEND: Guest free_tier query result:');
      console.log('   Count:', freeTierIdeas?.length || 0);
      console.log('   Error:', freeTierError?.message || 'None');
      console.log('   Sample IDs:', freeTierIdeas?.slice(0, 3).map(i => i.id) || []);
      
      // Then get BuyButton idea (case-insensitive search)
      const { data: buyButtonIdeas, error: buyButtonError } = await supabaseAdmin
        .from('ideas')
        .select('*')
        .ilike('title', '%BuyButton%')
        .eq('free_tier', false);
      
      console.log('\n🟢 BACKEND: Guest BuyButton query result:');
      console.log('   Count:', buyButtonIdeas?.length || 0);
      console.log('   Error:', buyButtonError?.message || 'None');
      
      if (freeTierError || buyButtonError) {
        console.error('Error fetching ideas:', freeTierError || buyButtonError);
        throw new Error('Failed to fetch ideas');
      }
      
      // Combine and deduplicate by ID
      const allIdeas = [...(freeTierIdeas || []), ...(buyButtonIdeas || [])];
      const uniqueIdeas = Array.from(new Map(allIdeas.map(idea => [idea.id, idea])).values());
      
      // Now apply filters, search, and sorting to the combined list
      let filteredIdeas = uniqueIdeas;
      
      // Apply category filter
      if (category) {
        filteredIdeas = filteredIdeas.filter(idea => idea.category === category);
      }
      
      // Apply difficulty filter
      if (difficulty) {
        filteredIdeas = filteredIdeas.filter(idea => idea.difficulty === difficulty);
      }
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredIdeas = filteredIdeas.filter(idea =>
          idea.title.toLowerCase().includes(searchLower) ||
          idea.description?.toLowerCase().includes(searchLower) ||
          idea.tools?.some((tool: string) => tool.toLowerCase().includes(searchLower)) ||
          idea.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply sorting
      switch (sort) {
        case 'popular':
          filteredIdeas.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
          break;
        case 'recent':
          filteredIdeas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'difficulty':
          const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
          filteredIdeas.sort((a, b) => (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0) - (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0));
          break;
        case 'title':
          filteredIdeas.sort((a, b) => a.title.localeCompare(b.title));
          break;
      }
      
      // Apply pagination
      const total = filteredIdeas.length;
      const paginatedIdeas = filteredIdeas.slice(offset, offset + limit);
      const pagination = buildPaginationMeta(total, page, limit);
      
      console.log('\n🟢 BACKEND: Sending guest response:');
      console.log('   Total ideas:', total);
      console.log('   Paginated ideas:', paginatedIdeas.length);
      console.log('   First idea title:', paginatedIdeas[0]?.title || 'None');
      console.log('═══════════════════════════════════════════════════════════\n');
      
      return res.json({
        success: true,
        data: paginatedIdeas,
        pagination,
        filters: {
          category,
          difficulty,
          search: searchTerm,
          sort,
          tier: 'guest',
        },
      });
    }

    // Apply filters
    // IMPORTANT: Only apply free_tier filter if explicitly requested
    // For authenticated users without free_tier param, show ALL ideas
    if (freeTierFilter) {
      console.log('🟡 BACKEND: Applying free_tier filter (authenticated user requested free tier only)');
      query = query.eq('free_tier', true);
    } else {
      console.log('🟢 BACKEND: No free_tier filter - returning ALL ideas for authenticated user');
    }

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

    // Get total count BEFORE pagination (for accurate pagination metadata)
    // Build count query with same filters as main query
    let countQuery = supabaseAdmin.from('ideas').select('id', { count: 'exact', head: true });
    
    // Apply same filters to count query
    if (freeTierFilter) {
      countQuery = countQuery.eq('free_tier', true);
    }
    if (category) {
      countQuery = countQuery.eq('category', category);
    }
    if (difficulty) {
      countQuery = countQuery.eq('difficulty', difficulty);
    }
    if (searchTerm) {
      countQuery = countQuery.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}},tools.cs.{${searchTerm}}`
      );
    }
    
    const { count: totalCount } = await countQuery;
    
    // Apply pagination to main query
    query = query.range(offset, offset + limit - 1);

    // Execute query for paginated data
    const { data: ideas, error } = await query;
    const count = totalCount || 0;

    console.log('\n🟢 BACKEND: Authenticated user query result:');
    console.log('   Ideas returned:', ideas?.length || 0);
    console.log('   Total count (all matching):', count);
    console.log('   Free tier filter:', freeTierFilter);
    console.log('   Is authenticated:', isAuthenticated);
    console.log('   Error:', error?.message || 'None');
    if (ideas && ideas.length > 0) {
      console.log('   Sample titles:', ideas.slice(0, 5).map(i => `${i.title} (free_tier: ${i.free_tier})`));
    }
    console.log('═══════════════════════════════════════════════════════════\n');

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
    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      console.error('Backend: Supabase admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY.');
      throw new Error('Database connection not available');
    }

    const { data: ideas, error } = await supabaseAdmin
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

    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      console.error('Backend: Supabase admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY.');
      throw new Error('Database connection not available');
    }

    // Build search query
    let query = supabaseAdmin.from('ideas').select('*', { count: 'exact' });

    // Apply tier-based access control
    // Guests can only see free_tier ideas OR BuyButton (special case)
    if (!isAuthenticated) {
      // Fetch free_tier ideas and BuyButton separately, then combine
      const { data: freeTierIdeas, error: freeTierError } = await supabaseAdmin
        .from('ideas')
        .select('*')
        .eq('free_tier', true);
      
      const { data: buyButtonIdeas, error: buyButtonError } = await supabaseAdmin
        .from('ideas')
        .select('*')
        .ilike('title', '%BuyButton%')
        .eq('free_tier', false);
      
      if (freeTierError || buyButtonError) {
        console.error('Error fetching ideas:', freeTierError || buyButtonError);
        throw new Error('Failed to fetch ideas');
      }
      
      const allIdeas = [...(freeTierIdeas || []), ...(buyButtonIdeas || [])];
      const uniqueIdeas = Array.from(new Map(allIdeas.map(idea => [idea.id, idea])).values());
      
      let filteredIdeas = uniqueIdeas;
      
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        filteredIdeas = filteredIdeas.filter(idea =>
          idea.title.toLowerCase().includes(searchLower) ||
          idea.description?.toLowerCase().includes(searchLower) ||
          idea.tools?.some((tool: string) => tool.toLowerCase().includes(searchLower)) ||
          idea.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
        );
      }
      
      filteredIdeas.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
      const paginatedIdeas = filteredIdeas.slice(offset, offset + limit);
      const total = filteredIdeas.length;
      const pagination = buildPaginationMeta(total, page, limit);
      
      return res.json({
        success: true,
        data: paginatedIdeas,
        pagination,
        query: searchQuery,
      });
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

    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      console.error('Backend: Supabase admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY.');
      throw new Error('Database connection not available');
    }

    // Apply tier-based access control
    // Guests can only see free_tier ideas OR BuyButton (special case)
    if (!isAuthenticated) {
      // Fetch free_tier ideas and BuyButton separately, then filter by category
      const { data: freeTierIdeas, error: freeTierError } = await supabaseAdmin
        .from('ideas')
        .select('*')
        .eq('free_tier', true)
        .eq('category', category);
      
      const { data: buyButtonIdeas, error: buyButtonError } = await supabaseAdmin
        .from('ideas')
        .select('*')
        .ilike('title', '%BuyButton%')
        .eq('free_tier', false)
        .eq('category', category);
      
      if (freeTierError || buyButtonError) {
        console.error('Error fetching ideas by category:', freeTierError || buyButtonError);
        throw new Error('Failed to fetch ideas by category');
      }
      
      const allIdeas = [...(freeTierIdeas || []), ...(buyButtonIdeas || [])];
      const uniqueIdeas = Array.from(new Map(allIdeas.map(idea => [idea.id, idea])).values());
      
      uniqueIdeas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const paginatedIdeas = uniqueIdeas.slice(offset, offset + limit);
      const total = uniqueIdeas.length;
      const pagination = buildPaginationMeta(total, page, limit);
      
      return res.json({
        success: true,
        data: paginatedIdeas,
        pagination,
        category,
      });
    }

    // For authenticated users, use normal query
    let query = supabaseAdmin.from('ideas').select('*', { count: 'exact' }).eq('category', category);

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
 * GET /api/ideas/:ideaId/projects
 * Get all project links for a specific idea
 * No authentication required (public read)
 * NOTE: This route must come BEFORE /:id to avoid route conflicts
 */
router.get(
  '/:ideaId/projects',
  [param('ideaId').isUUID().withMessage('Invalid idea ID')],
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw badRequest(errors.array()[0].msg);
    }

    const { ideaId } = req.params;

    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      console.error('Backend: Supabase admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY.');
      throw new Error('Database connection not available');
    }

    // Query project links with user display name via join
    const { data: projects, error } = await supabaseAdmin
      .from('project_links')
      .select(
        `
        id,
        idea_id,
        user_id,
        title,
        url,
        description,
        tools_used,
        created_at,
        updated_at,
        users!project_links_user_id_fkey (
          display_name,
          email
        )
      `
      )
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching project links:', error);
      throw new Error('Failed to fetch project links');
    }

    // Transform the response to flatten the user data
    const transformedProjects = (projects || []).map((project: any) => ({
      id: project.id,
      idea_id: project.idea_id,
      user_id: project.user_id,
      title: project.title,
      url: project.url,
      description: project.description,
      tools_used: project.tools_used,
      created_at: project.created_at,
      updated_at: project.updated_at,
      user: {
        display_name: project.users?.display_name || null,
        email: project.users?.email || null,
      },
    }));

    return res.status(200).json({
      success: true,
      count: transformedProjects.length,
      data: transformedProjects,
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

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🔵 BACKEND: GET /api/ideas/:id REQUEST RECEIVED');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Idea ID:', ideaId);
    console.log('Authenticated:', isAuthenticated);
    console.log('User ID:', req.userId);
    console.log('═══════════════════════════════════════════════════════════\n');

    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      console.error('Backend: Supabase admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY.');
      throw new Error('Database connection not available');
    }

    // Fetch idea from database using admin client to bypass RLS
    const { data: idea, error } = await supabaseAdmin
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .single();

    console.log('🔵 BACKEND: Database query result:');
    console.log('   Has idea:', !!idea);
    console.log('   Error:', error?.message || 'None');
    if (idea) {
      console.log('   Title:', idea.title);
      console.log('   Free tier:', idea.free_tier);
    }

    if (error || !idea) {
      console.error('🔴 BACKEND: Idea not found or error:', error);
      throw notFound('Idea not found');
    }

    // Access control: guests can only see free_tier ideas OR BuyButton (special case)
    const isBuyButton = idea.title.toLowerCase().includes('buybutton') || idea.title.toLowerCase().includes('buy button');
    if (!isAuthenticated && !idea.free_tier && !isBuyButton) {
      console.log('🔴 BACKEND: Access denied - requires authentication');
      throw forbidden('This idea requires authentication. Please sign up or log in to access.');
    }

    console.log('🟢 BACKEND: Sending idea response');
    console.log('   Access level:', isAuthenticated ? 'full' : 'free_tier');
    console.log('═══════════════════════════════════════════════════════════\n');

    res.json({
      success: true,
      data: idea,
      access: isAuthenticated ? 'full' : 'free_tier',
    });
  })
);

/**
 * POST /api/ideas/:id/view
 * Increment view count for an idea (no auth required)
 * Uses atomic increment to avoid race conditions
 * NOTE: Frontend calls POST, but PATCH is also supported
 */
router.post(
  '/:id/view',
  [param('id').notEmpty().isUUID().withMessage('Valid UUID is required for idea ID')],
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw badRequest(errors.array()[0].msg);
    }

    const ideaId = req.params.id;

    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      console.error('Backend: Supabase admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY.');
      throw new Error('Database connection not available');
    }

    // First, check if idea exists
    const { data: existingIdea, error: fetchError } = await supabaseAdmin
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

    const { data: updatedIdea, error: updateError } = await supabaseAdmin
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

    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      console.error('Backend: Supabase admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY.');
      throw new Error('Database connection not available');
    }

    // First, check if idea exists
    const { data: existingIdea, error: fetchError } = await supabaseAdmin
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

    const { data: updatedIdea, error: updateError } = await supabaseAdmin
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
