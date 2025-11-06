# AI Ideas Hub - Planning Document

## Table of Contents
1. [Project Vision](#project-vision)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Required Tools](#required-tools)
5. [System Design](#system-design)
6. [Data Models](#data-models)
7. [Implementation Phases](#implementation-phases)
8. [Development Environment Setup](#development-environment-setup)

---

## Project Vision

### Overview
**AI Ideas Hub** is a closed-beta MVP platform showcasing **87 curated AI project ideas** specifically designed for adults with professional work experience who are cautious about AI adoption. The platform leverages the Anthropic Claude Code promotion (ending November 18, 2025) to drive user acquisition and project completion.

### Core Objectives
1. **Discovery**: Enable users to easily find AI project ideas relevant to their interests and skill level
2. **Engagement**: Foster discussion and feedback on ideas through comments and project sharing
3. **Accessibility**: Provide freemium access to encourage signup and credit utilization
4. **Catalyst**: Leverage Anthropic promotion to drive user acquisition and project completion
5. **Impact Measurement**: Track all key metrics to validate 4k projects goal
6. **Trust-Building**: Create a space where skeptics see real, practical use cases for AI

### Target Audience
- **Age**: 25–55 years old
- **Background**: Professionals with 5+ years work experience
- **Relationship with AI**: Curious but cautious; skeptical about practical applications
- **Goals**: Understand AI through hands-on experimentation; build projects without extensive coding
- **Pain Points**: Information overload; uncertainty about where to start; AI skepticism

### Campaign Goals
- **Primary Goal**: 4,000 projects completed by November 18, 2025
- **Secondary Goals**:
  - 500+ user registrations
  - 1,000+ total comments
  - 30%+ engagement rate (users who comment or share projects)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   React 18 + Vite + Tailwind CSS + shadcn/ui        │  │
│  │                                                       │  │
│  │  - Idea Browser & Search                            │  │
│  │  - User Authentication UI                           │  │
│  │  - Comments & Project Showcase                      │  │
│  │  - Admin Metrics Dashboard                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ RESTful API / WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   Node.js (v18+) + Express.js                       │  │
│  │                                                       │  │
│  │  - API Routes (Ideas, Comments, Projects)           │  │
│  │  - Authentication Middleware                        │  │
│  │  - Analytics & Metrics Collection                   │  │
│  │  - Access Control (Tiered Logic)                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ SQL Queries / Real-time
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Database Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   Supabase (PostgreSQL + Auth + Real-time)          │  │
│  │                                                       │  │
│  │  - Users & Authentication                           │  │
│  │  - Ideas Repository                                 │  │
│  │  - Comments (Nested)                                │  │
│  │  - Project Links                                    │  │
│  │  - Analytics & Metrics                              │  │
│  │  - News Banners                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Patterns

1. **Tiered Access System**
   - Guest users: 5 free ideas + BuyButton sneak peek
   - Registered users: Full 87 ideas + comprehensive guides
   - Row-level security (RLS) policies in Supabase

2. **Real-time Features**
   - Live metrics updates using Supabase real-time subscriptions
   - Real-time comment threads
   - Live project count tracking

3. **Stateless API Design**
   - JWT-based authentication via Supabase
   - RESTful endpoints for CRUD operations
   - Server-side filtering and pagination

---

## Technology Stack

### Frontend

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | React 18+ | UI component library and rendering |
| **Build Tool** | Vite | Fast development server and build process |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **UI Components** | shadcn/ui | Pre-built accessible component library |
| **State Management** | React Hooks + Context API | Application state management |
| **Package Manager** | npm or pnpm | Dependency management |
| **Routing** | React Router v6 | Client-side routing |

### Backend

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Runtime** | Node.js v18+ | Server-side JavaScript runtime |
| **Framework** | Express.js | Web application framework |
| **API Style** | RESTful | HTTP-based API architecture |
| **Authentication** | Supabase Auth | User authentication and session management |
| **Middleware** | CORS, Helmet, Morgan | Security and logging |

### Database & Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Database** | Supabase (PostgreSQL) | Primary data store |
| **Authentication** | Supabase Auth | User auth with email/password |
| **Real-time** | Supabase Real-time | WebSocket subscriptions |
| **Storage** | Supabase Storage (if needed) | File uploads (future) |
| **Deployment (Frontend)** | Vercel or Netlify | Static site hosting |
| **Deployment (Backend)** | Vercel Functions, Railway, or Fly.io | API hosting |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Git** | Version control |
| **ESLint** | JavaScript linting |
| **Prettier** | Code formatting |
| **TypeScript** (optional) | Type safety |
| **Postman/Thunder Client** | API testing |
| **React DevTools** | Frontend debugging |

---

## Required Tools

### Essential Development Tools

#### 1. Node.js & npm
- **Version**: Node.js v18+ (LTS recommended)
- **Purpose**: Runtime for backend and build tools
- **Installation**: https://nodejs.org/

#### 2. Code Editor
- **Recommended**: VS Code
- **Extensions**:
  - ESLint
  - Prettier - Code formatter
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - GitLens

#### 3. Git
- **Version**: Latest stable
- **Purpose**: Version control
- **Installation**: https://git-scm.com/

#### 4. Supabase CLI (Optional but Recommended)
- **Purpose**: Local development and migrations
- **Installation**: `npm install -g supabase`

### AI Development Tools (Referenced in Ideas)

| Tool | Purpose | Cost |
|------|---------|------|
| **Claude Code** | AI-powered coding agent | Free credits via Anthropic promotion |
| **Bolt** | Rapid prototyping tool | Varies |
| **Lovable** | Visual UI builder | Varies |
| **Google AI Studio** | AI experimentation platform | Free tier available |

### External Services & Accounts

1. **Supabase Account**
   - URL: https://supabase.com
   - Purpose: Database, authentication, real-time subscriptions
   - Plan: Free tier sufficient for MVP

2. **Vercel Account** (or Netlify)
   - URL: https://vercel.com
   - Purpose: Frontend and serverless function deployment
   - Plan: Free tier sufficient for MVP

3. **GitHub Account**
   - Purpose: Code repository and collaboration
   - Required for deployment integration

### Optional Tools for Enhanced Development

- **Docker**: Containerization for local Supabase instance
- **Postman**: API testing and documentation
- **Figma**: UI/UX design mockups
- **Analytics Tools**: Google Analytics, Plausible, or similar

---

## System Design

### Core Feature Modules

#### 1. Authentication Module
- Email/password signup and login
- Session management via Supabase JWT
- Protected routes for authenticated users
- Guest access with limited permissions

#### 2. Ideas Repository Module
- **Components**:
  - Idea List View (grid/list)
  - Category Filter
  - Full-text Search
  - Idea Detail View
- **Features**:
  - 87 ideas with metadata
  - Tiered access control
  - View count tracking

#### 3. Comments Module
- **Components**:
  - Comment Thread
  - Comment Form
  - Nested Replies
- **Features**:
  - CRUD operations
  - Real-time updates
  - Basic moderation (flagging)

#### 4. Project Showcase Module
- **Components**:
  - Project List
  - Project Submission Form
- **Features**:
  - User-submitted project links
  - Tool tagging
  - Project count tracking

#### 5. Metrics & Analytics Module
- **Admin Dashboard**:
  - Real-time metrics display
  - Progress toward 4k goal
  - User engagement stats
  - Tool usage breakdown
- **Tracking**:
  - Page views
  - Registrations
  - Comment activity
  - Project submissions

#### 6. News Banner Module
- Admin-managed content
- Dismissible by users
- Expiration dates
- Campaign messaging

---

## Data Models

### Core Schemas

#### Ideas Table
```sql
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  difficulty VARCHAR(50) NOT NULL, -- Beginner, Intermediate, Advanced
  tools TEXT[], -- Array of tool names
  tags TEXT[],
  monetization_potential TEXT,
  estimated_build_time VARCHAR(50),
  free_tier BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  project_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  tier VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Comments Table
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  flagged_for_moderation BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Project Links Table
```sql
CREATE TABLE project_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  description VARCHAR(200),
  tools_used TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Page Views Table (Analytics)
```sql
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  page VARCHAR(100) NOT NULL,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

#### News Banners Table
```sql
CREATE TABLE news_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  link VARCHAR(500),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

### Row-Level Security (RLS) Policies

```sql
-- Ideas: Public read for free tier, full read for authenticated
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Comments: Read for all, write for authenticated only
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Project Links: Read for all, write for authenticated only
ALTER TABLE project_links ENABLE ROW LEVEL SECURITY;
```

---

## Implementation Phases

### Phase 1: MVP Foundation (Weeks 1–4)

#### Week 1: Project Setup & Infrastructure
- [ ] Initialize Git repository
- [ ] Set up Node.js backend with Express
- [ ] Configure Supabase project
- [ ] Set up React frontend with Vite
- [ ] Configure Tailwind CSS and shadcn/ui
- [ ] Establish basic folder structure

#### Week 2: Authentication & Database
- [ ] Implement Supabase Auth integration
- [ ] Create database schemas
- [ ] Set up RLS policies
- [ ] Build signup/login UI
- [ ] Create user profile management

#### Week 3: Ideas Repository & Discovery
- [ ] Seed database with 87 ideas
- [ ] Build idea list view with pagination
- [ ] Implement category filtering
- [ ] Create full-text search
- [ ] Build idea detail page
- [ ] Implement tiered access logic

#### Week 4: Comments & Project Showcase
- [ ] Build comments CRUD operations
- [ ] Implement nested comment UI
- [ ] Create project submission form
- [ ] Build project showcase display
- [ ] Add basic analytics tracking

### Phase 2: Polish & Metrics (Weeks 4–5)

#### Week 5: Dashboard & Campaign Features
- [ ] Build admin metrics dashboard
- [ ] Implement real-time metrics updates
- [ ] Create news banner system
- [ ] Add Anthropic campaign messaging
- [ ] Polish UI/UX across all pages
- [ ] Implement responsive design

### Phase 3: Testing & Launch (Weeks 5–6)

#### Week 6: Beta Launch
- [ ] Perform end-to-end testing
- [ ] Fix critical bugs
- [ ] Deploy to production
- [ ] Onboard beta testers
- [ ] Monitor metrics and performance
- [ ] Iterate based on feedback

---

## Development Environment Setup

### Initial Setup Steps

#### 1. Clone Repository
```bash
git clone <repository-url>
cd IdeaHub
```

#### 2. Backend Setup
```bash
# Navigate to backend directory (if separated)
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_KEY
# - PORT

# Start development server
npm run dev
```

#### 3. Frontend Setup
```bash
# Navigate to frontend directory (if separated)
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_API_URL

# Start development server
npm run dev
```

#### 4. Supabase Setup
```bash
# Initialize Supabase (if using local development)
supabase init

# Link to remote project
supabase link --project-ref <your-project-ref>

# Run migrations
supabase db push
```

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Analytics (optional)
ANALYTICS_ENABLED=true
```

#### Frontend (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=AI Ideas Hub
```

### Project Structure

```
IdeaHub/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── ideas.js
│   │   │   ├── comments.js
│   │   │   ├── projects.js
│   │   │   └── auth.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── utils/
│   │   │   └── supabase.js
│   │   └── server.js
│   ├── .env
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Ideas/
│   │   │   ├── Comments/
│   │   │   ├── Projects/
│   │   │   ├── Auth/
│   │   │   └── Dashboard/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── IdeaDetail.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── supabase/
│   └── migrations/
├── .gitignore
├── README.md
├── PLANNING.md
└── ai-ideas-hub-prd-v2.md
```

---

## Success Criteria

### MVP Launch Criteria
- [ ] All 87 ideas seeded and browsable
- [ ] Authentication fully functional
- [ ] Comments system operational
- [ ] Project showcase working
- [ ] Metrics tracking implemented
- [ ] Tiered access enforced
- [ ] Responsive design complete
- [ ] Zero critical bugs

### Campaign Success Metrics
- **Primary**: 4,000 projects completed by November 18, 2025
- **Secondary**:
  - 500+ registrations
  - 1,000+ comments
  - 30% engagement rate
  - 40% return visitor rate

---

## References

- **PRD Document**: `ai-ideas-hub-prd-v2.md`
- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com
- **Express.js**: https://expressjs.com

---

**Document Version**: 1.0
**Created**: November 6, 2025
**Status**: Ready for Development
**Next Steps**: Begin Phase 1 implementation
