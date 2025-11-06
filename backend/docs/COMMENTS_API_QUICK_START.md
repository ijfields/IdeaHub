# Comments API - Quick Start Guide

## Overview

The Comments API is now fully implemented with 6 endpoints for managing comments on ideas.

## File Locations

### Source Code
- **Router:** `/home/user/IdeaHub/backend/src/routes/comments.ts` (14KB)
- **Routes Index:** `/home/user/IdeaHub/backend/src/routes/index.ts` (updated)

### Database
- **Migration:** `/home/user/IdeaHub/supabase/migrations/013_comment_count_functions.sql` (2.7KB)
- **Consolidated:** `/home/user/IdeaHub/supabase/all-migrations.sql` (updated)

### Documentation
- **Full API Docs:** `/home/user/IdeaHub/backend/docs/COMMENTS_API.md` (12KB)
- **This Guide:** `/home/user/IdeaHub/backend/docs/COMMENTS_API_QUICK_START.md`

## API Endpoints Summary

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/ideas/:ideaId/comments` | No | Get all comments (nested) |
| POST | `/api/comments` | Yes | Create top-level comment |
| POST | `/api/comments/:id/reply` | Yes | Reply to a comment |
| PATCH | `/api/comments/:id` | Yes (author) | Update comment |
| DELETE | `/api/comments/:id` | Yes (author) | Delete comment + replies |
| POST | `/api/comments/:id/flag` | Yes | Flag for moderation |

## Quick Examples

### 1. Get Comments (Public)
```bash
curl https://api.example.com/api/ideas/123e4567-e89b-12d3-a456-426614174000/comments
```

### 2. Create Comment (Authenticated)
```bash
curl -X POST https://api.example.com/api/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "idea_id": "123e4567-e89b-12d3-a456-426614174000",
    "content": "This is a great idea!"
  }'
```

### 3. Reply to Comment
```bash
curl -X POST https://api.example.com/api/comments/comment-uuid/reply \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I agree!"
  }'
```

### 4. Update Comment (Author Only)
```bash
curl -X PATCH https://api.example.com/api/comments/comment-uuid \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated comment text"
  }'
```

### 5. Delete Comment (Author Only)
```bash
curl -X DELETE https://api.example.com/api/comments/comment-uuid \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Flag Comment
```bash
curl -X POST https://api.example.com/api/comments/comment-uuid/flag \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Key Features Implemented

✅ **Nested Comments** - Hierarchical comment structure with unlimited nesting
✅ **Public Read Access** - Anyone can view comments without authentication
✅ **Authentication Required** - Create, update, delete, and flag require auth
✅ **Ownership Verification** - Users can only edit/delete their own comments
✅ **Automatic Count Tracking** - Comment counts on ideas auto-increment/decrement
✅ **User Display Names** - Automatically joined from users table
✅ **Input Validation** - Using express-validator (1-2000 characters)
✅ **Error Handling** - Comprehensive error responses with proper status codes
✅ **Cascading Deletes** - Deleting a comment removes all nested replies
✅ **Moderation System** - Flag comments for review

## Database Functions

Two PostgreSQL functions were created to manage comment counts:

### increment_comment_count(idea_id_param UUID)
- Called when creating comments/replies
- Increments the `comment_count` on the ideas table by 1

### decrement_comment_count(idea_id_param UUID, count_param INTEGER)
- Called when deleting comments
- Decrements by the specified count (for nested deletes)
- Never allows count to go below 0

## Response Structure

### Successful Response
```json
{
  "success": true,
  "message": "Comment created successfully",
  "data": {
    "id": "uuid",
    "idea_id": "uuid",
    "user_id": "uuid",
    "parent_comment_id": null,
    "content": "Comment text",
    "flagged_for_moderation": false,
    "created_at": "2025-11-06T12:00:00Z",
    "updated_at": "2025-11-06T12:00:00Z",
    "user_display_name": "John Doe"
  }
}
```

### Nested Comments (GET)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "Top-level comment",
      "user_display_name": "John Doe",
      "replies": [
        {
          "id": "uuid",
          "content": "Nested reply",
          "user_display_name": "Jane Smith",
          "replies": []
        }
      ]
    }
  ],
  "count": 2
}
```

### Error Response
```json
{
  "error": "Forbidden",
  "message": "You can only edit your own comments"
}
```

## Next Steps

1. **Apply Database Migration**
   ```bash
   # Run the new migration on Supabase
   # Option 1: Via Supabase Dashboard SQL Editor
   # Copy/paste contents of 013_comment_count_functions.sql

   # Option 2: Via Supabase CLI
   supabase db push
   ```

2. **Start the Server**
   ```bash
   cd /home/user/IdeaHub/backend
   npm run dev
   ```

3. **Test the Endpoints**
   - Use the examples above
   - Check the full API docs for detailed testing scenarios

4. **Frontend Integration**
   - Implement comment display with nested structure
   - Add comment forms (create, reply, edit)
   - Handle authentication for protected actions
   - Implement moderation UI for flagged comments

## Testing Checklist

- [ ] GET comments returns nested structure
- [ ] POST creates top-level comment and increments count
- [ ] POST reply creates nested comment and increments count
- [ ] PATCH updates only author's own comments
- [ ] PATCH rejects updates from non-authors (403)
- [ ] DELETE removes comment + nested replies
- [ ] DELETE decrements count by total deleted
- [ ] DELETE rejects requests from non-authors (403)
- [ ] POST flag sets moderation flag
- [ ] All endpoints validate UUID format
- [ ] Content validation enforces 1-2000 characters
- [ ] User display names appear in all responses

## Common Issues

### Database Functions Not Found
**Error:** `function increment_comment_count(uuid) does not exist`

**Solution:** Run migration 013 on Supabase:
```sql
-- Run in Supabase SQL Editor
-- Copy contents from /home/user/IdeaHub/supabase/migrations/013_comment_count_functions.sql
```

### CORS Issues
**Error:** `Access to fetch blocked by CORS policy`

**Solution:** Ensure CORS is properly configured in backend server:
```typescript
// Already configured in server.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
```

### Authentication Errors
**Error:** `Unauthorized - Invalid or expired token`

**Solution:**
- Ensure valid Supabase auth token in Authorization header
- Format: `Bearer YOUR_SUPABASE_JWT_TOKEN`
- Token must not be expired

## Support

For detailed API documentation, see:
- `/home/user/IdeaHub/backend/docs/COMMENTS_API.md`

For database schema, see:
- `/home/user/IdeaHub/supabase/migrations/004_comments_table.sql`

For authentication middleware, see:
- `/home/user/IdeaHub/backend/src/middleware/auth.ts`
