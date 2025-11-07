/**
 * API Client for AI Ideas Hub
 *
 * This module provides a typed HTTP client for communicating with the backend API.
 * It includes authentication, error handling, and typed request/response functions.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { supabase } from './supabase';
import type {
  Idea,
  Comment,
  ProjectLink,
  User,
  PageView,
} from '../types/database';

/**
 * API response wrapper type
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination parameters for list queries
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Filter parameters for ideas
 */
export interface IdeaFilters extends PaginationParams {
  category?: string;
  difficulty?: string;
  search?: string;
  tools?: string[];
  free_tier?: boolean;
}

/**
 * Configured axios instance with interceptors
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    // Get API URL from environment
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';

    // Create axios instance with base configuration
    this.client = axios.create({
      baseURL: `${apiUrl}/api/${apiVersion}`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor: Add authentication token
    this.client.interceptors.request.use(
      async (config) => {
        try {
          // Only try to get session if Supabase is properly configured
          if (supabase && typeof supabase.auth?.getSession === 'function') {
            const {
              data: { session },
            } = await supabase.auth.getSession();

            // Add auth token to request if available
            if (session?.access_token) {
              config.headers.Authorization = `Bearer ${session.access_token}`;
            }
          }
        } catch (error) {
          // Silently fail - don't block requests if auth fails
          console.warn('Error getting session for API request:', error);
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor: Handle common errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle common HTTP errors
        if (error.response) {
          const status = error.response.status;

          switch (status) {
            case 401:
              console.error('Unauthorized: Please log in');
              // Optionally redirect to login or refresh token
              break;
            case 403:
              console.error('Forbidden: You do not have permission');
              break;
            case 404:
              console.error('Not found: Resource does not exist');
              break;
            case 500:
              console.error('Server error: Please try again later');
              break;
            default:
              console.error(`API error (${status}):`, error.message);
          }
        } else if (error.request) {
          console.error('Network error: Unable to reach server');
        } else {
          console.error('Request error:', error.message);
        }

        return Promise.reject(error);
      }
    );
  }

  // ==========================================
  // IDEAS API
  // ==========================================

  /**
   * Fetch all ideas with optional filtering and pagination
   */
  async getIdeas(params?: IdeaFilters): Promise<ApiResponse<Idea[]>> {
    if (!this.client) {
      console.error('API client error: this.client is undefined', { 
        hasClient: !!this.client,
        clientType: typeof this.client,
        thisType: typeof this,
      });
      throw new Error('API client not initialized');
    }
    const response = await this.client.get<ApiResponse<Idea[]>>('/ideas', {
      params,
    });
    return response.data;
  }

  /**
   * Fetch a single idea by ID
   */
  async getIdeaById(id: string): Promise<ApiResponse<Idea>> {
    const response = await this.client.get<ApiResponse<Idea>>(`/ideas/${id}`);
    return response.data;
  }

  /**
   * Search ideas by query string
   */
  async searchIdeas(query: string, params?: PaginationParams): Promise<ApiResponse<Idea[]>> {
    const response = await this.client.get<ApiResponse<Idea[]>>('/ideas/search', {
      params: { q: query, ...params },
    });
    return response.data;
  }

  /**
   * Increment view count for an idea
   */
  async incrementView(ideaId: string): Promise<ApiResponse<void>> {
    const response = await this.client.post<ApiResponse<void>>(
      `/ideas/${ideaId}/view`
    );
    return response.data;
  }

  // ==========================================
  // COMMENTS API
  // ==========================================

  /**
   * Fetch all comments for a specific idea
   */
  async getComments(ideaId: string): Promise<ApiResponse<Comment[]>> {
    const response = await this.client.get<ApiResponse<Comment[]>>(
      `/ideas/${ideaId}/comments`
    );
    return response.data;
  }

  /**
   * Create a new comment
   */
  async createComment(
    ideaId: string,
    content: string,
    parentCommentId?: string
  ): Promise<ApiResponse<Comment>> {
    const response = await this.client.post<ApiResponse<Comment>>(
      `/ideas/${ideaId}/comments`,
      {
        content,
        parent_comment_id: parentCommentId,
      }
    );
    return response.data;
  }

  /**
   * Update an existing comment
   */
  async updateComment(
    commentId: string,
    content: string
  ): Promise<ApiResponse<Comment>> {
    const response = await this.client.put<ApiResponse<Comment>>(
      `/comments/${commentId}`,
      { content }
    );
    return response.data;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete<ApiResponse<void>>(
      `/comments/${commentId}`
    );
    return response.data;
  }

  // ==========================================
  // PROJECT LINKS API
  // ==========================================

  /**
   * Fetch all project links for a specific idea
   */
  async getProjects(ideaId: string): Promise<ApiResponse<ProjectLink[]>> {
    const response = await this.client.get<ApiResponse<ProjectLink[]>>(
      `/ideas/${ideaId}/projects`
    );
    return response.data;
  }

  /**
   * Create a new project link
   */
  async createProject(
    ideaId: string,
    data: {
      title: string;
      url: string;
      description?: string;
      tools_used: string[];
    }
  ): Promise<ApiResponse<ProjectLink>> {
    const response = await this.client.post<ApiResponse<ProjectLink>>(
      `/ideas/${ideaId}/projects`,
      data
    );
    return response.data;
  }

  /**
   * Update an existing project link
   */
  async updateProject(
    projectId: string,
    data: {
      title?: string;
      url?: string;
      description?: string;
      tools_used?: string[];
    }
  ): Promise<ApiResponse<ProjectLink>> {
    const response = await this.client.put<ApiResponse<ProjectLink>>(
      `/projects/${projectId}`,
      data
    );
    return response.data;
  }

  /**
   * Delete a project link
   */
  async deleteProject(projectId: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete<ApiResponse<void>>(
      `/projects/${projectId}`
    );
    return response.data;
  }

  // ==========================================
  // USER PROFILE API
  // ==========================================

  /**
   * Fetch current user's profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.client.get<ApiResponse<User>>('/users/profile');
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: {
    display_name?: string;
    bio?: string;
  }): Promise<ApiResponse<User>> {
    const response = await this.client.put<ApiResponse<User>>(
      '/users/profile',
      data
    );
    return response.data;
  }

  // ==========================================
  // ANALYTICS API
  // ==========================================

  /**
   * Track a page view
   */
  async trackPageView(
    page: string,
    ideaId?: string
  ): Promise<ApiResponse<PageView>> {
    const response = await this.client.post<ApiResponse<PageView>>(
      '/analytics/pageview',
      {
        page,
        idea_id: ideaId,
      }
    );
    return response.data;
  }

  /**
   * Get metrics for the dashboard
   */
  async getMetrics(): Promise<
    ApiResponse<{
      totalProjects: number;
      totalComments: number;
      totalUsers: number;
      totalViews: number;
    }>
  > {
    const response = await this.client.get<
      ApiResponse<{
        totalProjects: number;
        totalComments: number;
        totalUsers: number;
        totalViews: number;
      }>
    >('/analytics/metrics');
    return response.data;
  }
}

// Export a singleton instance
const apiClientInstance = new ApiClient();

// Export the instance
export const apiClient = apiClientInstance;

// Export individual API functions - ensure proper 'this' binding
export const getIdeas = async (params?: IdeaFilters) => {
  return apiClientInstance.getIdeas.call(apiClientInstance, params);
};
export const getIdeaById = async (id: string) => {
  return apiClientInstance.getIdeaById.call(apiClientInstance, id);
};
export const searchIdeas = async (query: string, params?: PaginationParams) => {
  return apiClientInstance.searchIdeas.call(apiClientInstance, query, params);
};
export const incrementView = async (ideaId: string) => {
  return apiClientInstance.incrementView.call(apiClientInstance, ideaId);
};
export const getComments = async (ideaId: string) => {
  return apiClientInstance.getComments.call(apiClientInstance, ideaId);
};
export const createComment = async (ideaId: string, content: string, parentCommentId?: string) => {
  return apiClientInstance.createComment.call(apiClientInstance, ideaId, content, parentCommentId);
};
export const updateComment = async (commentId: string, content: string) => {
  return apiClientInstance.updateComment.call(apiClientInstance, commentId, content);
};
export const deleteComment = async (commentId: string) => {
  return apiClientInstance.deleteComment.call(apiClientInstance, commentId);
};
export const getProjects = async (ideaId: string) => {
  return apiClientInstance.getProjects.call(apiClientInstance, ideaId);
};
export const createProject = async (ideaId: string, data: { title: string; url: string; description?: string; tools_used: string[] }) => {
  return apiClientInstance.createProject.call(apiClientInstance, ideaId, data);
};
export const updateProject = async (projectId: string, data: { title?: string; url?: string; description?: string; tools_used?: string[] }) => {
  return apiClientInstance.updateProject.call(apiClientInstance, projectId, data);
};
export const deleteProject = async (projectId: string) => {
  return apiClientInstance.deleteProject.call(apiClientInstance, projectId);
};
export const getProfile = async () => {
  return apiClientInstance.getProfile.call(apiClientInstance);
};
export const updateProfile = async (data: { display_name?: string; bio?: string }) => {
  return apiClientInstance.updateProfile.call(apiClientInstance, data);
};
export const trackPageView = async (page: string, ideaId?: string) => {
  return apiClientInstance.trackPageView.call(apiClientInstance, page, ideaId);
};
export const getMetrics = async () => {
  return apiClientInstance.getMetrics.call(apiClientInstance);
};

// Export types for use in hooks
export type { IdeaFilters, PaginationParams };
