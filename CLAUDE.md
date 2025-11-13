# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working in This Repository

**Always read PLANNING.md at the start of every new conversation.**

**Check TASKS.md before starting work, mark completed tasks immediately, and add newly discovered tasks as you go.**

## Project Overview

**AI Ideas Hub** is a closed-beta MVP platform showcasing 87 curated AI project ideas for professionals cautious about AI adoption. The platform leverages the Anthropic Claude Code promotion (ending November 18, 2025) to drive user acquisition with a campaign goal of **4,000 projects completed** by campaign end.

### Target Audience
Adults 25-55 with 5+ years professional experience who are curious but cautious about AI. They want to understand AI through hands-on experimentation using free Anthropic credits.

### Campaign Context
- Promotion ends: November 18, 2025
- Main KPI: 4,000 projects built by campaign end
- Secondary KPIs: 500+ registrations, 1,000+ comments, 30%+ engagement rate

## Tech Stack

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React hooks + Context API
- **Package Manager**: npm or pnpm

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **API**: RESTful
- **Authentication**: Supabase Auth

### Database
- **Platform**: Supabase (PostgreSQL)
- **Features**: Row-level security (RLS) policies, real-time subscriptions for live metrics

### Deployment
- **Frontend**: Vercel or Netlify
- **Backend**: Vercel Functions, Railway, or Fly.io
- **Database**: Supabase (managed)

## Core Architecture Concepts

### Tiered Access Model
The platform has a unique two-tier access system that gates content:

**Free Tier (No Login Required)**
- Access to 5 curated ideas only:
  1. Africana History Quiz & Trivia Platform
  2. Personal Finance Dashboard
  3. Habit Tracker with Analytics
  4. Social Media Content Repurposer
  5. Africana Community Event Planner
- BuyButton idea shown in "sneak peek" mode (simple overview only)
- Read-only view of existing comments
- Prominent sign-up CTAs

**Registered Tier (After Login)**
- Full access to all 87 ideas across 13 categories
- Full BuyButton comprehensive implementation guide
- Ability to read and write comments
- Ability to share project links
- Full access to news banner

### The BuyButton Special Case
BuyButton is a special idea with tiered content detail:
- **Guest view**: Shows only problem statement, basic solution, "why it matters" + signup CTA
- **Registered view**: Shows full implementation guide with step-by-step instructions, code architecture, monetization strategy, and estimated build time

This is the PRIMARY conversion hook to drive signups.

### Ideas Repository Structure
87 total ideas organized into 13 categories:
1. B2B SaaS Tools (3 ideas)
2. Book Club & Reading (3 ideas)
3. Community & Cultural Groups (3 ideas)
4. Community Building (3 ideas)
5. Education & Learning (6 ideas)
6. Education & Teaching (3 ideas)
7. Games and Puzzles (3 ideas)
8. Health & Wellness (3 ideas)
9. Marketing & Content Creation (6 ideas)
10. Niche Community Tools (3 ideas)
11. Personal Productivity & Finance (6 ideas)
12. Projects in Development (3 ideas)
13. Think Tank & Research (3 ideas)

## Critical Data Models

### Ideas
```
id, title, description, category, difficulty, tools[], tags[],
monetization_potential, estimated_build_time, view_count,
comment_count, project_count, free_tier (boolean)
```
- `free_tier` flag determines if idea is visible to guests
- Difficulty levels: Beginner, Intermediate, Advanced
- Tools array includes: Claude, Bolt, Lovable, Google Studio, etc.

### Comments
```
id, idea_id, user_id, parent_comment_id, content, created_at,
updated_at, flagged_for_moderation
```
- Supports nested comments via `parent_comment_id`
- Top-level comments have `parent_comment_id = null`

### ProjectLinks
```
id, idea_id, user_id, title, url, description, tools_used[],
created_at, updated_at
```
- Tracks user implementations of ideas
- `tools_used` array enables metrics on Claude vs Bolt vs Lovable usage
- Critical for tracking progress toward 4,000 projects goal

### Users
```
id (from Supabase Auth), email, display_name, bio,
created_at, updated_at, tier
```
- Tier is currently "free" (premium reserved for future)
- Supabase Auth handles authentication

### Metrics/Analytics
```
PageView { id, user_id, page, idea_id, timestamp }
Metric { id, metric_key, metric_value, date, timestamp }
```
- Tracks all key metrics for campaign success measurement
- Metrics include: registrations, comments, project links, tool usage breakdown

## Key Implementation Considerations

### Access Control Logic
Implement RLS policies in Supabase to enforce tiered access:
- Ideas table: Filter by `free_tier = true` for unauthenticated users
- BuyButton idea: Return different content based on authentication status
- Comments/ProjectLinks: Require authentication for writes, allow read for all

### Metrics Tracking Strategy
All user actions must update relevant metrics:
- Idea views → increment `view_count` on Ideas table + create PageView record
- Comments → increment `comment_count` on Ideas table
- Project submissions → increment `project_count` on Ideas table + update campaign progress

Campaign progress dashboard must show:
- Real-time counter toward 4,000 projects goal
- Tool usage breakdown (Claude, Bolt, Lovable mentions)
- Registrations, comments, engagement rates

### Search & Discovery
Implement full-text search across:
- Idea titles
- Descriptions
- Tool tags
- Category filters (multi-select)
- Difficulty levels

### Tool Discussion Encouragement
The platform should encourage discussion of AI tools:
- Tag ideas with recommended tools
- Comment prompts: "Which tool did you use?" / "What was your credit usage?"
- Project submission form: Multi-select for tools used
- Enables comparison of Claude vs Bolt vs Lovable for different use cases

## Development Phases

### Phase 1: MVP Foundation (Weeks 1-4)
1. Setup: Node.js, Express, Supabase, React, Tailwind, shadcn/ui
2. Authentication (Supabase Auth)
3. Ideas list, search, category filter
4. Idea detail page
5. Comments system (nested, CRUD)
6. Project links system (CRUD)
7. Tiered access logic (5 free ideas + BuyButton preview)
8. Basic metrics tracking

### Phase 2: Campaign Launch (Weeks 4-5)
1. Polish UI/UX
2. Metrics dashboard
3. News banner
4. Anthropic promotion messaging
5. Beta tester onboarding

### Phase 3: Launch & Monitoring (Weeks 5-6)
1. Open closed beta
2. Monitor metrics toward 4k goal
3. Iterate based on feedback

## Important PRD Reference

The complete Product Requirements Document is located at: `ai-ideas-hub-prd-v2.md`

Refer to this document for:
- Complete list of all 87 ideas (Appendix A)
- Detailed user flows
- Success metrics and KPIs
- Risk mitigation strategies
- Campaign messaging and CTAs
- BuyButton full implementation guide example

---

## Development Sessions History

### Session 1: Subagent Orchestration Setup (November 6, 2025)

**Approach:** Subagent Orchestration Strategy
- Used specialized subagents for each major task to preserve main context window
- Main agent coordinated and tracked progress across all subagents
- Successfully preserved ~97k tokens of available context throughout session

**Accomplishments:**

#### Milestone 1: Environment & Tooling Setup (7/7 tasks completed)
1. ✅ **Frontend Initialization** - Vite + React 19 + TypeScript
   - Subagent created complete project structure with ESLint
   - Verified dev server functionality
   
2. ✅ **Tailwind CSS Configuration** - Professional custom theme
   - Custom color palette (primary, secondary, accent)
   - Dark mode support (class-based)
   - Custom typography and animations
   
3. ✅ **shadcn/ui Integration** - 5 core UI components
   - Button, Card, Input, Label, Badge components
   - Path aliases (@/) configured
   - CSS variables for theming
   
4. ✅ **Backend Initialization** - Node.js + Express + TypeScript
   - Organized project structure (routes, middleware, utils, config)
   - Health check and API endpoints
   - JWT authentication middleware for Supabase
   
5. ✅ **TypeScript Migration** - Both frontend and backend
   - Strict mode enabled for type safety
   - All files migrated (.jsx→.tsx, .js→.ts)
   - Full build verification
   
6. ✅ **Environment Configuration** - .env.example files
   - Comprehensive documentation for all variables
   - Supabase integration ready
   - Frontend (VITE_ prefixed) and backend variables
   
7. ✅ **Code Quality Tools** - Prettier + ESLint
   - Professional code style configuration
   - Integration between Prettier and ESLint
   - Format scripts for both projects

#### Milestone 1: Supabase Database Setup (10/10 tasks completed)
1. ✅ **Database Schema** - 12 migration files (1,570 lines SQL)
   - 7 tables: ideas, users, comments, project_links, page_views, metrics, news_banners
   - Row Level Security (RLS) policies for tiered access
   - 40+ performance indexes
   - 10 helper functions for common operations
   
2. ✅ **Seed Data** - 10 sample ideas
   - 5 free-tier ideas (accessible to guests)
   - BuyButton conversion hook idea
   - 4 additional premium ideas
   
3. ✅ **Migration Tools** - Automated and manual options
   - Consolidated migration file (all-migrations.sql)
   - Migration runner script
   - Comprehensive SUPABASE_SETUP.md guide
   
4. ✅ **Database Deployment** - Successfully executed in Supabase
   - All tables created with proper constraints
   - RLS policies active and tested
   - Seed data inserted
   - Fixed typo bug (monotization → monetization)

#### Project Documentation (2/2 tasks completed)
1. ✅ **README.md** - Comprehensive project overview (342 lines)
2. ✅ **Environment Documentation** - Setup guides for both frontend and backend

**Statistics:**
- **Total Files Created:** 50+ files
- **Code Written:** ~6,000 lines (migrations, TypeScript, configs)
- **Git Commits:** 7 commits
- **Context Efficiency:** Preserved 97k/200k tokens using subagent orchestration
- **Session Duration:** ~3 hours
- **Tasks Completed:** 19/19 in Milestone 1

**Key Learnings:**
- Subagent orchestration highly effective for complex multi-step tasks
- Each subagent preserved detailed context for its specific domain
- Main agent successfully coordinated across all work streams
- Git hooks helped maintain code quality (caught untracked files)
- Branch protection required PR workflow instead of direct main pushes

**Next Sessions:**
- Other sessions built complete backend API (27 endpoints, 5 routers, ~2,200 lines)
- Other sessions built complete frontend (8 pages, 49 TypeScript files, ~3,800 lines)
- All work successfully merged to main branch

**Branch Created:**
- `claude/setup-subagent-orchestration-011CUs9jEpxFsJaYYoL3TDg3`
- Successfully merged via PR to main

---

### Session 2: Styling Fixes & React 18 Downgrade (November 2025)

**Branch:** `downgrade-react-18`  
**Focus:** Fix Tailwind CSS v4 configuration, resolve React Query errors, restore professional styling

**Problems Solved:**

1. **Tailwind CSS v4 Configuration**
   - Fixed CSS compilation by updating from old v3 syntax (`@tailwind base;`) to v4 syntax (`@import "tailwindcss";`)
   - This was causing all styles to fail to compile, resulting in unstyled HTML

2. **React Query API Client Errors**
   - Fixed `TypeError: Cannot read properties of undefined (reading 'client')`
   - Root cause: Methods destructured from class instance lost `this` context
   - Solution: Used `.call(apiClientInstance, ...)` to explicitly bind `this` for all exported wrapper functions

3. **React 19 Compatibility Issues**
   - Downgraded React and React DOM from 19.1.1 to 18.3.1
   - React Query v5 works better with React 18.x
   - Resolved context provider and error boundary issues

4. **Radix UI Select Component**
   - Fixed error: `Select.Item` cannot have empty string value
   - Changed `value=""` to `value="all"` and updated all filter logic

5. **Accessibility Warnings**
   - Added `SheetDescription` component to fix Radix UI accessibility warnings

**Key Changes:**
- Updated `frontend/src/index.css` to Tailwind v4 syntax
- Fixed API client method binding in `frontend/src/lib/api-client.ts`
- Updated all gradient buttons to use `.btn-gradient-link` CSS class
- Created `/theme-test` static page for styling verification
- Fixed Select component in IdeasList page

**Files Modified:** 15+ files  
**New Files:** ThemeTest.tsx, SESSION_SUMMARY_STYLING_FIXES.md  
**Status:** ✅ Styling working, ready for testing

**Key Learnings:**
- Tailwind CSS v4 uses `@import "tailwindcss";` not `@tailwind` directives
- React 18 is more stable with React Query v5 than React 19
- Method binding requires explicit `.call()` when exporting wrapper functions
- Static test pages help isolate styling from API issues

---

### Session 3: Authentication & Account Issues Fixes (November 2025)

**Branch:** `downgrade-react-18`  
**Focus:** Fix authentication hanging, logout issues, blank cards, comment submission, and markdown rendering

**Problems Solved:**

1. **Login Hanging After Successful Authentication**
   - Added 5-second timeout to `fetchProfile` function
   - Ensured `setLoading(false)` always completes, even if profile fetch fails/hangs
   - Added proper error handling with `.catch()` and `.finally()` blocks

2. **Logout Not Working**
   - Clear local state FIRST before attempting Supabase signOut
   - Added 3-second timeout to signOut operation
   - Ensured UI updates immediately even if Supabase call hangs

3. **Blank Cards on Profile/Settings/Dashboard Pages**
   - Profile page: Allow rendering even if `profile` is null, use `user.email` as fallback
   - Settings/Dashboard: Check `authLoading` state and show appropriate loading/error states
   - Added fallback values for all profile-dependent fields

4. **Comments Showing "Anonymous"**
   - Updated backend GET comments route to return `user: { display_name, email }` structure
   - Added fallback fetch for user data if join doesn't return it
   - Fixed optimistic update in `useCreateComment` to use actual user data

5. **Comment Update Failing**
   - Added `PUT /api/comments/:id` route matching frontend expectations
   - Added same user data fetching logic as create route
   - Added extensive logging for debugging

6. **Markdown Not Rendering**
   - Removed "Markdown is supported" text (users won't know markdown)
   - Plan to add rich text editor in future instead of markdown

7. **Comments Appearing in Edit Mode Automatically**
   - Added `useEffect` to clear edit state if comment being edited no longer exists
   - Improved edit state management to prevent stale state

**Key Changes:**
- Backend: Updated comment routes to return consistent user data structure, added PUT route
- Frontend: Added timeouts to all async auth operations, improved error handling, added fallback rendering
- Files Modified: 20+ files across backend and frontend

**Key Learnings:**
- Always add timeouts to async operations to prevent UI hanging
- Clear local state before server calls (especially logout)
- Use fallback values so pages render even if optional data fails to load
- Match API data structures between backend and frontend
- Handle loading states properly before rendering protected content
- Use `supabaseAdmin` for backend operations to bypass RLS

**Documentation Created:**
- `docs/SESSION_SUMMARY_AUTH_FIXES.md` - Detailed session summary
- `docs/AUTH_ACCOUNT_RULES.md` - Rules and patterns to prevent auth/account issues

**Status:** ✅ All critical auth/account issues resolved, ready for testing

---

### Session 4: Backend API Routes & Profile Page Fixes (November 12, 2025)

**Branch:** `downgrade-react-18`  
**Focus:** Fix backend API route errors, logout auto-login issue, empty profile pages, and UI standardization

**Problems Solved:**

1. **Backend API Route Errors**
   - Fixed GET `/api/ideas/:ideaId/projects` 404 error (moved route to ideas router, placed before `/:id`)
   - Fixed POST `/api/projects` 500 error (changed to use `supabaseAdmin` for RLS bypass)
   - Added POST `/api/ideas/:id/view` route for view count increment
   - Added `/analytics` alias to `/metrics` router for frontend compatibility
   - Added `/pageview` route alias in addition to `/page-view`

2. **Logout Auto-Login Issue**
   - Fixed users being automatically logged back in after logout
   - Root cause: State cleared before Supabase signOut, session remained in localStorage
   - Solution: Sign out from Supabase FIRST, then clear state and manually clear localStorage

3. **Empty Profile Pages**
   - Fixed Profile, Dashboard, and Settings pages showing empty cards
   - Added proper user existence checks before rendering
   - Improved fallback values (displayName defaults to 'User' if email missing)
   - Better error handling for missing profile data
   - Pages now render content even when profile is null

4. **UI/UX Standardization**
   - Standardized button styling with `btn-gradient` class on Sign In, Create Account, Submit Project buttons
   - Fixed dialog overlay transparency (solid background for forms)
   - Improved form spacing in project submission dialog

5. **Project URL Validation**
   - Added validation to prevent localhost project URLs from opening
   - Shows error message for invalid localhost URLs instead of broken links

6. **API Client Fixes**
   - Fixed `createProject` endpoint to use correct `/projects` route with `idea_id` in body
   - Updated backend default port to 3000 (was 3001)

**Key Changes:**
- Backend: Updated all projects router queries to use `supabaseAdmin`, fixed route mounting
- Frontend: Improved auth context signOut logic, added localStorage clearing, improved profile page rendering
- Files Modified: 15+ files across backend and frontend

**Documentation Created:**
- `docs/BUGFIXES.md` - Comprehensive bug fixes tracking log
- Updated `docs/testing on downgrade-react-18.md` with fixed issues

**Key Learnings:**
- Always use `supabaseAdmin` for backend operations to bypass RLS
- Sign out from Supabase before clearing local state to prevent session restoration
- Manually clear localStorage session keys to prevent auto-login
- Place more specific routes before less specific ones in Express (e.g., `/:ideaId/projects` before `/:id`)
- Ensure pages render content even when optional data (like profile) is missing

**Status:** ✅ All API routes working, logout fixed, profile pages rendering correctly

---

## Tips for Future Sessions

### Using Subagent Orchestration
When working on complex tasks:
1. Create a todo list with TodoWrite to track progress
2. Launch specialized subagents for each major task
3. Use the main context to coordinate and verify results
4. Mark todos complete immediately after each task
5. Preserve context by delegating heavy work to subagents

### Git Workflow
- Always work on `claude/` prefixed branches with session ID
- Cannot push directly to `main` - use PR workflow
- Git hooks check for untracked files before stopping
- Clean up merged branches periodically

### Environment Setup
- Backend .env in `/backend/.env`
- Frontend .env in `/frontend/.env`
- Both .env files are gitignored for security
- Use .env.example as templates

### Database Migrations
- Individual migrations in `/supabase/migrations/`
- Consolidated file at `/supabase/all-migrations.sql`
- Run via Supabase Dashboard SQL Editor
- Test queries to verify after migration

### Authentication & Account Management
- **Always read `docs/AUTH_ACCOUNT_RULES.md` before working on auth/account features**
- Never block UI on async operations - always add timeouts
- Clear local state before server calls (especially logout)
- Use fallback values so pages render even if optional data fails
- Match API data structures between backend and frontend
- Handle loading states properly before rendering protected content
- Use `supabaseAdmin` for backend operations to bypass RLS

