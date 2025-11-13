import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Warning: Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env file.'
  );
}

// Client for public/authenticated user operations
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for service role operations (use sparingly and securely)
export const supabaseAdmin: SupabaseClient | null = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

// Log initialization status
if (!supabaseAdmin) {
  console.warn('Warning: Supabase admin client not initialized. SUPABASE_SERVICE_ROLE_KEY is missing.');
} else {
  console.log('Supabase admin client initialized successfully.');
}

export default supabase;
