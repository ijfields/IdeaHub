# User Profile API Documentation

This document describes the User Profile API endpoints implemented in `/home/user/IdeaHub/backend/src/routes/users.ts`.

## Endpoints

### 1. Get User Profile (Public)

**Endpoint:** `GET /api/users/:id/profile`

**Authentication:** Not required

**Description:** Retrieves public profile information for a specific user.

**URL Parameters:**
- `id` (UUID) - User ID

**Response (200 OK):**
```json
{
  "profile": {
    "display_name": "John Doe",
    "bio": "AI enthusiast and developer",
    "created_at": "2025-01-15T10:30:00Z",
    "tier": "free"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid user ID format
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

**Privacy Note:** Email is intentionally excluded from the response for privacy.

---

### 2. Update Own Profile

**Endpoint:** `PATCH /api/users/profile`

**Authentication:** Required (Bearer token)

**Description:** Updates the authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "display_name": "Jane Smith",
  "bio": "Updated bio text"
}
```

**Validation Rules:**
- `display_name` (optional): String, max 100 characters
- `bio` (optional): String, max 500 characters
- At least one field must be provided

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "Jane Smith",
    "bio": "Updated bio text",
    "tier": "free",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-20T14:45:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation error or no fields provided
- `401 Unauthorized` - Missing or invalid token
- `500 Internal Server Error` - Server error

**Note:** The `updated_at` timestamp is automatically updated by the database trigger.

---

### 3. Get User's Projects

**Endpoint:** `GET /api/users/:id/projects`

**Authentication:** Not required

**Description:** Retrieves all projects submitted by a specific user, sorted by creation date (newest first).

**URL Parameters:**
- `id` (UUID) - User ID

**Response (200 OK):**
```json
{
  "projects": [
    {
      "id": "uuid",
      "title": "My AI Chatbot",
      "url": "https://github.com/user/chatbot",
      "description": "A chatbot built with Claude",
      "tools_used": ["Claude", "React"],
      "created_at": "2025-01-18T09:00:00Z",
      "updated_at": "2025-01-18T09:00:00Z",
      "idea_id": "uuid",
      "idea_title": "Personal Finance Dashboard"
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `400 Bad Request` - Invalid user ID format
- `500 Internal Server Error` - Server error

**Features:**
- Includes the idea title via JOIN for easy reference
- Sorted by creation date (newest first)
- Returns empty array if user has no projects

---

### 4. Get User's Comments

**Endpoint:** `GET /api/users/:id/comments`

**Authentication:** Not required

**Description:** Retrieves all comments by a specific user, sorted by creation date (newest first).

**URL Parameters:**
- `id` (UUID) - User ID

**Response (200 OK):**
```json
{
  "comments": [
    {
      "id": "uuid",
      "content": "This is a great idea!",
      "parent_comment_id": null,
      "created_at": "2025-01-19T12:30:00Z",
      "updated_at": "2025-01-19T12:30:00Z",
      "idea_id": "uuid",
      "idea_title": "Habit Tracker with Analytics"
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `400 Bad Request` - Invalid user ID format
- `500 Internal Server Error` - Server error

**Features:**
- Includes the idea title via JOIN for easy reference
- Excludes flagged/moderated comments
- Shows both top-level comments (`parent_comment_id: null`) and replies
- Sorted by creation date (newest first)
- Returns empty array if user has no comments

---

## Implementation Details

### File Structure
- **Router:** `/home/user/IdeaHub/backend/src/routes/users.ts`
- **Mounted in:** `/home/user/IdeaHub/backend/src/routes/index.ts` at `/api/users`
- **Middleware:** Uses `authenticate` from `/home/user/IdeaHub/backend/src/middleware/auth.ts`
- **Validation:** Uses `express-validator` for input validation

### Database Tables Used
- `users` - User profile information
- `project_links` - User-submitted projects
- `comments` - User comments on ideas
- `ideas` - Project ideas (joined for titles)

### Security Features
- Email is never exposed in public endpoints
- User can only update their own profile (enforced by `req.userId` from auth middleware)
- UUID validation on all user ID parameters
- Input sanitization and validation using express-validator
- Flagged comments are excluded from public view

### TypeScript Type Safety
- All parameters are properly typed
- Request/Response types from Express
- Supabase query types handled with type assertions where needed

---

## Testing Examples

### Using cURL

**Get User Profile:**
```bash
curl http://localhost:3001/api/users/{user_id}/profile
```

**Update Profile (requires auth):**
```bash
curl -X PATCH http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "display_name": "New Name",
    "bio": "Updated bio"
  }'
```

**Get User Projects:**
```bash
curl http://localhost:3001/api/users/{user_id}/projects
```

**Get User Comments:**
```bash
curl http://localhost:3001/api/users/{user_id}/comments
```

---

## Next Steps

To test these endpoints:

1. Ensure Supabase is configured (`.env` file with `SUPABASE_URL` and `SUPABASE_ANON_KEY`)
2. Start the backend server: `npm run dev`
3. Create a test user via Supabase Auth
4. Use the user's UUID to test the endpoints

The endpoints are now ready for integration with the frontend!
