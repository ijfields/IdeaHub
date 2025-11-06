# IdeaHub API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Common Response Formats](#common-response-formats)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [API Endpoints](#api-endpoints)
   - [Ideas API](#ideas-api)
   - [Comments API](#comments-api)
   - [Project Links API](#project-links-api)
   - [User Profile API](#user-profile-api)
   - [Analytics & Metrics API](#analytics--metrics-api)
8. [Quick Start Guide](#quick-start-guide)
9. [Environment Setup](#environment-setup)
10. [Testing Checklist](#testing-checklist)

---

## Overview

The IdeaHub API provides a RESTful interface for managing AI project ideas, comments, project submissions, user profiles, and analytics. The platform features a tiered access system where guests can view 5 free ideas, while registered users can access all 87 ideas.

**Key Features:**
- Tiered access control (free tier vs. authenticated users)
- Full-text search across ideas
- Nested commenting system
- Project tracking and campaign progress monitoring
- Comprehensive analytics dashboard
- Tool usage tracking (Claude, Bolt, Lovable, etc.)

---

## Authentication

The API uses **Bearer Token Authentication** with Supabase Auth.

### How to Authenticate

Include the JWT token from Supabase Auth in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

### Authentication Types

- **Required Auth**: Endpoint requires valid JWT token (returns 401 if missing)
- **Optional Auth**: Endpoint accepts token but doesn't require it (guest access allowed)
- **No Auth**: Endpoint is publicly accessible

---

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

All endpoints are prefixed with `/api`.

---

## Common Response Formats

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 87,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "details": [ ... ]  // Optional validation errors
}
```

### Common HTTP Status Codes

- **200 OK**: Request succeeded
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request parameters or validation errors
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Valid token but insufficient permissions
- **404 Not Found**: Resource does not exist
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side error

---

## Rate Limiting

### Rate-Limited Endpoints

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /api/metrics/page-view` | 100 requests | 1 hour |

All other endpoints currently have no rate limiting.

**Rate Limit Response (429):**
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 3600
}
```

---

## API Endpoints

### Ideas API

Base path: `/api/ideas`

#### 1. List All Ideas

```
GET /api/ideas
```

**Authentication**: Optional (tiered access)

**Description**: Get paginated list of ideas with optional filtering and sorting. Guests see only `free_tier=true` ideas; authenticated users see all 87 ideas.

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1, min: 1)
- `limit` (integer, optional): Items per page (default: 20, max: 100)
- `category` (string, optional): Filter by category
- `difficulty` (enum, optional): `Beginner`, `Intermediate`, or `Advanced`
- `search` (string, optional): Search term for title, description, tags, tools
- `sort` (enum, optional): `popular`, `recent`, `difficulty`, or `title` (default: `recent`)

**Example Request**:
```bash
GET /api/ideas?page=1&limit=20&category=Education&difficulty=Beginner&sort=popular
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Personal Finance Dashboard",
      "description": "Build a personal finance tracking dashboard...",
      "category": "Personal Productivity & Finance",
      "difficulty": "Intermediate",
      "tools": ["Claude", "Bolt"],
      "tags": ["finance", "dashboard", "analytics"],
      "monetization_potential": "High",
      "estimated_build_time": "4-6 hours",
      "view_count": 245,
      "comment_count": 12,
      "project_count": 8,
      "free_tier": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "filters": {
    "category": "Education",
    "difficulty": "Beginner",
    "search": null,
    "sort": "popular",
    "tier": "authenticated"
  }
}
```

---

#### 2. Get Free-Tier Ideas

```
GET /api/ideas/free-tier
```

**Authentication**: None

**Description**: Get only the 5 free-tier ideas available to guests without authentication.

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Africana History Quiz & Trivia Platform",
      "description": "...",
      "free_tier": true,
      ...
    }
  ],
  "count": 5
}
```

---

#### 3. Search Ideas

```
GET /api/ideas/search
```

**Authentication**: Optional (tiered access)

**Description**: Full-text search across idea titles, descriptions, tools, and tags.

**Query Parameters**:
- `q` (string, required): Search query
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20, max: 100)

**Example Request**:
```bash
GET /api/ideas/search?q=dashboard&page=1&limit=10
```

**Example Response**:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { ... },
  "query": "dashboard"
}
```

---

#### 4. Get Ideas by Category

```
GET /api/ideas/category/:category
```

**Authentication**: Optional (tiered access)

**Description**: Filter ideas by category with pagination.

**Path Parameters**:
- `category` (string, required): Category name

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20, max: 100)

**Example Request**:
```bash
GET /api/ideas/category/Education%20%26%20Learning?page=1&limit=20
```

**Example Response**:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { ... },
  "category": "Education & Learning"
}
```

---

#### 5. Get Single Idea

```
GET /api/ideas/:id
```

**Authentication**: Optional (tiered access)

**Description**: Get detailed information about a specific idea. Guests can only access `free_tier=true` ideas.

**Path Parameters**:
- `id` (UUID, required): Idea ID

**Example Request**:
```bash
GET /api/ideas/550e8400-e29b-41d4-a716-446655440000
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Personal Finance Dashboard",
    "description": "Build a comprehensive personal finance tracking dashboard...",
    "category": "Personal Productivity & Finance",
    "difficulty": "Intermediate",
    "tools": ["Claude", "Bolt"],
    "tags": ["finance", "dashboard", "analytics"],
    "monetization_potential": "High",
    "estimated_build_time": "4-6 hours",
    "view_count": 245,
    "comment_count": 12,
    "project_count": 8,
    "free_tier": true,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "access": "full"
}
```

---

#### 6. Increment Idea View Count

```
PATCH /api/ideas/:id/view
```

**Authentication**: None

**Description**: Increment the view count for an idea. Used for tracking popularity metrics.

**Path Parameters**:
- `id` (UUID, required): Idea ID

**Example Request**:
```bash
PATCH /api/ideas/550e8400-e29b-41d4-a716-446655440000/view
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "view_count": 246
  },
  "message": "View count incremented successfully"
}
```

---

### Comments API

Base path: `/api/comments` and `/api/ideas/:ideaId/comments`

#### 1. Get All Comments for an Idea

```
GET /api/ideas/:ideaId/comments
```

**Authentication**: None

**Description**: Get all comments for a specific idea in nested structure. Returns comments with user display names and replies.

**Path Parameters**:
- `ideaId` (UUID, required): Idea ID

**Example Request**:
```bash
GET /api/ideas/550e8400-e29b-41d4-a716-446655440000/comments
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "comment-uuid",
      "idea_id": "idea-uuid",
      "user_id": "user-uuid",
      "parent_comment_id": null,
      "content": "This is a great idea! I built it using Claude.",
      "flagged_for_moderation": false,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "user_display_name": "Jane Doe",
      "replies": [
        {
          "id": "reply-uuid",
          "parent_comment_id": "comment-uuid",
          "content": "How long did it take you?",
          "user_display_name": "John Smith",
          "created_at": "2024-01-15T11:00:00Z",
          "replies": []
        }
      ]
    }
  ],
  "count": 12
}
```

---

#### 2. Create a Comment

```
POST /api/comments
```

**Authentication**: Required

**Description**: Create a new top-level comment on an idea. Increments comment count on the idea.

**Request Body**:
```json
{
  "idea_id": "uuid",
  "content": "This is my comment text"
}
```

**Validation**:
- `idea_id`: Must be valid UUID
- `content`: String, 1-2000 characters

**Example Response**:
```json
{
  "success": true,
  "message": "Comment created successfully",
  "data": {
    "id": "comment-uuid",
    "idea_id": "idea-uuid",
    "user_id": "user-uuid",
    "parent_comment_id": null,
    "content": "This is my comment text",
    "flagged_for_moderation": false,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "user_display_name": "Jane Doe"
  }
}
```

---

#### 3. Reply to a Comment

```
POST /api/comments/:id/reply
```

**Authentication**: Required

**Description**: Create a nested reply to an existing comment.

**Path Parameters**:
- `id` (UUID, required): Parent comment ID

**Request Body**:
```json
{
  "content": "This is my reply text"
}
```

**Validation**:
- `content`: String, 1-2000 characters

**Example Response**:
```json
{
  "success": true,
  "message": "Reply created successfully",
  "data": {
    "id": "reply-uuid",
    "idea_id": "idea-uuid",
    "user_id": "user-uuid",
    "parent_comment_id": "parent-comment-uuid",
    "content": "This is my reply text",
    "created_at": "2024-01-15T11:00:00Z",
    "user_display_name": "John Smith"
  }
}
```

---

#### 4. Update a Comment

```
PATCH /api/comments/:id
```

**Authentication**: Required (must be comment author)

**Description**: Update an existing comment. Only the comment author can edit their own comments.

**Path Parameters**:
- `id` (UUID, required): Comment ID

**Request Body**:
```json
{
  "content": "Updated comment text"
}
```

**Validation**:
- `content`: String, 1-2000 characters

**Example Response**:
```json
{
  "success": true,
  "message": "Comment updated successfully",
  "data": {
    "id": "comment-uuid",
    "content": "Updated comment text",
    "updated_at": "2024-01-15T12:00:00Z",
    ...
  }
}
```

---

#### 5. Delete a Comment

```
DELETE /api/comments/:id
```

**Authentication**: Required (must be comment author)

**Description**: Delete a comment and all its nested replies. Decrements comment count on the idea.

**Path Parameters**:
- `id` (UUID, required): Comment ID

**Example Response**:
```json
{
  "success": true,
  "message": "Comment and 2 nested replies deleted successfully",
  "deleted_count": 3
}
```

---

#### 6. Flag Comment for Moderation

```
POST /api/comments/:id/flag
```

**Authentication**: Required

**Description**: Flag a comment for moderation review. Useful for reporting inappropriate content.

**Path Parameters**:
- `id` (UUID, required): Comment ID

**Example Response**:
```json
{
  "success": true,
  "message": "Comment flagged for moderation"
}
```

---

### Project Links API

Base path: `/api/projects` and `/api/ideas/:ideaId/projects`

#### 1. Get All Projects for an Idea

```
GET /api/ideas/:ideaId/projects
```

**Authentication**: None

**Description**: Get all project submissions for a specific idea. Shows what users have built.

**Path Parameters**:
- `ideaId` (UUID, required): Idea ID

**Example Request**:
```bash
GET /api/ideas/550e8400-e29b-41d4-a716-446655440000/projects
```

**Example Response**:
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "id": "project-uuid",
      "idea_id": "idea-uuid",
      "user_id": "user-uuid",
      "title": "My Finance Dashboard v1",
      "url": "https://myfinancedashboard.com",
      "description": "Built this dashboard using Claude in 5 hours. Added custom charts...",
      "tools_used": ["Claude", "React", "Chart.js"],
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "display_name": "Jane Doe"
    }
  ]
}
```

---

#### 2. Submit a Project Link

```
POST /api/projects
```

**Authentication**: Required

**Description**: Submit a new project link showing what you built. Increments project count on the idea and contributes to campaign goal progress.

**Request Body**:
```json
{
  "idea_id": "uuid",
  "title": "My Project Title",
  "url": "https://example.com",
  "description": "Optional description of my project",
  "tools_used": ["Claude", "Bolt", "React"]
}
```

**Validation**:
- `idea_id`: Must be valid UUID
- `title`: String, max 255 characters
- `url`: Must be valid HTTP/HTTPS URL
- `description`: Optional, max 2000 characters
- `tools_used`: Optional array of strings

**Example Response**:
```json
{
  "success": true,
  "message": "Project link created successfully",
  "data": {
    "id": "project-uuid",
    "idea_id": "idea-uuid",
    "user_id": "user-uuid",
    "title": "My Project Title",
    "url": "https://example.com",
    "description": "Optional description of my project",
    "tools_used": ["Claude", "Bolt", "React"],
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

#### 3. Update a Project Link

```
PATCH /api/projects/:id
```

**Authentication**: Required (must be project author)

**Description**: Update an existing project link. Only the author can edit their own projects.

**Path Parameters**:
- `id` (UUID, required): Project ID

**Request Body** (all fields optional):
```json
{
  "title": "Updated Project Title",
  "url": "https://updated-example.com",
  "description": "Updated description",
  "tools_used": ["Claude", "Vue"]
}
```

**Example Response**:
```json
{
  "success": true,
  "message": "Project link updated successfully",
  "data": {
    "id": "project-uuid",
    "title": "Updated Project Title",
    "updated_at": "2024-01-15T12:00:00Z",
    ...
  }
}
```

---

#### 4. Delete a Project Link

```
DELETE /api/projects/:id
```

**Authentication**: Required (must be project author)

**Description**: Delete a project link. Decrements project count on the idea.

**Path Parameters**:
- `id` (UUID, required): Project ID

**Example Response**:
```json
{
  "success": true,
  "message": "Project link deleted successfully"
}
```

---

#### 5. Get Project Statistics

```
GET /api/projects/stats
```

**Authentication**: None

**Description**: Get comprehensive project statistics for the campaign dashboard. Shows progress toward 4,000 projects goal and tool usage breakdown.

**Example Response**:
```json
{
  "success": true,
  "data": {
    "total_projects": 523,
    "campaign_goal": 4000,
    "progress_percentage": 13.08,
    "tools": {
      "breakdown": {
        "claude": 215,
        "bolt": 178,
        "lovable": 92,
        "other": 38
      },
      "all_tools": {
        "Claude": 215,
        "Bolt": 178,
        "Lovable": 92,
        "React": 45,
        "Vue": 23
      }
    },
    "categories": {
      "Personal Productivity & Finance": 87,
      "Education & Learning": 65,
      "Marketing & Content Creation": 52
    }
  }
}
```

---

### User Profile API

Base path: `/api/users`

#### 1. Get User Profile

```
GET /api/users/:id/profile
```

**Authentication**: None

**Description**: Get public user profile information (excludes email for privacy).

**Path Parameters**:
- `id` (UUID, required): User ID

**Example Response**:
```json
{
  "profile": {
    "display_name": "Jane Doe",
    "bio": "Software developer interested in AI tools",
    "created_at": "2024-01-15T10:30:00Z",
    "tier": "free"
  }
}
```

---

#### 2. Update Own Profile

```
PATCH /api/users/profile
```

**Authentication**: Required

**Description**: Update your own user profile.

**Request Body** (at least one field required):
```json
{
  "display_name": "New Display Name",
  "bio": "Updated bio text"
}
```

**Validation**:
- `display_name`: Optional, max 100 characters
- `bio`: Optional, max 500 characters

**Example Response**:
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "id": "user-uuid",
    "email": "user@example.com",
    "display_name": "New Display Name",
    "bio": "Updated bio text",
    "tier": "free",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T15:45:00Z"
  }
}
```

---

#### 3. Get User's Projects

```
GET /api/users/:id/projects
```

**Authentication**: None

**Description**: Get all projects submitted by a specific user.

**Path Parameters**:
- `id` (UUID, required): User ID

**Example Response**:
```json
{
  "projects": [
    {
      "id": "project-uuid",
      "title": "My Finance Dashboard v1",
      "url": "https://myfinancedashboard.com",
      "description": "Built with Claude...",
      "tools_used": ["Claude", "React"],
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "idea_id": "idea-uuid",
      "idea_title": "Personal Finance Dashboard"
    }
  ],
  "count": 3
}
```

---

#### 4. Get User's Comments

```
GET /api/users/:id/comments
```

**Authentication**: None

**Description**: Get all comments by a specific user (excludes flagged comments).

**Path Parameters**:
- `id` (UUID, required): User ID

**Example Response**:
```json
{
  "comments": [
    {
      "id": "comment-uuid",
      "content": "This is a great idea!",
      "parent_comment_id": null,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "idea_id": "idea-uuid",
      "idea_title": "Personal Finance Dashboard"
    }
  ],
  "count": 7
}
```

---

### Analytics & Metrics API

Base path: `/api/metrics`

#### 1. Track Page View

```
POST /api/metrics/page-view
```

**Authentication**: Optional

**Rate Limit**: 100 requests per hour

**Description**: Track page views for analytics. Works for both authenticated and guest users.

**Request Body**:
```json
{
  "page": "/ideas/12345",
  "idea_id": "uuid"  // optional
}
```

**Validation**:
- `page`: Required string
- `idea_id`: Optional UUID

**Example Response**:
```json
{
  "success": true,
  "message": "Page view recorded"
}
```

---

#### 2. Get Dashboard Metrics

```
GET /api/metrics/dashboard
```

**Authentication**: Required

**Description**: Get comprehensive admin dashboard metrics showing all key campaign statistics.

**Example Response**:
```json
{
  "total_registrations": 523,
  "total_projects": 412,
  "total_comments": 1247,
  "total_page_views": 8932,
  "unique_visitors": 2456,
  "projects_goal_progress": {
    "current": 412,
    "goal": 4000,
    "percentage": 10.3
  },
  "recent_registrations": 87,
  "most_viewed_ideas": [
    {
      "id": "uuid",
      "title": "Personal Finance Dashboard",
      "view_count": 245
    }
  ],
  "most_commented_ideas": [
    {
      "id": "uuid",
      "title": "Social Media Content Repurposer",
      "comment_count": 34
    }
  ],
  "most_built_ideas": [
    {
      "id": "uuid",
      "title": "Habit Tracker with Analytics",
      "project_count": 28
    }
  ],
  "updated_at": "2024-01-20T15:45:00Z"
}
```

---

#### 3. Get Projects Goal Progress

```
GET /api/metrics/projects-goal
```

**Authentication**: None

**Description**: Get progress toward the 4,000 projects campaign goal. Public endpoint for displaying on homepage.

**Example Response**:
```json
{
  "current": 412,
  "goal": 4000,
  "percentage": 10.3,
  "updated_at": "2024-01-20T15:45:00Z"
}
```

---

#### 4. Get Tool Usage Statistics

```
GET /api/metrics/tool-usage
```

**Authentication**: None

**Description**: Get breakdown of which AI tools (Claude, Bolt, Lovable) are being used across all projects.

**Example Response**:
```json
{
  "Claude": 215,
  "Bolt": 178,
  "Lovable": 92,
  "Google Studio": 23,
  "Other": 38,
  "updated_at": "2024-01-20T15:45:00Z"
}
```

---

#### 5. Export Metrics

```
GET /api/metrics/export
```

**Authentication**: Required

**Description**: Export all dashboard metrics in CSV or JSON format for analysis.

**Query Parameters**:
- `format` (enum, required): `csv` or `json`

**Example Request**:
```bash
GET /api/metrics/export?format=csv
```

**Response**: Downloads file with all metrics data.

**CSV Format**:
```csv
Metric,Value
Export Timestamp,2024-01-20T15:45:00Z
Total Registrations,523
Total Projects,412
...
```

**JSON Format**:
```json
{
  "export_timestamp": "2024-01-20T15:45:00Z",
  "total_registrations": 523,
  "total_projects": 412,
  "total_comments": 1247,
  ...
}
```

---

## Quick Start Guide

### 1. Set Up Environment

Create a `.env` file in the backend directory:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS (optional)
CORS_ORIGIN=http://localhost:5173
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`

### 4. Test Authentication

**Step 1: Sign up a user through Supabase Auth**

**Step 2: Get the JWT token from the response**

**Step 3: Test an authenticated endpoint:**

```bash
curl -X GET http://localhost:3000/api/ideas \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Test Public Endpoints

```bash
# Get free-tier ideas (no auth)
curl http://localhost:3000/api/ideas/free-tier

# Get projects goal progress
curl http://localhost:3000/api/metrics/projects-goal

# Search ideas
curl "http://localhost:3000/api/ideas/search?q=dashboard"
```

---

## Environment Setup

### Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (keep secret!) | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous public key | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment: development/production | No |
| `CORS_ORIGIN` | Allowed CORS origin (default: *) | No |

### Supabase Setup Requirements

1. **Database Tables**: Ensure all required tables exist:
   - `ideas`
   - `comments`
   - `project_links`
   - `users`
   - `page_views`
   - `metrics`

2. **RLS Policies**: Configure Row Level Security policies for tiered access

3. **Database Functions**: Create these PostgreSQL functions:
   - `increment_comment_count(idea_id_param UUID)`
   - `decrement_comment_count(idea_id_param UUID, count_param INT)`
   - `increment_project_count(idea_uuid UUID)`
   - `decrement_project_count(idea_uuid UUID)`

---

## Testing Checklist

### Pre-Launch Testing

#### Ideas API
- [ ] List ideas as guest (should see only 5 free-tier ideas)
- [ ] List ideas as authenticated user (should see all 87 ideas)
- [ ] Search ideas with various queries
- [ ] Filter by category and difficulty
- [ ] Get single idea by ID
- [ ] Increment view count
- [ ] Verify pagination works correctly

#### Comments API
- [ ] Get comments for an idea (public)
- [ ] Create a top-level comment (authenticated)
- [ ] Reply to a comment (authenticated)
- [ ] Update own comment (authenticated)
- [ ] Try to update someone else's comment (should fail)
- [ ] Delete comment with nested replies
- [ ] Flag comment for moderation
- [ ] Verify nested comment structure

#### Project Links API
- [ ] Get projects for an idea (public)
- [ ] Submit a new project (authenticated)
- [ ] Update own project (authenticated)
- [ ] Delete own project (authenticated)
- [ ] Get project statistics
- [ ] Verify tool usage breakdown
- [ ] Verify project count increments/decrements correctly

#### User Profile API
- [ ] Get public user profile
- [ ] Update own profile (authenticated)
- [ ] Get user's projects
- [ ] Get user's comments
- [ ] Verify email is excluded from public profile

#### Analytics & Metrics API
- [ ] Track page view (guest and authenticated)
- [ ] Test rate limiting on page-view endpoint
- [ ] Get dashboard metrics (authenticated)
- [ ] Get projects goal progress (public)
- [ ] Get tool usage statistics (public)
- [ ] Export metrics as CSV
- [ ] Export metrics as JSON

#### Authentication & Authorization
- [ ] Access public endpoints without token
- [ ] Access protected endpoints with valid token
- [ ] Access protected endpoints with invalid token (should return 401)
- [ ] Access protected endpoints with expired token (should return 401)
- [ ] Verify tiered access for ideas (guest vs authenticated)
- [ ] Verify ownership checks for update/delete operations

#### Error Handling
- [ ] Test with invalid UUID formats
- [ ] Test with missing required fields
- [ ] Test with invalid data types
- [ ] Test with strings exceeding max length
- [ ] Test 404 responses for non-existent resources
- [ ] Test validation error messages

#### Performance & Edge Cases
- [ ] Test pagination with large datasets
- [ ] Test concurrent view count increments
- [ ] Test concurrent comment/project submissions
- [ ] Test nested comments with deep nesting
- [ ] Test search with special characters
- [ ] Test empty result sets

---

## Support & Documentation

For more information about the IdeaHub project:
- **Project Overview**: See `/home/user/IdeaHub/CLAUDE.md`
- **Planning Document**: See `/home/user/IdeaHub/PLANNING.md`
- **Database Migrations**: See `/home/user/IdeaHub/backend/supabase/migrations/`

**Campaign Details**:
- Campaign Goal: 4,000 projects by November 18, 2025
- Target KPIs: 500+ registrations, 1,000+ comments, 30%+ engagement rate
- Platform Focus: Showcasing 87 AI project ideas to cautious professionals

---

**Last Updated**: January 2025
**API Version**: 1.0
**Backend Framework**: Express.js + TypeScript + Supabase
