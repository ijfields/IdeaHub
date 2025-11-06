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
