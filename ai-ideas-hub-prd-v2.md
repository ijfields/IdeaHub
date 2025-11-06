# Product Requirements Document (PRD)
## AI Ideas Hub - MVP (Updated)

---

## 1. Executive Summary

**Product Name:** AI Ideas Hub (working title)

**Objective:** Create a closed-beta MVP platform showcasing **87 curated AI project ideas** specifically designed for adults with professional work experience who are cautious about AI adoption. Leverage the **Anthropic Claude Code promotion** (ending November 18, 2025) to drive user acquisition and projects completed, targeting **4,000 projects built** by campaign end.

**Primary Value Proposition:**
- Searchable repository of 87 practical AI project ideas (mix of general AI projects + Africana-centered tools)
- **Tiered access model:** 5 free ideas + BuyButton sneak peek for guests; full access for registered users
- Community feedback mechanism (comments) for iterative idea refinement
- Real-time metrics tracking (registrations, posts, visits, projects completed)
- Integration with Anthropic's free credits as the core catalyst
- Hub for professionals skeptical about AI to learn through practical projects

**Target User:** Adults with professional work experience, skeptical about AI but interested in learning through practical projects

**MVP Go-Live:** Closed beta with targeted user outreach

**Campaign Goal:** 4,000 projects completed by end of Anthropic promotion period (November 18, 2025)

---

## 2. Product Vision & Goals

### 2.1 Vision
Build a community-driven platform where professionals discover, discuss, and prototype AI project ideas using free Anthropic credits—lowering the barrier to entry for skeptical AI adopters and creating a hub for new AI builders.

### 2.2 Goals
1. **Discovery:** Enable users to easily find AI project ideas relevant to their interests and skill level
2. **Engagement:** Foster discussion and feedback on ideas through comments and project sharing
3. **Accessibility:** Provide freemium access to encourage signup and credit utilization
4. **Catalyst:** Leverage Anthropic promotion to drive user acquisition and project completion
5. **Impact Measurement:** Track all key metrics to validate 4k projects goal and inform future roadmap
6. **Trust-Building:** Create a space where skeptics see real, practical use cases for AI

---

## 3. Ideas Repository Overview

### 3.1 Total Ideas: 87
- **20 ideas** from Claude Code Promotion (non-coder, monetizable projects)
- **66 ideas** from Knubia Platform (22 groups × 3 ideas each; Africana-centered tools)
- **1 idea** (BuyButton - special idea with tiered content detail)

### 3.2 Category Structure (13 categories)
1. **B2B SaaS Tools** - Business automation and productivity software
2. **Book Club & Reading** - Literature discussion and curation platforms
3. **Community & Cultural Groups** - Media, podcasts, and cultural archives
4. **Community Building** - Event planning, mentorship, skill directories
5. **Education & Learning** - Personal development and upskilling
6. **Education & Teaching** - Classroom tools and lesson planning
7. **Games and Puzzles** - Interactive entertainment and learning
8. **Health & Wellness** - Mental health, fitness, and habit tracking
9. **Marketing & Content Creation** - Social media, email, repurposing tools
10. **Niche Community Tools** - Specialized tools for specific audiences
11. **Personal Productivity & Finance** - Expense tracking, note-taking, organization
12. **Projects in Development** - Project management and fundraising tools
13. **Think Tank & Research** - Academic collaboration and policy tools

### 3.3 Complete Ideas List (Abbreviated)

**Free Tier Access (Guests - 5 ideas + BuyButton sneak peek):**
1. Africana History Quiz & Trivia Platform
2. Personal Finance Dashboard
3. Habit Tracker with Analytics
4. Social Media Content Repurposer
5. Africana Community Event Planner
6. 🔐 BuyButton (Sneak Peek - Simple Overview Only)

**Full Access (Registered Users - All 87 ideas)**
*See Appendix A for complete 87-idea list organized by category*

---

## 4. Target Audience

### 4.1 Primary Persona
- **Age:** 25–55 years old
- **Background:** Professionals with 5+ years work experience (managers, entrepreneurs, creatives, technologists)
- **Relationship with AI:** Curious but cautious; heard AI hype but skeptical about practical applications
- **Goals:** Understand AI through hands-on experimentation; build projects without extensive coding; leverage free Anthropic credits
- **Pain Points:** Information overload; uncertainty about where to start; AI skepticism; limited technical skills

### 4.2 User Segments
- **Segment 1 - "The Skeptic":** Wants proof AI is useful; seeks real-world examples from peers
- **Segment 2 - "The Learner":** Interested in upskilling; needs structured guidance and free resources
- **Segment 3 - "The Builder":** Wants to prototype quickly; concerned about credit usage and maximizing ROI
- **Segment 4 - "The Africana Advocate":** Focused on culturally-grounded tools; building for diaspora communities

---

## 5. Tiered Access Model & BuyButton Strategy

### 5.1 Access Tiers

#### Free Tier (No Login Required)
- **Access:** 5 curated ideas + BuyButton sneak peek
- **Features:**
  - Browse 5 featured ideas across categories
  - Read-only view of existing comments
  - View BuyButton "Simple Overview" (problem statement, basic solution, why it matters)
  - Sign-up CTA prominent on each idea

**5 Free-Tier Ideas (Curated for Broad Appeal):**
1. Africana History Quiz & Trivia Platform *(Games - broad appeal)*
2. Personal Finance Dashboard *(Finance - universal pain point)*
3. Habit Tracker with Analytics *(Health - evergreen interest)*
4. Social Media Content Repurposer *(Content creators - monetizable)*
5. Africana Community Event Planner *(Community - specific audience)*

#### Free Tier (After Registration)
- **Access:** All 87 ideas + full BuyButton comprehensive guide
- **Features:**
  - Browse and search all 87 ideas by category/tags
  - Full idea descriptions with recommended tools (Claude, Bolt, Lovable, Google Studio)
  - Read and write comments on ideas
  - Share project links/implementations
  - Access BuyButton "Comprehensive Implementation Guide" (detailed specs, step-by-step build, code examples, deployment)
  - Full access to news banner
  - Real-time project tracking (see others' projects)

#### Premium Tier (Future - Not in MVP)
- Reserved for post-launch expansion
- Potential features: Tool expertise badges, priority feedback, advanced analytics

### 5.2 BuyButton Idea - Special Treatment

**Free Tier View:**
```
BuyButton: Digital Service Monetization Widget 🔐
─────────────────────────────────────
Problem: Digital creators struggle to monetize services without 
technical complexity or high fees.

Solution: A no-code widget enabling creators to embed a payment 
button on any website with instant payouts.

Why It Matters: Creators need simple monetization; Gumroad, Stripe 
Button, Lemonsqueezy exist—but building your own teaches valuable 
AI & full-stack skills.

[Sign Up to See Full Implementation Guide →]
```

**Registered User View:**
```
BuyButton: Digital Service Monetization Widget ✅
─────────────────────────────────────

PROBLEM STATEMENT:
- Freelancers, coaches, creators need to monetize digital services
- Existing tools (Gumroad, Stripe) charge 5-10% fees
- Many want to own the full stack and understand payment processing

SOLUTION ARCHITECTURE:
1. Frontend: Simple embeddable widget (React component)
2. Backend: Payment processing (Stripe API integration)
3. Database: Customer, transaction, and service records
4. Admin Dashboard: Track sales, payouts, customer management

STEP-BY-STEP BUILD GUIDE:
1. Set up Supabase for user & transaction data
2. Create Stripe Connect account for payment processing
3. Build React component with customizable styling
4. Implement webhook handling for payment confirmations
5. Create admin dashboard for creators
6. Test with Anthropic Claude Code (recommended)
7. Deploy to Vercel or similar

RECOMMENDED TOOLS:
- Claude Code (AI-powered coding agent)
- Lovable (visual UI builder)
- Bolt (rapid prototyping)
- Stripe API (payment processing)
- Supabase (database & auth)

MONETIZATION FOR YOUR OWN PROJECT:
- SaaS offering: $9-29/month subscription
- Payment processing: 2-3% transaction fee (vs competitors' 5-10%)
- White-label version for agencies

ESTIMATED BUILD TIME: 40-60 hours with Claude Code
ESTIMATED Revenue Potential: $500-5,000/month at scale

[Comments] [Share Your Implementation]
```

---

## 6. Core MVP Features

### 6.1 Feature Priority Tier: Must-Have (MVP Launch)

#### 6.1.1 Idea Browsing & Discovery
- **Searchable repository** with all 87 ideas (registered) / 5 ideas (guests)
- **Category filtering** across 13 categories
- **Full-text search** on titles, descriptions, tools, tags
- **Idea detail view** showing:
  - Title, description, category
  - Difficulty level (Beginner, Intermediate, Advanced)
  - Recommended AI tools (Claude, Bolt, Lovable, Google Studio, etc.)
  - Estimated build time
  - Monetization potential (if applicable)
  - Project links section (user implementations)
  - Comment thread
  - "X views, Y comments, Z projects built" metrics

#### 6.1.2 User Accounts & Authentication
- **Signup/Login** (email-based via Supabase Auth)
- **Guest access** (read-only, limited ideas + BuyButton preview)
- **User profiles** with:
  - Display name, bio (optional)
  - Link to shared projects
  - List of commented ideas
  - "Member Since" date

#### 6.1.3 Tiered Access System
- Gate full idea list behind login
- Display BuyButton sneak peek in guest view
- Unlock full BuyButton guide on registration
- Clear CTA on guest experience: "Sign up to unlock 87 ideas & comprehensive guides"

#### 6.1.4 Comments System
- **Nested comments** (replies to comments supported)
- **Comment thread** showing:
  - Author name, timestamp, comment text
  - Collapse/expand for nested replies
- **Basic moderation:** Users can report; admin can delete via backend

#### 6.1.5 Project Links / Showcase
- Users can post links to their idea implementations
- Each project includes:
  - Project title, URL, brief description
  - Author name, timestamp
  - Tool used (e.g., "Built with Claude Code")
- Appears in "Projects Built" section on idea detail page

#### 6.1.6 News Banner
- Static banner at top of app
- Displays latest news/announcement
- Content: Anthropic promotion status, tips for credit usage, featured projects

#### 6.1.7 Tool Discussion Encouragement
- **Tool tags on ideas** (e.g., "Best for: Claude", "Lovable", "Bolt")
- **Idea descriptions** mention recommended tools
- **Comment prompts** such as "Which tool did you use?" and "What was your credit usage?"
- Enables discussion of tool comparative strengths

#### 6.1.8 Metrics Dashboard (Admin View)
- **Real-time tracking:**
  - Total registrations (cumulative)
  - New registrations (this week/month)
  - Total comments posted
  - Total project links shared
  - Total website visits/pageviews
  - Unique visitors
  - Most popular ideas (by views)
  - Most commented ideas
  - Most projects built from ideas
  - Tool usage breakdown (Claude, Bolt, Lovable, Google Studio mentions in comments/projects)
  
- **Campaign-specific metrics:**
  - Projects completed toward 4k goal
  - Estimated Anthropic credit utilization
  - Conversion: Guest → Registered user
  - Engagement: Registered user comment rate

---

## 7. Data Structure & Content

### 7.1 Ideas Schema
```
Idea {
  id: UUID
  title: String
  description: String (markdown supported)
  category: String (enum - one of 13 categories)
  difficulty: String (Beginner, Intermediate, Advanced)
  tools: Array<String> (Claude, Bolt, Lovable, Google Studio, etc.)
  tags: Array<String>
  monetization_potential: String
  estimated_build_time: String (e.g., "8-12 hours")
  created_at: Timestamp
  updated_at: Timestamp
  view_count: Integer
  comment_count: Integer
  project_count: Integer
  free_tier: Boolean (true if in 5 free ideas)
}
```

### 7.2 Comments Schema
```
Comment {
  id: UUID
  idea_id: UUID
  user_id: UUID
  parent_comment_id: UUID (null if top-level)
  content: String
  created_at: Timestamp
  updated_at: Timestamp
  flagged_for_moderation: Boolean (default: false)
}
```

### 7.3 Projects/Links Schema
```
ProjectLink {
  id: UUID
  idea_id: UUID
  user_id: UUID
  title: String
  url: String
  description: String (max 200 chars)
  tools_used: Array<String> (e.g., ["Claude Code", "Supabase"])
  created_at: Timestamp
  updated_at: Timestamp
}
```

### 7.4 Users Schema
```
User {
  id: UUID (from Supabase Auth)
  email: String (from Supabase Auth)
  display_name: String
  bio: String (optional)
  created_at: Timestamp
  updated_at: Timestamp
  tier: String (free, premium)
}
```

### 7.5 News Banner Schema
```
NewsBanner {
  id: UUID
  title: String
  description: String
  link: String (optional)
  active: Boolean
  created_at: Timestamp
  expires_at: Timestamp (optional)
}
```

### 7.6 Metrics/Analytics Schema (New)
```
PageView {
  id: UUID
  user_id: UUID (null for guests)
  page: String (e.g., "idea_list", "idea_detail", "home")
  idea_id: UUID (if applicable)
  timestamp: Timestamp
}

Metric {
  id: UUID
  metric_key: String (e.g., "registrations_total", "projects_completed")
  metric_value: Integer
  date: Date
  timestamp: Timestamp
}
```

---

## 8. Metrics & Analytics Strategy

### 8.1 Key Metrics to Track

#### User Acquisition
- Total registrations (cumulative)
- New registrations per day/week/month
- Guest → Registered conversion rate
- Signup source (direct, email invite, etc.)

#### Engagement
- Total comments posted
- Comments per idea (average)
- Comment thread depth (avg replies per top-level comment)
- Unique commenters per idea

#### Discovery & Browsing
- Total website visits
- Unique visitors
- Ideas browsed (average per session)
- Search usage (% of users who search vs browse)
- Category filter usage

#### Project Completion (Campaign Goal)
- **Total projects linked/shared** (toward 4k goal)
- Projects per idea (average)
- Projects per user (repeat builders)
- Tools used in projects (Claude, Bolt, Lovable breakdown)
- Estimated credit utilization (inferred from tool mentions)

#### Content Quality
- Most viewed ideas
- Most commented ideas
- Ideas with most projects built
- Tool discussion frequency (mentions of Claude vs Bolt vs Lovable)

### 8.2 Metrics Dashboard (Admin View)
- Real-time counter showing progress toward 4k projects goal
- Charts showing trends over time
- Breakdown of metrics by category
- Export capabilities (CSV, JSON)

### 8.3 Success Thresholds (MVP Phase)
- **Registrations:** 500+ by end of campaign
- **Project Links:** 4,000 by November 18, 2025 ✅ (MAIN GOAL)
- **Comments:** 1,000+ total
- **Engagement Rate:** 30%+ of registered users comment or share project
- **Tool Discussion:** Claude, Bolt, Lovable each mentioned 100+ times

---

## 9. Anthropic Promotion Campaign Strategy

### 9.1 Campaign Context
- **Promotion Period:** Through November 18, 2025
- **Offer:** Pro users get $250 in credits; Max users get $1,000 in credits (at API pricing)
- **Target:** Encourage professionals to build real projects using Claude Code

### 9.2 Campaign Messaging
**Homepage Banner:**
> "Transform AI Ideas into Reality with Anthropic's Free Credits  
> Join 400+ builders experimenting with Claude Code. Pick an idea, start building, and showcase your project. 4,000 projects built by Nov 18!"

**Signup CTA:**
> "Sign Up Free → Unlock 87 AI Project Ideas + $250-$1,000 in Anthropic Credits Guide"

**Welcome Email (After Signup):**
> Subject: "Your 87 AI Project Ideas + Quick Start Guide to Claude Code"  
> Body: Overview of ideas, link to Anthropic credits, tips for credit maximization

### 9.3 Project Tracking Integration
- Encourage users to mention "Built with Claude Code" in project links
- Highlight projects using Anthropic credits in featured section
- Quarterly leaderboard: "Top Projects Built with Claude Credits"

---

## 10. User Flows

### 10.1 First-Time Visitor (Guest)
1. Land on homepage → See news banner about Anthropic promotion
2. Browse 5 featured ideas across categories
3. See BuyButton sneak peek
4. View existing comments (read-only)
5. Prompted: "Sign Up to See Full Ideas & Comments"

### 10.2 New User Signup
1. Click "Sign Up" button
2. Enter email + create password
3. Confirm email (Supabase default)
4. Create display name
5. Feature tour: search, categories, comments, projects
6. Directed to idea browser
7. Email sent: Welcome + onboarding tips

### 10.3 Logged-In User - Browse Ideas
1. Access home/ideas list page
2. Use search bar or filter by category
3. Click on idea card
4. View full description, tools, estimated time, monetization
5. See project links and comment thread
6. Read BuyButton comprehensive guide if registered

### 10.4 Logged-In User - Add Comment
1. On idea detail page → Scroll to comments
2. Click "Add Comment" or reply to existing
3. Text box appears
4. Type comment (e.g., "Building this with Claude Code!")
5. Click "Post"
6. Comment appears in thread

### 10.5 Logged-In User - Share Project
1. On idea detail page → Scroll to "Projects Built"
2. Click "Share Your Project"
3. Modal/form with fields:
   - Project Title
   - Project URL
   - Brief Description
   - Tools Used (multi-select: Claude, Bolt, Lovable, Google Studio)
4. Click "Submit"
5. Project appears in list
6. Confirmation message with metric update

### 10.6 Admin - View Metrics
1. Access admin dashboard
2. Real-time metrics displayed:
   - Progress toward 4k projects goal
   - Registrations, comments, projects trends
   - Tool usage breakdown
3. Export metrics as CSV

---

## 11. Tech Stack & Architecture

### 11.1 Frontend
- **Framework:** React 18+
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** React hooks + Context API
- **Build Tool:** Vite
- **Package Manager:** npm or pnpm

### 11.2 Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **API:** RESTful

### 11.3 Database (Supabase/PostgreSQL)
- All schemas defined in section 7
- Row-level security (RLS) policies
- Real-time subscriptions for live metrics

### 11.4 Deployment
- **Frontend:** Vercel or Netlify
- **Backend:** Vercel Functions, Railway, or Fly.io
- **Database:** Supabase (managed)

---

## 12. Implementation Priorities & Phases

### Phase 1: MVP Foundation (Weeks 1–4)
1. Backend setup: Node.js, Express, Supabase
2. Frontend setup: React, Tailwind, shadcn/ui
3. Authentication (Supabase Auth)
4. Ideas list, search, category filter
5. Idea detail page
6. Comments (CRUD)
7. Project links (CRUD)
8. Tiered access logic (free 5 ideas + BuyButton preview)
9. Basic metrics tracking

### Phase 2: Campaign Launch & Optimization (Weeks 4–5)
1. Polish UI/UX
2. Metrics dashboard setup
3. News banner configuration
4. Anthropic promotion messaging
5. Beta tester onboarding
6. Bug fixes & performance optimization

### Phase 3: Launch & Monitoring (Weeks 5–6)
1. Open closed beta to target users
2. Monitor metrics toward 4k goal
3. Real-time support & feedback
4. Iterate based on user feedback

---

## 13. Success Metrics & KPIs

### Quantitative
- **Registrations:** 500+ by Nov 18
- **Project Links:** 4,000+ by Nov 18 (MAIN GOAL)
- **Comments:** 1,000+ total
- **Engagement Rate:** 30%+ of registered users engage
- **Unique Visitors:** 2,000+
- **Return Visitor Rate:** 40%+ return within 7 days

### Qualitative
- User feedback (satisfaction surveys)
- NPS (Net Promoter Score)
- Sentiment analysis on comments
- Tool discussion quality

---

## 14. Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| Low project submission rate | Strong CTA on every idea detail page; showcase top projects; highlight milestone (e.g., "100 projects built!") |
| Users max out credits quickly | Provide "Credit Optimization Tips" guide; encourage phase-of-project sharing (MVP first, then enhanced) |
| Poor engagement post-signup | Email nurture sequence; weekly email featuring new/trending ideas; showcase projects built by peers |
| Comment spam/toxicity | Manual moderation; clear community guidelines; flag system; focus on closed beta to manage |
| Technical issues impacting tracking | Robust error handling; analytics validation; backup logging system |

---

## 15. Open Questions & Decisions

1. **Anthropic Integration:** Should we embed Anthropic credits information directly in the UI, or keep separate?
2. **Leaderboard:** Feature top projects by tool used (most Claude, most Bolt, etc.)?
3. **Email Cadence:** Weekly digest of trending ideas and top projects?
4. **Feedback Loop:** In-app survey after user posts first project?

---

## 16. Appendix A: Complete 87 Ideas List (Organized by Category)

### Category 1: B2B SaaS Tools (3 ideas)
1. Project Management Dashboard for Africana Initiatives
2. Grant Application Assistant
3. Impact Measurement & Storytelling Tool

### Category 2: Book Club & Reading (3 ideas)
1. Africana Book Discussion Guide Generator
2. Reading Schedule & Community Tracker
3. Author Research Tool - Africana Writers Database

### Category 3: Community & Cultural Groups (3 ideas)
1. Africana Podcast Archive & Transcript Searchable Database
2. Episode Discussion Forum Generator
3. Live Event Transcription & AI Summary Tool

### Category 4: Community Building (3 ideas)
1. Africana Community Event Planner
2. Community Impact Tracker
3. Member Skill Directory & Mentorship Matcher

### Category 5: Education & Learning (6 ideas)
1. Personal Finance Dashboard
2. Automated Meeting Notes Generator
3. Habit Tracker with Analytics
4. Email Newsletter Template Generator
5. AI-Powered Course Creation Platform
6. Interactive Learning Path Builder

### Category 6: Education & Teaching (3 ideas)
1. Africana Lesson Plan Generator
2. Culturally Responsive Teaching Resource Library
3. Student Assignment Rubric Builder

### Category 7: Games and Puzzles (3 ideas)
1. Africana History Quiz & Trivia Platform
2. Word Puzzle Generator - Africana Terminology
3. Interactive Map Builder - Diaspora Connections

### Category 8: Health & Wellness (3 ideas)
1. Mental Health Journaling App with AI Insights
2. Wellness Challenge Tracker & Community
3. Sleep Optimization Recommendation Engine

### Category 9: Marketing & Content Creation (6 ideas)
1. Social Media Content Repurposer
2. AI-Powered Email Newsletter Generator
3. Blog Post Outline & Writing Assistant
4. Video Script Generator from Text
5. Podcast Highlight Extractor & Clipper
6. SEO Analysis & Optimization Tool

### Category 10: Niche Community Tools (3 ideas)
1. Freelancer Rate Calculator
2. Community Fundraising Campaign Manager
3. Volunteer Hour Tracker & Recognition System

### Category 11: Personal Productivity & Finance (6 ideas)
1. Expense Tracking & Budget Analyzer
2. Meeting Minutes & Action Items Extractor
3. Time Tracking & Productivity Dashboard
4. Personal Goal Setting & Progress Tracker
5. Document Organization & Smart Tagging System
6. Recurring Task Automation Manager

### Category 12: Projects in Development (3 ideas)
1. Community Resilience Planning Toolkit
2. Crisis Response Coordination Platform
3. Environmental Justice Advocacy Tool

### Category 13: Think Tank & Research (3 ideas)
1. Research Paper Collaboration Platform
2. Africana Policy Brief Generator
3. Debate Framework & Argument Mapper

**BONUS IDEA (Special - Tiered Content):**
- **BuyButton:** Digital Service Monetization Widget

---

**Total: 87 ideas across 13 categories**

---

## 17. Glossary

- **Idea:** A discrete AI project concept with description, tools, and use case
- **Tiered Access:** Free tier (5 ideas + BuyButton preview) vs Registered tier (87 ideas + full BuyButton)
- **Comment:** User feedback or discussion on an idea
- **Project Link:** User-submitted link to their implementation of an idea
- **Tool:** AI service (Claude, Bolt, Lovable, Google Studio)
- **Closed Beta:** Limited user group (not public)
- **Metrics Dashboard:** Admin view of real-time KPIs
- **Campaign Goal:** 4,000 projects completed by Nov 18, 2025

---

**Document Version:** 2.0 (Updated with 87 Ideas + Metrics + Campaign Goals)  
**Last Updated:** November 4, 2025  
**Status:** Ready for Development with Bolt/Claude/Lovable