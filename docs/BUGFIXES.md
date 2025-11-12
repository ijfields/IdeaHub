# Bug Fixes Log

This document tracks bug fixes and improvements made to the AI Ideas Hub platform.

## 2025-11-12 - Authentication & Profile Page Fixes

### Issues Fixed

#### 1. Logout Auto-Login Issue
**Problem**: After clicking logout, users were automatically logged back in.

**Root Cause**: The `signOut` function was clearing local state before signing out from Supabase, and the session remained in localStorage, causing `onAuthStateChange` to restore the user.

**Solution**:
- Changed `signOut` to sign out from Supabase FIRST, then clear state
- Added manual localStorage clearing to remove all Supabase session keys
- Clear state even on signOut errors/exceptions to ensure UI updates

**Files Changed**:
- `frontend/src/context/AuthContext.tsx`

#### 2. Empty Profile Pages
**Problem**: Profile, Dashboard, and Settings pages showed empty cards with no content.

**Root Cause**: Pages weren't properly handling cases where:
- User exists but profile data is null
- User data is missing or incomplete
- Data fetching fails silently

**Solution**:
- Added user existence checks before rendering content
- Improved fallback values (displayName defaults to 'User' if email missing)
- Better error handling for missing profile data
- Ensured pages render content even when profile is null
- Added proper loading states and error boundaries

**Files Changed**:
- `frontend/src/pages/Profile.tsx`
- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/pages/Settings.tsx`

#### 3. Invalid Project URLs Opening Localhost
**Problem**: Clicking "View Project" from dashboard could open localhost URLs, causing broken state in new tabs.

**Solution**:
- Added validation to prevent project URLs starting with `http://localhost` or `https://localhost`
- Show error message for invalid localhost URLs instead of broken links
- Improved error handling for project fetching

**Files Changed**:
- `frontend/src/pages/Dashboard.tsx`

### Testing Notes

After these fixes:
- ✅ Logout should properly sign users out without auto-login
- ✅ Profile pages should display user information even if profile data is missing
- ✅ Dashboard should show projects and stats correctly
- ✅ Settings page should render properly
- ✅ Invalid project URLs should show error messages instead of opening broken links

### Known Issues

- Profile pages may still show empty cards if Supabase queries fail (check browser console for errors)
- Settings page route exists but may need additional content/features
- Category filtering from home page needs implementation
- BuyButton idea visibility needs verification

## 2025-11-12 - Backend API Route Fixes

### Issues Fixed

#### 1. GET /api/ideas/:ideaId/projects 404 Error
**Problem**: Frontend couldn't fetch projects for an idea.

**Root Cause**: Route was defined in projects router but mounted incorrectly, causing route conflicts.

**Solution**:
- Moved GET route to ideas router (where it logically belongs)
- Placed route before `/:id` route to avoid Express route conflicts
- Removed duplicate route from projects router

**Files Changed**:
- `backend/src/routes/ideas.ts`
- `backend/src/routes/projects.ts`
- `backend/src/routes/index.ts`

#### 2. POST /api/projects 500 Error
**Problem**: Creating a new project returned 500 Internal Server Error.

**Root Cause**: Projects router was using regular `supabase` client instead of `supabaseAdmin`, causing RLS (Row-Level Security) permission issues.

**Solution**:
- Changed all database operations in projects router to use `supabaseAdmin`
- Ensures proper permissions to insert/update/delete project_links
- Updated all queries (GET, POST, PATCH, DELETE) to use admin client

**Files Changed**:
- `backend/src/routes/projects.ts`

#### 3. POST /api/ideas/:id/view 404 Error
**Problem**: Frontend couldn't increment view count for ideas.

**Root Cause**: Route only existed as PATCH, but frontend was calling POST.

**Solution**:
- Added POST route handler for `/api/ideas/:id/view`
- Kept existing PATCH route for backward compatibility
- Both routes use `supabaseAdmin` for proper permissions

**Files Changed**:
- `backend/src/routes/ideas.ts`

#### 4. POST /api/analytics/pageview 404 Error
**Problem**: Frontend couldn't track page views.

**Root Cause**: Frontend was calling `/analytics/pageview` but backend only had `/metrics/page-view`.

**Solution**:
- Added `/analytics` alias to `/metrics` router in index.ts
- Added `/pageview` route alias in addition to `/page-view` in metrics router
- Both routes now work for frontend compatibility

**Files Changed**:
- `backend/src/routes/index.ts`
- `backend/src/routes/metrics.ts`

### Testing Notes

After these fixes:
- ✅ Projects can be fetched for ideas
- ✅ Projects can be created successfully
- ✅ View counts increment properly
- ✅ Page views are tracked correctly

