/**
 * Database type definitions for AI Ideas Hub
 *
 * These interfaces mirror the Supabase database schema and provide
 * type safety for frontend data operations.
 */

/**
 * User account information
 * Extends Supabase Auth user with custom profile fields
 */
export interface User {
  id: string;
  email: string;
  display_name: string | null;
  bio: string | null;
  tier: 'free' | 'premium';
  created_at: string;
  updated_at: string;
}

/**
 * Difficulty level for ideas
 */
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

/**
 * AI project idea with all metadata
 */
export interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: DifficultyLevel;
  tools: string[];
  tags: string[];
  monetization_potential: string | null;
  estimated_build_time: string | null;
  free_tier: boolean;
  view_count: number;
  comment_count: number;
  project_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * User comment on an idea
 * Supports nested comments via parent_comment_id
 */
export interface Comment {
  id: string;
  idea_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  flagged_for_moderation: boolean;
  created_at: string;
  updated_at: string;
  // Joined user data (not in database, populated via JOIN)
  user?: {
    display_name: string | null;
    email: string;
  };
  // Nested replies (populated by application logic)
  replies?: Comment[];
}

/**
 * User-submitted project implementation link
 * Tracks completed projects for campaign metrics
 */
export interface ProjectLink {
  id: string;
  idea_id: string;
  user_id: string;
  title: string;
  url: string;
  description: string | null;
  tools_used: string[];
  created_at: string;
  updated_at: string;
  // Joined user data (not in database, populated via JOIN)
  user?: {
    display_name: string | null;
    email: string;
  };
}

/**
 * Page view tracking for analytics
 */
export interface PageView {
  id: string;
  user_id: string | null;
  page: string;
  idea_id: string | null;
  timestamp: string;
}

/**
 * Campaign and platform metrics
 */
export interface Metric {
  id: string;
  metric_key: string;
  metric_value: number;
  date: string;
  timestamp: string;
}

/**
 * Helper type for database operations
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Database schema for Supabase client typing
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at' | 'updated_at'> & { id: string };
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      ideas: {
        Row: Idea;
        Insert: Omit<Idea, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'comment_count' | 'project_count'>;
        Update: Partial<Omit<Idea, 'id' | 'created_at' | 'updated_at'>>;
      };
      comments: {
        Row: Comment;
        Insert: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'flagged_for_moderation'>;
        Update: Partial<Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'idea_id'>>;
      };
      project_links: {
        Row: ProjectLink;
        Insert: Omit<ProjectLink, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProjectLink, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'idea_id'>>;
      };
      page_views: {
        Row: PageView;
        Insert: Omit<PageView, 'id' | 'timestamp'>;
        Update: never;
      };
      metrics: {
        Row: Metric;
        Insert: Omit<Metric, 'id' | 'timestamp'>;
        Update: never;
      };
    };
  };
}
