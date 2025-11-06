# Comments API Documentation

This document provides comprehensive documentation for the Comments API endpoints in the IdeaHub backend.

## Table of Contents
- [Overview](#overview)
- [Data Model](#data-model)
- [Endpoints](#endpoints)
  - [Get Comments](#get-comments)
  - [Create Comment](#create-comment)
  - [Reply to Comment](#reply-to-comment)
  - [Update Comment](#update-comment)
  - [Delete Comment](#delete-comment)
  - [Flag Comment](#flag-comment)
- [Database Functions](#database-functions)
- [Error Handling](#error-handling)

## Overview

The Comments API provides full CRUD functionality for managing comments on ideas, including:
- Public read access (no authentication required)
- Nested comment structure (replies to comments)
- User ownership verification for updates/deletes
- Automatic comment count tracking on ideas
- Moderation flagging system

## Data Model

### Comment Object

```typescript
{
  id: string;                    // UUID
  idea_id: string;              // UUID of the associated idea
  user_id: string;              // UUID of the comment author
  parent_comment_id: string | null; // UUID of parent comment (null for top-level)
  content: string;              // Comment text
  flagged_for_moderation: boolean;
  created_at: string;           // ISO timestamp
  updated_at: string;           // ISO timestamp
  user_display_name: string;    // Display name of author
  replies?: Comment[];          // Nested replies (only in GET endpoint)
}
```

## Endpoints

### Get Comments

Get all comments for a specific idea with nested structure.

**Endpoint:** `GET /api/ideas/:ideaId/comments`

**Authentication:** Not required (public endpoint)

**Parameters:**
- `ideaId` (path) - UUID of the idea

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "idea_id": "uuid",
      "user_id": "uuid",
      "parent_comment_id": null,
      "content": "Great idea!",
      "flagged_for_moderation": false,
      "created_at": "2025-11-06T12:00:00Z",
      "updated_at": "2025-11-06T12:00:00Z",
      "user_display_name": "John Doe",
      "replies": [
        {
          "id": "uuid",
          "idea_id": "uuid",
          "user_id": "uuid",
          "parent_comment_id": "uuid",
          "content": "I agree!",
          "flagged_for_moderation": false,
          "created_at": "2025-11-06T12:05:00Z",
          "updated_at": "2025-11-06T12:05:00Z",
          "user_display_name": "Jane Smith",
          "replies": []
        }
      ]
    }
  ],
  "count": 2
}
```

**Example:**
```bash
curl https://api.ideahub.com/api/ideas/123e4567-e89b-12d3-a456-426614174000/comments
```

---

### Create Comment

Create a new top-level comment on an idea.

**Endpoint:** `POST /api/comments`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "idea_id": "uuid",
  "content": "This is my comment"
}
```

**Validation:**
- `idea_id`: Must be a valid UUID
- `content`: Required, 1-2000 characters

**Response:**
```json
{
  "success": true,
  "message": "Comment created successfully",
  "data": {
    "id": "uuid",
    "idea_id": "uuid",
    "user_id": "uuid",
    "parent_comment_id": null,
    "content": "This is my comment",
    "flagged_for_moderation": false,
    "created_at": "2025-11-06T12:00:00Z",
    "updated_at": "2025-11-06T12:00:00Z",
    "user_display_name": "John Doe"
  }
}
```

**Side Effects:**
- Increments `comment_count` on the associated idea

**Example:**
```bash
curl -X POST https://api.ideahub.com/api/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "idea_id": "123e4567-e89b-12d3-a456-426614174000",
    "content": "This is a great idea!"
  }'
```

---

### Reply to Comment

Create a reply to an existing comment.

**Endpoint:** `POST /api/comments/:id/reply`

**Authentication:** Required (Bearer token)

**Parameters:**
- `id` (path) - UUID of the parent comment

**Request Body:**
```json
{
  "content": "This is my reply"
}
```

**Validation:**
- `id`: Must be a valid UUID
- `content`: Required, 1-2000 characters

**Response:**
```json
{
  "success": true,
  "message": "Reply created successfully",
  "data": {
    "id": "uuid",
    "idea_id": "uuid",
    "user_id": "uuid",
    "parent_comment_id": "parent-uuid",
    "content": "This is my reply",
    "flagged_for_moderation": false,
    "created_at": "2025-11-06T12:05:00Z",
    "updated_at": "2025-11-06T12:05:00Z",
    "user_display_name": "Jane Smith"
  }
}
```

**Side Effects:**
- Increments `comment_count` on the associated idea

**Example:**
```bash
curl -X POST https://api.ideahub.com/api/comments/123e4567-e89b-12d3-a456-426614174000/reply \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I agree with this comment!"
  }'
```

---

### Update Comment

Update an existing comment (author only).

**Endpoint:** `PATCH /api/comments/:id`

**Authentication:** Required (Bearer token, must be comment author)

**Parameters:**
- `id` (path) - UUID of the comment

**Request Body:**
```json
{
  "content": "Updated comment text"
}
```

**Validation:**
- `id`: Must be a valid UUID
- `content`: Required, 1-2000 characters
- User must be the comment author

**Response:**
```json
{
  "success": true,
  "message": "Comment updated successfully",
  "data": {
    "id": "uuid",
    "idea_id": "uuid",
    "user_id": "uuid",
    "parent_comment_id": null,
    "content": "Updated comment text",
    "flagged_for_moderation": false,
    "created_at": "2025-11-06T12:00:00Z",
    "updated_at": "2025-11-06T12:15:00Z",
    "user_display_name": "John Doe"
  }
}
```

**Example:**
```bash
curl -X PATCH https://api.ideahub.com/api/comments/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated: This is even better!"
  }'
```

---

### Delete Comment

Delete a comment and all nested replies (author only).

**Endpoint:** `DELETE /api/comments/:id`

**Authentication:** Required (Bearer token, must be comment author)

**Parameters:**
- `id` (path) - UUID of the comment

**Validation:**
- `id`: Must be a valid UUID
- User must be the comment author

**Response:**
```json
{
  "success": true,
  "message": "Comment and 2 nested replies deleted successfully",
  "deleted_count": 3
}
```

**Side Effects:**
- Deletes the comment and ALL nested replies (cascading delete)
- Decrements `comment_count` on the associated idea by the total number of deleted comments

**Example:**
```bash
curl -X DELETE https://api.ideahub.com/api/comments/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Flag Comment

Flag a comment for moderation.

**Endpoint:** `POST /api/comments/:id/flag`

**Authentication:** Required (Bearer token)

**Parameters:**
- `id` (path) - UUID of the comment

**Validation:**
- `id`: Must be a valid UUID

**Response:**
```json
{
  "success": true,
  "message": "Comment flagged for moderation"
}
```

**Side Effects:**
- Sets `flagged_for_moderation` to true
- Updates `updated_at` timestamp

**Example:**
```bash
curl -X POST https://api.ideahub.com/api/comments/123e4567-e89b-12d3-a456-426614174000/flag \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Database Functions

The Comments API uses these PostgreSQL functions for managing comment counts:

### increment_comment_count

```sql
CREATE OR REPLACE FUNCTION increment_comment_count(idea_id_param UUID)
RETURNS void
```

Increments the comment count on an idea by 1. Called automatically when creating comments or replies.

### decrement_comment_count

```sql
CREATE OR REPLACE FUNCTION decrement_comment_count(
    idea_id_param UUID,
    count_param INTEGER DEFAULT 1
)
RETURNS void
```

Decrements the comment count on an idea by the specified count. Called automatically when deleting comments. Ensures the count never goes below 0.

**Note:** These functions are defined in `/home/user/IdeaHub/supabase/migrations/013_comment_count_functions.sql`

---

## Error Handling

The API uses standard HTTP status codes and returns errors in this format:

```json
{
  "error": "Error name",
  "message": "Detailed error message"
}
```

### Common Status Codes

- `200 OK` - Successful GET request
- `201 Created` - Successful POST request (comment/reply created)
- `400 Bad Request` - Invalid input or validation error
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User doesn't have permission (not comment author)
- `404 Not Found` - Comment or idea not found
- `500 Internal Server Error` - Server-side error

### Example Error Responses

**Invalid UUID:**
```json
{
  "error": "BadRequest",
  "message": "Invalid comment ID format"
}
```

**Not Authorized:**
```json
{
  "error": "Forbidden",
  "message": "You can only edit your own comments"
}
```

**Comment Not Found:**
```json
{
  "error": "NotFound",
  "message": "Comment not found"
}
```

**Validation Error:**
```json
{
  "error": "BadRequest",
  "message": "Comment must be between 1 and 2000 characters"
}
```

---

## Implementation Notes

### Nested Comment Structure

The GET endpoint returns comments in a nested tree structure using the `buildCommentTree` helper function. This recursively organizes comments by their `parent_comment_id` relationships.

### User Display Names

All endpoints join with the `users` table to include the author's `display_name` in the response, making it easier for frontend clients to display comments without additional queries.

### Comment Count Synchronization

The `comment_count` field on the `ideas` table is automatically maintained by the API:
- Incremented when comments/replies are created
- Decremented when comments are deleted (including nested replies)
- Uses PostgreSQL functions for consistency

### Moderation System

Comments flagged for moderation:
- Still appear in API responses (frontend should handle filtering)
- Can be filtered server-side in future iterations
- Timestamp is updated when flagged for audit purposes

### Cascading Deletes

When a comment is deleted:
1. The API counts all nested replies
2. Deletes the parent comment (database CASCADE handles nested replies)
3. Decrements the idea's comment count by the total number deleted

---

## Testing

Example test scenarios:

1. **Create a top-level comment**
   - POST to `/api/comments`
   - Verify response includes new comment with user display name
   - Verify idea's comment_count increased by 1

2. **Create a nested reply**
   - POST to `/api/comments/:id/reply`
   - Verify response includes reply with correct parent_comment_id
   - Verify idea's comment_count increased by 1

3. **Get comments with nested structure**
   - GET `/api/ideas/:ideaId/comments`
   - Verify top-level comments have `replies` array
   - Verify reply depth is correct

4. **Update own comment**
   - PATCH to `/api/comments/:id` as comment author
   - Verify content updated and updated_at changed

5. **Try to update someone else's comment**
   - PATCH to `/api/comments/:id` as different user
   - Verify 403 Forbidden response

6. **Delete comment with nested replies**
   - DELETE `/api/comments/:id`
   - Verify deleted_count includes nested replies
   - Verify idea's comment_count decreased appropriately

7. **Flag a comment**
   - POST to `/api/comments/:id/flag`
   - Verify flagged_for_moderation is true
