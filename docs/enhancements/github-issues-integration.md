# GitHub Issues Integration for Bug Tracking

## Overview
Integrate GitHub Issues API to track bugs and issues discovered during app testing. This provides a centralized, searchable system for tracking fixes and improvements with both manual and automated reporting capabilities.

## Implementation Approach

### Manual Bug Reporting
- Backend API endpoint: `POST /api/issues` to create GitHub issues
- Frontend component: "Report Bug" dialog/form accessible to all users
- Internal testing interface for developers
- Uses GitHub Personal Access Token (PAT) or GitHub App authentication
- Creates issues with structured templates (title, description, labels, environment info)

### Automated Error Tracking
- Enhance ErrorBoundary to optionally create GitHub issues for critical errors
- Backend error middleware can create issues for 500 errors
- Configurable via environment variable (only in production/staging)
- Includes error stack traces, user context, and request details
- Prevents duplicate issues for same error within time window

### User-Facing Bug Reporting
- "Report Bug" button in footer/navigation (accessible to all users)
- Bug report dialog with form fields
- Auto-captures browser info, URL, user agent
- Optional screenshot attachment capability

## Technical Implementation

### Backend Implementation

1. **GitHub Issues Service** (`backend/src/services/github-issues.ts`)
   - Use `@octokit/rest` for GitHub API integration
   - Create issues with labels, assignees, and structured body
   - Handle rate limiting, authentication, and error handling
   - Support deduplication logic for automated errors

2. **API Endpoints** (`backend/src/routes/issues.ts`)
   - `POST /api/issues` - Create new issue (requires auth for internal use)
   - `POST /api/issues/public` - Create issue from user-facing form (rate limited)
   - Both endpoints validate input and sanitize data

3. **Environment Variables**
   - `GITHUB_TOKEN` - Personal Access Token or App token
   - `GITHUB_REPO_OWNER` - Repository owner
   - `GITHUB_REPO_NAME` - Repository name
   - `GITHUB_AUTO_CREATE_ISSUES` - Enable/disable auto-creation (true/false)

### Frontend Implementation

1. **Bug Report Dialog** (`frontend/src/components/BugReportDialog.tsx`)
   - Form with title, description, steps to reproduce
   - Auto-captures browser info, URL, user agent, screen resolution
   - Uses existing shadcn/ui Dialog, Form, Input, Textarea components
   - Accessible via keyboard shortcut (Ctrl+Shift+B) or footer link

2. **Error Boundary Enhancement** (`frontend/src/components/ErrorBoundary.tsx`)
   - Add "Report this error" button to error display
   - Pre-fills issue with error details, stack trace, component tree
   - Only shows in development/staging environments
   - Opens BugReportDialog with pre-filled data

3. **UI Integration**
   - Add "Report Bug" link to Footer component
   - Add to user menu/dropdown for authenticated users
   - Keyboard shortcut handler in main App component

### Backend Error Middleware Enhancement
- Update `backend/src/server.ts` error middleware
- Optionally create GitHub issues for 500 errors when `GITHUB_AUTO_CREATE_ISSUES=true`
- Include request context, user info, stack traces
- Deduplicate similar errors within 1-hour window

### GitHub Issue Templates
Create issue templates in `.github/ISSUE_TEMPLATE/`:
- `bug_report.md` - Standard bug report template
- `feature_request.md` - Feature request template
- `test_finding.md` - Template for issues found during testing

## Files to Create/Modify

**New Files:**
- `backend/src/services/github-issues.ts` - GitHub API service
- `backend/src/routes/issues.ts` - Issue creation endpoints
- `frontend/src/components/BugReportDialog.tsx` - Bug report UI component
- `.github/ISSUE_TEMPLATE/bug_report.md` - Bug report template
- `.github/ISSUE_TEMPLATE/feature_request.md` - Feature request template
- `.github/ISSUE_TEMPLATE/test_finding.md` - Test finding template

**Modified Files:**
- `backend/src/server.ts` - Add issues route, enhance error middleware
- `frontend/src/components/ErrorBoundary.tsx` - Add "Report error" button
- `frontend/src/components/layout/Footer.tsx` - Add "Report Bug" link
- `frontend/src/App.tsx` - Add keyboard shortcut handler
- `backend/.env.example` - Add GitHub configuration variables
- `README.md` - Document GitHub Issues setup

## Dependencies
- Backend: `@octokit/rest` - Add to `backend/package.json`
- Frontend: No new dependencies (use existing shadcn/ui components)

## Security & Rate Limiting
- GitHub token stored as environment variable (never committed)
- Rate limiting on public endpoint (e.g., 5 issues per hour per IP)
- Internal endpoint requires authentication
- Sanitize user input before creating issues
- Optional: Only allow authenticated users to create issues from UI

## Implementation Steps

1. Install `@octokit/rest` in backend
2. Create GitHub Issues service with API integration
3. Create backend API routes for issue creation
4. Enhance backend error middleware for automated tracking
5. Create BugReportDialog frontend component
6. Enhance ErrorBoundary with error reporting
7. Add bug report link to Footer
8. Create GitHub issue templates
9. Update environment variable examples
10. Update README with setup instructions

## Benefits
- Centralized bug tracking in GitHub
- Searchable issue history
- Integration with GitHub Projects/boards
- Labels and milestones for organization
- Automatic linking to commits/PRs
- Better visibility into production errors
- User feedback collection mechanism

## GitHub Token Setup

To set up GitHub authentication:

1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Generate new token with `repo` scope (full control of private repositories)
3. Copy token and add to `backend/.env` as `GITHUB_TOKEN`
4. Set `GITHUB_REPO_OWNER` and `GITHUB_REPO_NAME` to match your repository

## Example Issue Body Format

```markdown
## Description
[User-provided description]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- Browser: [Browser name and version]
- OS: [Operating system]
- URL: [Page URL where issue occurred]
- User Agent: [Full user agent string]
- Screen Resolution: [Width x Height]

## Additional Context
[Any other relevant information]
```

## Future Enhancements
- Screenshot capture and attachment
- Issue status tracking (show status in UI)
- Integration with Sentry or other error tracking services
- Issue templates based on error type
- Automatic issue assignment based on error category
- Webhook integration for issue updates

