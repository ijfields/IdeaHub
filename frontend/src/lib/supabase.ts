/**
 * Supabase client configuration for AI Ideas Hub
 *
 * This module exports a configured Supabase client instance that can be
 * used throughout the application for database operations, authentication,
 * and real-time subscriptions.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Retrieve environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error(
    'Missing VITE_SUPABASE_URL environment variable. Please check your .env file.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_ANON_KEY environment variable. Please check your .env file.'
  );
}

/**
 * Configured Supabase client instance
 *
 * This client is typed with the Database schema for full TypeScript support.
 * The anonymous key is safe to expose in client-side code as it respects
 * Row Level Security (RLS) policies configured in Supabase.
 *
 * @example
 * ```typescript
 * import { supabase } from '@/lib/supabase';
 *
 * // Query ideas
 * const { data, error } = await supabase
 *   .from('ideas')
 *   .select('*')
 *   .eq('free_tier', true);
 * ```
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Store session in localStorage for persistence across page reloads
    storage: window.localStorage,
    // Automatically refresh tokens before they expire
    autoRefreshToken: true,
    // Persist session to localStorage
    persistSession: true,
    // Detect session from URL (useful for email confirmation links)
    detectSessionInUrl: true,
  },
});
