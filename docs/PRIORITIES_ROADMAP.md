# IdeaHub Development Priorities & Roadmap

**Last Updated:** November 13, 2025
**Status:** Production deployed, closed beta ready

---

## ✅ Completed This Session

1. **Vercel Deployment** - Backend + Frontend live in production
2. **Password Protection** - Custom password gate (saves $150/month Vercel fee)
3. **Beta Request Form** - Professional form with Supabase storage
4. **Live Metrics Integration** - Real-time stats on homepage (no Google Analytics needed!)
5. **UI Polish** - Fixed dropdown transparency and button styling

---

## 🔥 Critical Priority (Before Scaling Beta)

### 1. **Add Remaining 77 Ideas** (Currently 10 of 87)
**Time Estimate:** 2-3 hours
**Why Critical:** Homepage says "87 ideas" but only 10 exist
**Tasks:**
- Extract all 87 ideas from PRD Appendix A
- Create comprehensive seed data SQL migration
- Categorize properly (13 categories)
- Deploy to production
- Update category counts dynamically

**Dependencies:** None
**Blocks:** User trust, accurate metrics

---

### 2. **Email Server Setup** (Resend Integration)
**Time Estimate:** 1-2 hours
**Why Critical:** Need before scaling beyond 10 users
**Documentation:** `docs/enhancements/email-server-setup.md`

**Tasks:**
- Sign up for Resend (free tier: 3,000 emails/month)
- Configure SMTP in Supabase settings
- Customize confirmation email templates
- Test signup flow
- Monitor deliverability

**Dependencies:** None
**Blocks:** Scaling to >10 beta users
**Can Wait If:** Beta group stays under 10 people (use default Supabase emails)

---

### 3. **Tracking Audit & Documentation Cleanup**
**Time Estimate:** 1-2 hours
**Why Critical:** Need clear picture of what's done vs pending
**Recommendation:** **Separate fresh session**

**Tasks:**
- Review entire codebase systematically
- Compare against TASKS.md
- Mark completed items as [x]
- Document what Cursor session completed
- Update CLAUDE.md session history
- Create clean prioritized roadmap
- Remove duplicate/stale items

**Dependencies:** None
**Blocks:** Planning future work accurately

---

## 🎨 High Priority (Enhancement Features)

### 4. **Update BuyButton to MyServices**
**Time Estimate:** 2-3 hours
**Why Important:** Aligns with platform philosophy, more accessible
**Documentation:** `docs/enhancements/update-buybutton-to-myservices.md`

**Overview:**
- Rebrand BuyButton (complex SaaS) → MyServices (personal monetization)
- Change difficulty: Advanced → Beginner
- New category: Creator Tools
- Philosophy: "Everyone should have a button to exchange value"
- Keeps special landing page status (free tier = false)

**Tasks:**
- Create database migration
- Update categories list in frontend
- Update IdeaDetail display logic
- Rewrite content to match BuyButton.md philosophy
- Test tiered access (guest vs registered)

**Dependencies:** None
**Impact:** Better user onboarding, clearer value proposition

---

### 5. **Hexagonal Home Redesign**
**Time Estimate:** 4-6 hours
**Why Important:** More engaging visual design, better storytelling
**Documentation:** `docs/enhancements/hexagonal-home-redesign.md`

**Overview:**
- Replace traditional grid with hexagonal hub layout
- 6 free ideas visible, others blurred (intrigue)
- Central hexagon shows campaign stats
- New color palette (purple/amber or teal/peach)
- More modern, distinctive design

**Tasks:**
- Design hexagonal grid component
- Create hexagon card component
- Implement blur effect for locked ideas
- Update color palette
- Integrate campaign stats hub
- Test responsive layout
- A/B test if possible

**Dependencies:** Add remaining 77 ideas first (for blurred previews)
**Impact:** Stronger visual identity, better conversion

---

### 6. **GitHub Issues Integration**
**Time Estimate:** 3-4 hours
**Why Important:** Systematic bug tracking during beta
**Documentation:** `docs/enhancements/github-issues-integration.md`

**Overview:**
- Auto-create GitHub issues for errors
- User-facing "Report Bug" button
- Backend error tracking → GitHub
- Prevents duplicate issues
- Structured templates

**Tasks:**
- Install @octokit/rest
- Create GitHub service (backend/src/services/github-issues.ts)
- Create API endpoints (POST /api/issues, POST /api/issues/public)
- Build BugReportDialog component
- Enhance ErrorBoundary with "Report" button
- Add environment variables (GITHUB_TOKEN, etc.)
- Test rate limiting

**Dependencies:** None
**Impact:** Easier beta testing, faster bug fixes

---

## 📊 Medium Priority (Quality & Testing)

### 7. **CI/CD with Automated Testing**
**Time Estimate:** 2-3 hours
**Why Important:** Prevent regressions, ensure quality

**Tasks:**
- Set up GitHub Actions workflow
- Run Playwright tests on every PR
- Run TypeScript build check
- Block merges if tests fail
- Add deployment health checks
- Configure test environment variables

**Dependencies:** Fix existing Playwright tests first
**Impact:** Code quality, confidence in deployments

---

### 8. **Fix Playwright Tests**
**Time Estimate:** 1-2 hours
**Why Important:** Tests currently failing

**Tasks:**
- Update tests for production environment
- Add test data seeding
- Configure test environment variables
- Update selectors for new components
- Test auth flows with password gate

**Dependencies:** None
**Blocks:** CI/CD setup

---

### 9. **Admin Dashboard Page** (Visual Metrics)
**Time Estimate:** 3-4 hours
**Why Important:** Better visibility into campaign progress

**Tasks:**
- Create /admin or /dashboard route
- Build metrics dashboard page
- Add charts (project growth, user registrations, tool usage)
- Real-time updates
- Export data functionality
- Protect with admin authentication

**Dependencies:** Live metrics hook (✅ done!)
**Impact:** Better campaign monitoring

---

## 🔮 Low Priority (Future Enhancements)

### 10. **Custom Domain Setup**
- Move from vercel.app subdomain to custom domain
- Configure DNS
- SSL certificates
- Update environment variables

### 11. **SEO Optimization**
- Meta tags for all pages
- Structured data (JSON-LD)
- Sitemap generation
- robots.txt
- Open Graph images

### 12. **Performance Optimization**
- Code splitting (dynamic imports)
- Lazy loading
- Image optimization
- Reduce bundle size (currently 920KB)

### 13. **Accessibility Audit**
- WCAG 2.1 compliance check
- Keyboard navigation testing
- Screen reader testing
- Color contrast improvements

### 14. **Analytics Integration** (Optional)
- Vercel Analytics (simple, paid)
- OR Google Analytics (free, more complex)
- Note: Already have built-in metrics!

### 15. **Mobile App** (Long-term)
- React Native implementation
- iOS + Android
- Push notifications for comments
- Offline mode

---

## 📋 Next Session Recommendations

**Recommended Order:**

1. **Session 1: Add 77 Ideas** (2-3 hours)
   - Most critical blocker
   - Enables other features
   - Quick win

2. **Session 2: Tracking Audit** (1-2 hours)
   - Clean slate for planning
   - Clear roadmap
   - Better decision making

3. **Session 3: Email Server Setup** (1-2 hours)
   - When ready to scale beyond 10 users
   - Can wait if beta stays small

4. **Session 4: BuyButton → MyServices** (2-3 hours)
   - High user impact
   - Aligns with vision
   - Quick implementation

5. **Session 5: Hexagonal Redesign** (4-6 hours)
   - After ideas are added
   - Visual refresh
   - Better engagement

6. **Session 6: CI/CD + Tests** (3-5 hours)
   - After core features stable
   - Quality assurance
   - Confidence for future work

---

## Decision Framework

**Do Now:**
- ✅ Critical for closed beta launch
- ✅ Blocks other work
- ✅ Affects user trust

**Do Soon:**
- 🔶 Enhances user experience
- 🔶 Reduces technical debt
- 🔶 Enables future features

**Do Later:**
- 🔵 Nice to have
- 🔵 Optimization
- 🔵 Long-term vision

---

## Notes

- All enhancement docs in `docs/enhancements/`
- Each enhancement has full implementation guide
- Time estimates assume focused, uninterrupted work
- Priorities may shift based on user feedback
- Beta feedback will inform next priorities

**Campaign Deadline:** November 18, 2025 (5 days!)
**Current Status:** Production ready for closed beta
**Next Milestone:** Scale to 50+ users
