# AI Ideas Hub

A closed-beta MVP platform showcasing **87 curated AI project ideas** for professionals cautious about AI adoption. Built to leverage the Anthropic Claude Code promotion ending November 18, 2025.

## Project Overview

**AI Ideas Hub** helps adults with professional experience (ages 25-55) discover practical AI project ideas and start building with free Anthropic credits. The platform combines idea discovery, community discussion, and project showcase features to drive user adoption and project completion.

### Campaign Goals

- **Primary**: 4,000 projects completed by November 18, 2025
- **Secondary**:
  - 500+ user registrations
  - 1,000+ total comments
  - 30%+ engagement rate

### Key Features

- **87 Curated Ideas**: Organized into 13 categories from B2B SaaS to Education
- **Tiered Access**: 5 free ideas for guests, all 87 for registered users
- **Community Features**: Comments, project sharing, and discussion
- **Analytics Dashboard**: Real-time tracking of campaign progress
- **Tool Comparison**: Compare Claude, Bolt, Lovable, and other AI tools

## Tech Stack

### Frontend
- React 18+ with Vite
- Tailwind CSS + shadcn/ui
- React Router v6

### Backend
- Node.js v18+ with Express.js
- RESTful API architecture
- Supabase Auth for authentication

### Database
- Supabase (PostgreSQL)
- Row-level security (RLS)
- Real-time subscriptions

## Quick Start

### Prerequisites

- Node.js v18 or higher
- npm or pnpm
- Supabase account (free tier)
- Git

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd IdeaHub
```

2. **Set up Supabase**

Follow the comprehensive guide in `/docs/SUPABASE_SETUP.md` to:
- Create a Supabase project
- Obtain your credentials
- Run database migrations
- Set up Row Level Security

Quick migration setup:
```bash
# Make the migration script executable
chmod +x supabase/run-migrations.sh

# Run all migrations
./supabase/run-migrations.sh
```

3. **Configure Backend**

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
PORT=5000
```

4. **Configure Frontend**

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5000
```

5. **Start Development Servers**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` to see the app!

## Database Setup

### Running Migrations

We provide 12 migration files that set up your entire database schema:

1. `001_initial_schema.sql` - UUID extension and base configuration
2. `002_ideas_table.sql` - Ideas repository table
3. `003_users_table.sql` - User profiles extending Supabase Auth
4. `004_comments_table.sql` - Nested comments system
5. `005_project_links_table.sql` - User project submissions
6. `006_page_views_table.sql` - Analytics tracking
7. `007_metrics_table.sql` - Campaign metrics
8. `008_news_banners_table.sql` - Admin announcements
9. `009_row_level_security.sql` - RLS policies for tiered access
10. `010_database_indexes.sql` - Performance optimization
11. `011_helper_functions.sql` - Utility functions
12. `012_seed_data.sql` - Sample ideas (optional)

**Run all migrations at once:**
```bash
./supabase/run-migrations.sh
```

**Or run manually via Supabase CLI:**
```bash
supabase link --project-ref your-project-ref
supabase db push
```

**Or via Supabase Dashboard:**
- Navigate to SQL Editor
- Copy/paste each migration file
- Run in numerical order

### Verifying Setup

After migrations, verify in Supabase Dashboard:

1. **Table Editor**: Check all 7 tables exist (ideas, users, comments, project_links, page_views, metrics, news_banners)
2. **Authentication > Policies**: Verify RLS policies are active
3. **Database > Functions**: Check helper functions exist

## Project Structure

```
IdeaHub/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Auth & error handling
│   │   └── utils/          # Supabase client & helpers
│   └── package.json
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Helper functions
│   └── package.json
├── supabase/              # Database configuration
│   ├── migrations/        # SQL migration files
│   └── run-migrations.sh  # Migration runner script
├── docs/                  # Documentation
│   └── SUPABASE_SETUP.md  # Comprehensive setup guide
├── CLAUDE.md              # Claude Code instructions
├── PLANNING.md            # Architecture & planning
├── TASKS.md               # Development tasks
└── README.md              # This file
```

## Key Concepts

### Tiered Access System

The platform implements a two-tier access model:

**Free Tier (No Login)**
- Access to 5 curated ideas
- BuyButton idea in "sneak peek" mode
- Read-only comments
- Prominent signup CTAs

**Registered Tier (After Login)**
- All 87 ideas
- Full BuyButton implementation guide
- Create comments and share projects
- Access to metrics dashboard

This is enforced via Supabase Row Level Security (RLS) policies.

### The BuyButton Hook

The **BuyButton** idea is special:
- Guests see basic problem statement only
- Registered users see full implementation guide
- Primary conversion hook to drive signups

### Data Models

**Core Tables:**
- `ideas`: 87 AI project ideas with metadata
- `users`: User profiles extending Supabase Auth
- `comments`: Nested comment threads
- `project_links`: User-submitted projects
- `page_views`: Analytics tracking
- `metrics`: Campaign progress metrics
- `news_banners`: Admin announcements

See `/docs/SUPABASE_SETUP.md` for detailed schema information.

## Development

### Environment Variables

Never commit `.env` files! Add them to `.gitignore`.

**Backend requires:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `PORT`

**Frontend requires:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL`

### Database Helpers

We provide SQL helper functions for common operations:

```sql
-- Increment view count
SELECT increment_view_count('idea-uuid');

-- Record page view
SELECT record_page_view('user-uuid', 'idea-detail', 'idea-uuid');

-- Full-text search
SELECT * FROM search_ideas('personal finance');

-- Get campaign metrics
SELECT get_campaign_metrics();

-- Get trending ideas
SELECT * FROM get_trending_ideas(7);
```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Deployment

### Frontend (Vercel/Netlify)

1. Connect your Git repository
2. Set environment variables in dashboard
3. Deploy

### Backend (Vercel Functions/Railway/Fly.io)

1. Choose your hosting platform
2. Set environment variables
3. Deploy

### Database (Supabase)

Already managed! Just ensure your RLS policies are active in production.

## Documentation

- **[SUPABASE_SETUP.md](/docs/SUPABASE_SETUP.md)** - Complete Supabase setup guide
- **[PLANNING.md](/PLANNING.md)** - Architecture and planning details
- **[CLAUDE.md](/CLAUDE.md)** - Claude Code instructions
- **[TASKS.md](/TASKS.md)** - Development task tracking

## Contributing

This is a closed-beta project for the Anthropic campaign. Internal contributions only during beta phase.

## Security

- All API keys are environment variables
- Row Level Security (RLS) enabled on all tables
- Service role key used only server-side
- CORS configured for allowed origins
- Input validation on all user-generated content

## License

Proprietary - All rights reserved

## Support

For issues or questions:
1. Check `/docs/SUPABASE_SETUP.md` troubleshooting section
2. Review Supabase logs in dashboard
3. Consult PLANNING.md for architecture questions
4. Contact the development team

---

**Campaign Deadline**: November 18, 2025
**Goal**: 4,000 projects completed
**Let's build something amazing!**
