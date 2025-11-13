# Changelog

All notable changes to IdeaHub will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Add remaining 77 ideas (currently 10 of 87)
- Email server setup (Resend integration)
- Update BuyButton to MyServices
- Hexagonal home redesign
- GitHub Issues integration for bug tracking
- CI/CD with automated testing

## [0.2.0] - 2025-11-13

### Added
- **Production Deployment**: Deployed to Vercel (backend + frontend)
- **Password Protection**: Custom password gate component (saves $150/month Vercel fee)
- **Beta Request Form**: Professional form with Supabase database storage
- **Live Metrics**: Real-time stats on homepage from backend API
- **Metrics Hook**: `useMetrics` hook for fetching dashboard and public metrics
- **Beta Requests Table**: Database migration for storing beta access requests
- **Priorities Roadmap**: Comprehensive documentation of all enhancements and priorities
- **Password Gate Documentation**: Complete setup guide in `docs/PASSWORD_GATE_SETUP.md`
- **Email Server Documentation**: Setup guide for Resend integration
- **Serverless Entry Point**: `backend/api/index.js` for Vercel deployment

### Changed
- Homepage now shows real metrics instead of hard-coded numbers
- Campaign progress tracks page views (4k goal) instead of projects
- Environment variable `VITE_API_URL` corrected (removed duplicate /api)
- Backend uses `supabaseAdmin` consistently for RLS bypass
- Improved loading states and fallbacks for metrics

### Fixed
- 27 TypeScript build errors in backend
- Vercel serverless routing (404 errors on backend endpoints)
- Dropdown transparency in beta request form
- Submit button styling (now clearly visible with indigo background)
- Null safety checks for `supabaseAdmin` in all routes
- Type comparison errors and unused variables

## [0.1.0] - 2025-11-12

### Added
- Complete backend API (27 endpoints, 5 routers)
- Complete frontend (8 pages, React 18, Vite)
- Authentication system (Supabase Auth)
- Comments system with nested replies
- Project links submission and display
- User profiles and settings pages
- Ideas browsing with search and filters
- Tiered access model (5 free ideas for guests)
- News banner component
- Comprehensive API documentation

### Changed
- Downgraded from React 19 to React 18 for stability
- Fixed Tailwind CSS v4 configuration
- Updated API client method binding

### Fixed
- Login hanging after successful authentication
- Logout not working (auto-login issue)
- Blank cards on Profile/Settings/Dashboard pages
- Comments showing "Anonymous" instead of usernames
- Comment update failing
- Backend API route errors (GET/POST endpoints)
- Empty profile pages rendering

## [0.0.1] - 2025-11-06

### Added
- Initial project setup (frontend + backend)
- Vite + React + TypeScript configuration
- Express + TypeScript backend
- Tailwind CSS + shadcn/ui components
- Supabase database schema (7 tables, RLS policies, indexes)
- Database migrations (12 files, 1,570 lines SQL)
- Seed data (10 sample ideas)
- ESLint + Prettier configuration
- Environment variable templates

---

## Version Numbering

- **Major (X.0.0)**: Breaking changes, major feature releases
- **Minor (0.X.0)**: New features, enhancements (backward compatible)
- **Patch (0.0.X)**: Bug fixes, minor improvements

## Categories

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Features to be removed in future
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements
