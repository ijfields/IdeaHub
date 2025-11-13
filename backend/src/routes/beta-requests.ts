import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

/**
 * POST /api/beta-requests
 * Submit a beta access request
 * No authentication required (public endpoint)
 */
router.post(
  '/',
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    body('referral_source')
      .trim()
      .notEmpty()
      .withMessage('Referral source is required')
      .isLength({ max: 255 })
      .withMessage('Referral source too long'),
    body('message')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Message must not exceed 2000 characters'),
  ],
  async (req: Request, res: Response) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation Error',
          message: errors.array()[0].msg,
          errors: errors.array(),
        });
      }

      const { email, referral_source, message } = req.body;

      // Check if Supabase admin client is available
      if (!supabaseAdmin) {
        console.error('Backend: Supabase admin client not initialized.');
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Database connection not available',
        });
      }

      // Check if email already requested (prevent duplicates)
      const { data: existing, error: checkError } = await supabaseAdmin
        .from('beta_requests')
        .select('id, email, status')
        .eq('email', email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is fine
        console.error('Error checking existing request:', checkError);
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to process request',
        });
      }

      // If request already exists
      if (existing) {
        if (existing.status === 'pending') {
          return res.status(200).json({
            success: true,
            message: 'Your request is already pending review',
            data: { status: 'pending' },
          });
        } else if (existing.status === 'approved') {
          return res.status(200).json({
            success: true,
            message: 'You already have beta access! Check your email for the password.',
            data: { status: 'approved' },
          });
        } else if (existing.status === 'rejected') {
          // Allow rejected users to resubmit
          const { data: updated, error: updateError } = await supabaseAdmin
            .from('beta_requests')
            .update({
              referral_source,
              message: message || null,
              status: 'pending',
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating request:', updateError);
            return res.status(500).json({
              error: 'Internal Server Error',
              message: 'Failed to update request',
            });
          }

          return res.status(200).json({
            success: true,
            message: 'Request resubmitted successfully',
            data: updated,
          });
        }
      }

      // Create new beta request
      const { data: newRequest, error: insertError } = await supabaseAdmin
        .from('beta_requests')
        .insert({
          email,
          referral_source,
          message: message || null,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating beta request:', insertError);
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to submit request',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Beta access request submitted successfully',
        data: newRequest,
      });
    } catch (error) {
      console.error('Error in POST /beta-requests:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      });
    }
  }
);

/**
 * GET /api/beta-requests
 * Get all beta requests (admin only)
 * Requires authentication
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    // TODO: Add authentication and admin check
    // For now, this endpoint is open (you can restrict it later)

    if (!supabaseAdmin) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Database connection not available',
      });
    }

    const { data: requests, error } = await supabaseAdmin
      .from('beta_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching beta requests:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch requests',
      });
    }

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error('Error in GET /beta-requests:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  }
});

export default router;
