# Hexagonal Home Page Redesign Plan

**Status:** Planned  
**Date:** January 2025  
**Priority:** High

---

## Overview

Replace the current home page with a hexagonal grid layout showcasing 6 free ideas for guests. Additional ideas will be visible but blurred, creating intrigue. Campaign stats will be integrated into the central hub area. The design will be inspired by modular hexagonal layouts but with a unique color palette distinct from both the current blue/slate theme and Hubility's green/yellow.

## Current State Analysis

**Existing Home Page (`/`):**
- Traditional vertical layout with hero, campaign banner, featured ideas grid
- Blue/slate color scheme (#3b82f6 primary, #2563eb accents)
- Shows 5 free ideas in standard card grid
- Campaign progress: 1,247 / 4,000 visits (31.2%)
- Stats: 234 users, 1,247 projects, 592 comments, 87 ideas

**Key Files:**
- `frontend/src/pages/Home.tsx` - Current home page (to be replaced)
- `frontend/src/router/index.tsx` - Router configuration
- `frontend/src/index.css` - Global styles and color variables
- `frontend/src/hooks/useIdeas.ts` - Ideas data fetching hook

## Design Approach

### Visual Style
- **Hexagonal grid layout** - Modular, interconnected hexagons in hub pattern
- **6 visible ideas** - Clear, interactive hexagons for free tier ideas
- **Blurred preview** - Additional ideas shown but blurred to create desire
- **Integrated campaign hub** - Central hexagon with stats and progress
- **Unique color palette** - Warm, modern palette (suggested options below)
- **Clean typography** - Modern sans-serif (Inter, existing)

### Layout Structure
1. **Top Section** - Brand/logo area (can be hexagon or traditional header)
2. **Central Hub Hexagon** - Campaign stats, progress, and main CTA
3. **6 Idea Hexagons** - Arranged around central hub in radial pattern
4. **Blurred Hexagons** - Additional ideas visible but blurred with "Sign up to unlock" overlay
5. **Bottom Section** - Sign in/sign up CTAs, footer

### Proposed Color Palette Options

**Option A: Deep Purple & Amber**
- Background: Deep purple/navy (#1a1b3e or #2d1b4e)
- Primary: Rich purple (#7c3aed)
- Accent: Warm amber (#f59e0b)
- Secondary: Soft lavender (#a78bfa)
- Text: Light gray/white

**Option B: Rich Teal & Peach**
- Background: Dark teal (#0f172a or #1e293b)
- Primary: Vibrant teal (#14b8a6)
- Accent: Warm peach (#fb923c)
- Secondary: Mint green (#6ee7b7)
- Text: Light gray/white

**Option C: Charcoal & Gold**
- Background: Charcoal/black (#0a0a0a)
- Primary: Gold (#eab308)
- Accent: Rose (#f43f5e)
- Secondary: Slate gray (#64748b)
- Text: Light gray/white

*Note: Final palette selection can be refined during implementation*

## Implementation Plan

### Phase 0: Branch Setup
**Git Branch:** Create feature branch for hexagonal redesign
- Create new branch: `feature/hexagonal-home-redesign` or `feature/home-hex-grid`
- Ensure clean working directory before starting
- This allows easy rollback if needed and keeps main branch stable

### Phase 1: Replace Home Page Component
**File:** `frontend/src/pages/Home.tsx` (replace)
- Complete redesign with hexagonal grid layout
- Fetch 6 free tier ideas using `useIdeas({ free_tier: true, limit: 6 })`
- Fetch additional ideas (limit: 20-30) for blurred preview
- Integrate campaign stats in central hub
- Include sign in/sign up CTAs
- Responsive hexagonal grid using CSS Grid with transforms

### Phase 2: Hexagonal Grid System
**File:** `frontend/src/components/HexagonGrid.tsx` (new)
- Reusable hexagonal grid component
- CSS clip-path for hexagon shapes
- Radial/hexagonal tiling pattern
- Responsive breakpoints (mobile: stack, tablet: 2-3 columns, desktop: full hub)
- Animation support for entrance effects

**File:** `frontend/src/components/IdeaHexagon.tsx` (new)
- Individual idea hexagon card component
- Displays idea title, description preview, difficulty badge
- Click-through to idea detail page
- Hover effects with elevation/shadow/glow
- Blurred state variant for locked ideas

**File:** `frontend/src/components/CampaignHub.tsx` (new)
- Central hub hexagon showing campaign progress
- Circular progress indicator
- Stats display (visits: 1,247/4,000, percentage: 31.2%)
- Call-to-action button
- Subtle animated background effect

**File:** `frontend/src/components/BlurredHexagon.tsx` (new)
- Blurred hexagon component for locked ideas
- Blur filter with overlay
- "Sign up to unlock" text overlay
- Hover effect showing slight preview

### Phase 3: Styling & Theme
**File:** `frontend/src/index.css` (update)
- Add hexagonal shape utilities (.hexagon, .hexagon-grid)
- Update color variables to new palette (replace blue/slate)
- Hexagon hover/transition animations
- Blur effect utilities
- Background gradients/patterns

**File:** `frontend/tailwind.config.js` (update)
- Update color palette in theme extension
- Add custom hexagon-related utilities
- Add blur effect variants

### Phase 4: Data Integration
- Use `useIdeas({ free_tier: true, limit: 6 })` for visible ideas
- Use `useIdeas({ limit: 30 })` for blurred preview ideas
- Campaign stats: hardcoded initially (1,247/4,000 visits)
- Integrate with existing API client

### Phase 5: Authentication Integration
- Add sign in button/link (existing `/login` route)
- Add sign up CTA (existing `/signup` route)
- Maintain existing auth flow

## Technical Considerations

### Hexagon Implementation
- **CSS clip-path** - `clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)`
- **CSS Grid with offset** - Staggered rows for hexagonal tiling
- **Transform-based positioning** - For radial hub layout

### Blurred Ideas Implementation
- CSS `filter: blur(8px)` on hexagon
- Overlay with semi-transparent background
- "Sign up to unlock" text overlay
- Subtle hover effect (slight reduction in blur)

### Responsive Strategy
- **Mobile (< 768px):** Stack hexagons vertically, simplified layout
- **Tablet (768px - 1024px):** 2-3 column hexagonal grid
- **Desktop (> 1024px):** Full radial hub layout with central campaign hexagon

### Performance
- Lazy load blurred idea content
- Use CSS transforms for animations (GPU-accelerated)
- Optimize hexagon rendering with will-change hints
- Consider virtual scrolling if many blurred hexagons

## Files to Create/Modify

**New Files:**
- `frontend/src/components/HexagonGrid.tsx`
- `frontend/src/components/IdeaHexagon.tsx`
- `frontend/src/components/CampaignHub.tsx`
- `frontend/src/components/BlurredHexagon.tsx`

**Modified Files:**
- `frontend/src/pages/Home.tsx` - Complete replacement with hexagonal layout
- `frontend/src/index.css` - Update colors, add hexagon utilities
- `frontend/tailwind.config.js` - Update color palette

## Design Decisions Confirmed

1. **Route Strategy:** ✅ Replace `/` home page (not separate route)
2. **Color Palette:** ✅ New palette (not blue/slate, not Hubility exact)
3. **Layout Density:** ✅ 6 visible hexagons + blurred preview hexagons
4. **Campaign Integration:** ✅ Integrated into central hub hexagon
5. **Authentication:** ✅ Sign in/sign up accessible from home page

## Success Criteria

- Hexagonal grid displays 6 free ideas in visually striking hub layout
- Additional ideas visible but blurred with unlock messaging
- Campaign stats/progress integrated in central hub hexagon
- Responsive across mobile, tablet, desktop
- Smooth animations and hover effects
- Sign in/sign up CTAs clearly visible
- Maintains existing functionality (navigation, data fetching, auth)
- Accessible (keyboard navigation, screen reader support)
- Unique visual identity distinct from current blue theme and Hubility

## Implementation Checklist

- [ ] Create feature branch (`feature/hexagonal-home-redesign`)
- [ ] Replace `Home.tsx` with hexagonal layout structure
- [ ] Build `HexagonGrid.tsx` component with CSS clip-path hexagons
- [ ] Create `IdeaHexagon.tsx` component for free ideas
- [ ] Create `BlurredHexagon.tsx` component with blur filter
- [ ] Build `CampaignHub.tsx` component for central stats
- [ ] Update color palette in `index.css` and `tailwind.config.js`
- [ ] Add hexagonal CSS utilities and animations
- [ ] Integrate sign in/sign up CTAs
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test accessibility (keyboard nav, screen readers)
- [ ] Test data fetching and API integration
- [ ] Test authentication flow from home page
- [ ] Code review and refinement
- [ ] Merge to main branch

## Notes

- Plan created based on brand strategy analysis and Hubility-inspired design concepts
- Color palette selection should be finalized before implementation begins
- Consider A/B testing the new design vs. current design if analytics are available
- Ensure all existing functionality (search, navigation, etc.) remains intact

---

**Next Steps:** Complete current bug fixes, then begin implementation on feature branch.

