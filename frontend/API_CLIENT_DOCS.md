# API Client & React Query Setup Documentation

## Overview

This document describes the API client setup and React Query hooks for the AI Ideas Hub frontend application.

## Files Created

### 1. `/frontend/src/lib/query-client.ts`
Configured React Query client with sensible defaults:
- **Stale time**: 5 minutes
- **Cache time**: 10 minutes
- **Retry logic**: 3 attempts with exponential backoff
- **Refetch on window focus**: Enabled
- **Refetch on reconnect**: Enabled

### 2. `/frontend/src/lib/api-client.ts`
Axios-based API client with:
- **Base URL**: From `VITE_API_URL` environment variable
- **Authentication**: Automatic JWT token injection from Supabase
- **Request interceptors**: Add auth tokens to all requests
- **Response interceptors**: Handle common HTTP errors (401, 403, 404, 500)
- **Typed API functions**: Fully typed with TypeScript

### 3. `/frontend/src/hooks/useIdeas.ts`
React Query hooks for Ideas:
- `useIdeas(filters?)` - Fetch list of ideas with optional filters
- `useIdea(id)` - Fetch single idea by ID
- `useSearchIdeas(query)` - Search ideas by query string
- `incrementView(ideaId)` - Track idea views

### 4. `/frontend/src/hooks/useComments.ts`
React Query hooks for Comments with optimistic updates:
- `useComments(ideaId)` - Fetch comments for an idea
- `useCreateComment()` - Create new comment
- `useUpdateComment()` - Update existing comment
- `useDeleteComment()` - Delete comment

### 5. `/frontend/src/hooks/useProjects.ts`
React Query hooks for Project Links with optimistic updates:
- `useProjects(ideaId)` - Fetch projects for an idea
- `useCreateProject()` - Submit new project
- `useUpdateProject()` - Update existing project
- `useDeleteProject()` - Delete project

### 6. `/frontend/src/App.tsx` (Updated)
Wrapped entire app with `QueryClientProvider` to enable React Query throughout the application.

### 7. `/frontend/src/examples/api-usage-examples.tsx`
Comprehensive examples demonstrating how to use all hooks in real components.

## API Structure

### Base Configuration

```typescript
// Environment variables required
VITE_API_URL=http://localhost:3000
VITE_API_VERSION=v1
```

### API Endpoints

The API client expects the following REST endpoints:

#### Ideas
- `GET /api/v1/ideas` - List ideas with filters
- `GET /api/v1/ideas/:id` - Get single idea
- `GET /api/v1/ideas/search?q=query` - Search ideas
- `POST /api/v1/ideas/:id/view` - Increment view count

#### Comments
- `GET /api/v1/ideas/:ideaId/comments` - List comments for idea
- `POST /api/v1/ideas/:ideaId/comments` - Create comment
- `PUT /api/v1/comments/:id` - Update comment
- `DELETE /api/v1/comments/:id` - Delete comment

#### Projects
- `GET /api/v1/ideas/:ideaId/projects` - List projects for idea
- `POST /api/v1/ideas/:ideaId/projects` - Create project
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

#### User Profile
- `GET /api/v1/users/profile` - Get current user profile
- `PUT /api/v1/users/profile` - Update user profile

#### Analytics
- `POST /api/v1/analytics/pageview` - Track page view
- `GET /api/v1/analytics/metrics` - Get dashboard metrics

## Usage Examples

### Basic Query (Read Data)

```tsx
import { useIdeas } from '@/hooks/useIdeas';

function IdeasList() {
  const { data, isLoading, error } = useIdeas({
    category: 'Education',
    difficulty: 'Beginner',
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.data?.map(idea => (
        <li key={idea.id}>{idea.title}</li>
      ))}
    </ul>
  );
}
```

### Mutation (Write Data)

```tsx
import { useCreateComment } from '@/hooks/useComments';

function CommentForm({ ideaId }: { ideaId: string }) {
  const [content, setContent] = useState('');
  const createMutation = useCreateComment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createMutation.mutate(
      { ideaId, content },
      {
        onSuccess: () => {
          setContent('');
          console.log('Comment created!');
        },
        onError: (error) => {
          console.error('Failed to create comment:', error);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        type="submit"
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  );
}
```

### Filtering and Search

```tsx
import { useIdeas, useSearchIdeas } from '@/hooks/useIdeas';

function FilteredIdeas() {
  const [filters, setFilters] = useState({
    category: '',
    difficulty: 'Beginner',
    free_tier: true,
  });

  const { data } = useIdeas(filters);

  return (
    <div>
      <select
        value={filters.category}
        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
      >
        <option value="">All Categories</option>
        <option value="Education">Education</option>
        <option value="Marketing">Marketing</option>
      </select>

      {data?.data?.map(idea => (
        <div key={idea.id}>{idea.title}</div>
      ))}
    </div>
  );
}
```

## Key Features

### 1. Automatic Authentication
All API requests automatically include the JWT token from Supabase:

```typescript
// No manual token handling needed!
const { data } = useIdeas(); // Token automatically added
```

### 2. Optimistic Updates
Mutations update the UI immediately, then sync with the server:

```typescript
const createMutation = useCreateComment();

// UI updates immediately, then syncs with server
createMutation.mutate({ ideaId, content });
```

### 3. Automatic Cache Invalidation
Related queries are automatically invalidated after mutations:

```typescript
// Creating a comment invalidates:
// 1. Comments list for that idea
// 2. The idea itself (to update comment count)
useCreateComment();
```

### 4. Error Handling
Built-in error handling with console logging and rollback:

```typescript
// Errors are automatically logged
// Failed mutations rollback to previous state
const { error } = useIdeas();
if (error) {
  console.log(error.message); // User-friendly error message
}
```

### 5. Type Safety
Full TypeScript support throughout:

```typescript
import type { Idea, Comment, ProjectLink } from '@/hooks/useIdeas';

const { data } = useIdeas();
// data.data is fully typed as Idea[]
```

## Query Keys Structure

React Query uses query keys for caching. Here's the structure:

```typescript
// Ideas
['ideas'] - All ideas
['ideas', 'list'] - All idea lists
['ideas', 'list', filters] - Specific filtered list
['ideas', 'detail', id] - Single idea
['ideas', 'search', query] - Search results

// Comments
['comments'] - All comments
['comments', 'list', ideaId] - Comments for specific idea

// Projects
['projects'] - All projects
['projects', 'list', ideaId] - Projects for specific idea
```

## Best Practices

### 1. Use `enabled` option for conditional queries

```tsx
// Only fetch if ID is available
const { data } = useIdea(id, {
  enabled: !!id
});

// Only search if query is long enough
const { data } = useSearchIdeas(query, {
  enabled: query.length > 2
});
```

### 2. Handle loading and error states

```tsx
const { data, isLoading, error } = useIdeas();

if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (!data?.data) return <EmptyState />;

return <IdeasList ideas={data.data} />;
```

### 3. Use callbacks with mutations

```tsx
const mutation = useCreateComment();

mutation.mutate(
  { ideaId, content },
  {
    onSuccess: (data) => {
      toast.success('Comment posted!');
    },
    onError: (error) => {
      toast.error('Failed to post comment');
    },
  }
);
```

### 4. Leverage optimistic updates

All mutations (`useCreateComment`, `useUpdateComment`, etc.) include optimistic updates by default. The UI updates immediately for better UX.

### 5. Use React Query DevTools (optional)

Install and use React Query DevTools for debugging:

```bash
npm install @tanstack/react-query-devtools
```

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## Dependencies Added

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.90.7",
    "axios": "^1.7.9"
  }
}
```

## Environment Variables Required

```env
# Backend API Configuration
VITE_API_URL=http://localhost:3000
VITE_API_VERSION=v1

# Supabase Configuration (for authentication)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Testing the API Client

To test if the API client is working:

1. Ensure your backend API is running on `VITE_API_URL`
2. Import and use a hook in any component
3. Check browser console for any errors
4. Use React Query DevTools to inspect queries

## Troubleshooting

### Authentication Issues
- Ensure Supabase client is properly initialized
- Check that user is logged in before making authenticated requests
- Verify JWT token is being added to request headers

### CORS Errors
- Configure backend to allow requests from your frontend origin
- Add proper CORS headers on backend

### Type Errors
- Ensure types in `database.ts` match your actual database schema
- Run `npm run build` to check for TypeScript errors

### Network Errors
- Verify `VITE_API_URL` is correct
- Check that backend server is running
- Inspect Network tab in browser DevTools

## Next Steps

1. **Implement backend API** - Create Express routes matching the expected endpoints
2. **Add authentication** - Integrate Supabase Auth for protected routes
3. **Create UI components** - Build React components using these hooks
4. **Add error boundaries** - Catch and display errors gracefully
5. **Implement loading states** - Add skeletons and spinners
6. **Add toast notifications** - Show success/error messages to users

## Related Files

- `/frontend/src/types/database.ts` - TypeScript type definitions
- `/frontend/src/lib/supabase.ts` - Supabase client configuration
- `/frontend/src/examples/api-usage-examples.tsx` - Comprehensive examples

## Support

For issues or questions about the API client:
1. Check this documentation
2. Review the example components in `api-usage-examples.tsx`
3. Consult React Query docs: https://tanstack.com/query/latest
4. Check Axios docs: https://axios-http.com/docs/intro
