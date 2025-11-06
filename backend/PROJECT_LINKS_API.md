# Project Links API Documentation

## Overview

Complete RESTful API for managing project links in the IdeaHub platform. This API allows users to submit, view, update, and delete their project implementations, as well as track statistics toward the 4,000 projects campaign goal.

## Files Created/Modified

### Created
- `/home/user/IdeaHub/backend/src/routes/projects.ts` (516 lines)
  - Complete router with 5 endpoints
  - TypeScript with express-validator for validation
  - Proper error handling and responses
  - Comprehensive comments

### Modified
- `/home/user/IdeaHub/backend/src/routes/index.ts`
  - Imported and mounted projects router
  - Updated API endpoint documentation

## API Endpoints

### 1. GET /api/ideas/:ideaId/projects
**Purpose:** Get all project links for a specific idea

**Authentication:** None required (public read)

**Path Parameters:**
- `ideaId` (UUID, required) - The idea ID

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "uuid",
      "idea_id": "uuid",
      "user_id": "uuid",
      "title": "My Amazing Project",
      "url": "https://example.com",
      "description": "Built with Claude Code",
      "tools_used": ["Claude", "Bolt"],
      "created_at": "2025-11-06T12:00:00Z",
      "updated_at": "2025-11-06T12:00:00Z",
      "display_name": "John Doe"
    }
  ]
}
```

**Features:**
- Joins with users table to include display_name
- Sorted by created_at descending (newest first)
- Returns empty array if no projects found

---

### 2. POST /api/projects
**Purpose:** Submit a new project link

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <supabase-jwt-token>
```

**Request Body:**
```json
{
  "idea_id": "uuid-of-idea",
  "title": "My Project Title",
  "url": "https://myproject.com",
  "description": "Optional description",
  "tools_used": ["Claude", "Bolt"]
}
```

**Validation:**
- `idea_id`: Required, must be valid UUID, must exist in ideas table
- `title`: Required, max 255 characters
- `url`: Required, must be valid HTTP/HTTPS URL
- `description`: Optional, max 2000 characters
- `tools_used`: Optional, must be array of strings

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Project link created successfully",
  "data": {
    "id": "new-uuid",
    "idea_id": "uuid",
    "user_id": "user-uuid",
    "title": "My Project Title",
    "url": "https://myproject.com",
    "description": "Optional description",
    "tools_used": ["Claude", "Bolt"],
    "created_at": "2025-11-06T12:00:00Z",
    "updated_at": "2025-11-06T12:00:00Z"
  }
}
```

**Side Effects:**
- Increments `project_count` on the ideas table
- Uses RPC `increment_project_count` if available, falls back to manual increment

---

### 3. PATCH /api/projects/:id
**Purpose:** Update an existing project link (author only)

**Authentication:** Required (Bearer token)

**Path Parameters:**
- `id` (UUID, required) - The project link ID

**Request Headers:**
```
Authorization: Bearer <supabase-jwt-token>
```

**Request Body (all fields optional, provide only what needs updating):**
```json
{
  "title": "Updated Title",
  "url": "https://updated-url.com",
  "description": "Updated description",
  "tools_used": ["Claude", "Lovable"]
}
```

**Validation:**
- At least one field must be provided
- `title`: Optional, max 255 characters, cannot be empty
- `url`: Optional, must be valid HTTP/HTTPS URL
- `description`: Optional, max 2000 characters
- `tools_used`: Optional, must be array of strings

**Authorization:**
- User must be the author (req.userId must match project.user_id)
- Returns 403 Forbidden if not authorized

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Project link updated successfully",
  "data": {
    "id": "uuid",
    "idea_id": "uuid",
    "user_id": "user-uuid",
    "title": "Updated Title",
    "url": "https://updated-url.com",
    "description": "Updated description",
    "tools_used": ["Claude", "Lovable"],
    "created_at": "2025-11-06T12:00:00Z",
    "updated_at": "2025-11-06T14:30:00Z"
  }
}
```

**Features:**
- Automatically updates `updated_at` timestamp
- Only updates provided fields

---

### 4. DELETE /api/projects/:id
**Purpose:** Delete a project link (author only)

**Authentication:** Required (Bearer token)

**Path Parameters:**
- `id` (UUID, required) - The project link ID

**Request Headers:**
```
Authorization: Bearer <supabase-jwt-token>
```

**Authorization:**
- User must be the author (req.userId must match project.user_id)
- Returns 403 Forbidden if not authorized

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Project link deleted successfully"
}
```

**Side Effects:**
- Decrements `project_count` on the ideas table
- Uses RPC `decrement_project_count` if available, falls back to manual decrement

---

### 5. GET /api/projects/stats
**Purpose:** Get project statistics for the campaign dashboard

**Authentication:** None required (public read)

**Response:**
```json
{
  "success": true,
  "data": {
    "total_projects": 150,
    "campaign_goal": 4000,
    "progress_percentage": 3.75,
    "tools": {
      "breakdown": {
        "claude": 75,
        "bolt": 50,
        "lovable": 20,
        "other": 5
      },
      "all_tools": {
        "Claude": 75,
        "Bolt": 50,
        "Lovable": 20,
        "Cursor": 3,
        "Other Tool": 2
      }
    },
    "categories": {
      "B2B SaaS Tools": 25,
      "Personal Productivity & Finance": 40,
      "Community Building": 30,
      "Education & Learning": 55
    }
  }
}
```

**Features:**
- Tracks progress toward 4,000 projects campaign goal
- Breaks down tool usage (Claude, Bolt, Lovable, Other)
- Provides full tool breakdown and category statistics
- Perfect for displaying on the campaign dashboard

---

## Error Responses

All endpoints return consistent error responses:

### 400 Bad Request (Validation Error)
```json
{
  "error": "Validation Error",
  "errors": [
    {
      "msg": "Title is required",
      "param": "title",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid authorization header"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to update this project link"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Project link not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Failed to create project link"
}
```

---

## Technical Implementation Details

### Authentication Middleware
Uses the existing `authenticate` middleware from `/home/user/IdeaHub/backend/src/middleware/auth.ts`:
- Verifies JWT token from Supabase Auth
- Attaches `req.user` and `req.userId` to request object
- Returns 401 if token is invalid or missing

### Validation
Uses `express-validator` for robust input validation:
- Type checking (UUID, strings, arrays)
- Length constraints
- Custom URL validation
- Detailed error messages

### Database Operations
Uses Supabase JavaScript client:
- Joins with users table for display names
- Joins with ideas table for categories in stats
- Proper error handling for all queries
- Fallback logic for RPC functions

### Counter Management
Smart increment/decrement of project_count:
1. First tries to use RPC functions (`increment_project_count`, `decrement_project_count`)
2. Falls back to manual SQL update if RPC doesn't exist
3. Logs warnings but doesn't fail the request if counter update fails
4. Ensures main operation (create/delete) always succeeds

---

## Database Schema Requirements

The API expects these tables to exist:

### project_links
```sql
id              UUID PRIMARY KEY
idea_id         UUID REFERENCES ideas(id)
user_id         UUID REFERENCES users(id)
title           VARCHAR(255)
url             TEXT
description     TEXT (max 2000 chars enforced in API)
tools_used      TEXT[] (array of strings)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### ideas
```sql
id              UUID PRIMARY KEY
project_count   INTEGER (incremented/decremented by API)
category        TEXT
... other fields
```

### users
```sql
id              UUID PRIMARY KEY
display_name    TEXT
... other fields
```

### Optional RPC Functions
For better performance, create these PostgreSQL functions:

```sql
CREATE OR REPLACE FUNCTION increment_project_count(idea_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE ideas
  SET project_count = COALESCE(project_count, 0) + 1
  WHERE id = idea_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_project_count(idea_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE ideas
  SET project_count = GREATEST(COALESCE(project_count, 0) - 1, 0)
  WHERE id = idea_uuid;
END;
$$ LANGUAGE plpgsql;
```

---

## Testing Checklist

### Manual Testing
- [ ] GET /api/ideas/:ideaId/projects - Verify projects return with display names
- [ ] POST /api/projects - Create project with valid data
- [ ] POST /api/projects - Verify validation errors for invalid data
- [ ] POST /api/projects - Verify 401 without auth token
- [ ] POST /api/projects - Verify project_count increments
- [ ] PATCH /api/projects/:id - Update own project successfully
- [ ] PATCH /api/projects/:id - Verify 403 when updating someone else's project
- [ ] DELETE /api/projects/:id - Delete own project successfully
- [ ] DELETE /api/projects/:id - Verify 403 when deleting someone else's project
- [ ] DELETE /api/projects/:id - Verify project_count decrements
- [ ] GET /api/projects/stats - Verify statistics are accurate

### Integration Testing
- [ ] Create multiple projects and verify counts are accurate
- [ ] Test with various tool combinations (Claude, Bolt, Lovable, others)
- [ ] Verify stats endpoint correctly aggregates data
- [ ] Test pagination if needed for large result sets
- [ ] Verify RLS policies in Supabase align with API permissions

---

## Next Steps

1. **Deploy to staging** - Test with real Supabase database
2. **Create RPC functions** - For better performance on counter updates
3. **Add pagination** - For GET endpoints if project count grows large
4. **Add rate limiting** - To prevent spam submissions
5. **Add webhooks** - To notify when project_count reaches milestones
6. **Add search/filter** - For GET /api/ideas/:ideaId/projects (by tool, date range)
7. **Add metrics tracking** - Log project submissions to metrics table

---

## Campaign Integration

This API is critical for the IdeaHub campaign goal of 4,000 projects by November 18, 2025:

- **Stats Endpoint**: Powers the campaign dashboard showing real-time progress
- **Tool Tracking**: Enables comparison of Claude vs Bolt vs Lovable usage
- **Category Breakdown**: Shows which types of projects are most popular
- **Public Read**: Allows guests to see project submissions, encouraging signups
- **Auth Required for Writes**: Ensures accurate user tracking for the campaign

The `/api/projects/stats` endpoint should be featured prominently on the homepage to show campaign momentum and encourage participation.
