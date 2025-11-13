 When clicking on five free ideas it goes to the ideas page
 On the sign up to create account button is not look like a button
 On the login page the sign in button does not look like a button
 There is no indication that when a person makes up a new account they will be sent a email to activate it
 When clicking on an idea card from the home page it goes to the top of the page but it's blank should be some details
 When clicking on a category from the home page the ideas are not filtered when the ideas page is presented`
Dark mode needs help
There is a blank shadow box above the ai project ideas page - should probably be the upcoming promotions/challenges/news
Should the search bar be available on the home page if the person is not logged in?
Need a privacy statement
Need a term of services
The buy button idea is missing
The first goal is 4k visits not projects 
when signing in with valid credentials it hangs
----
profile - not implemented
when selecting my dashboard a blank card is presented on the dashboard page
    when selecting my settings, it goes to 404
    when clickin on the categories, they are not show, is number of items in a category hard coded?
need to change Anthropic Claude Code to Anthropic Claude Code Web
5 free ideas are blank
log out does not work
when in guest mode, click on 5 free ideas in te header, goes to ideas page with a card with the message: Error loading ideas

Request failed with status code 404

Reload Page
--------
perhaps we should have FEATURE called Campign and a feaatur called News .
did not see the buyButton
Submit your project is not clearly a button
After clikcking on submit your prohect the screen turns dark and outline of a form 
Need more clarifications regarding the buy button. Perhaps a name change to MySerices.
Show description seems slow.

## FIXED ISSUES (2025-11-12)

### Backend API Routes
- ✅ Fixed GET /api/ideas/:ideaId/projects route (moved to ideas router, placed before /:id)
- ✅ Fixed POST /api/projects 500 error (use supabaseAdmin for RLS bypass)
- ✅ Added POST /api/ideas/:id/view route for view count increment
- ✅ Added /analytics alias to /metrics router for frontend compatibility
- ✅ Added /pageview route alias in addition to /page-view

### UI/UX Improvements
- ✅ Standardized button styling with btn-gradient class on Sign In, Create Account, Submit Project buttons
- ✅ Fixed dialog overlay transparency (solid background for forms)
- ✅ Improved form spacing in project submission dialog

### Authentication & Profile Pages
- ✅ Fixed logout auto-login issue (sign out from Supabase first, clear localStorage)
- ✅ Fixed empty profile pages (Profile, Dashboard, Settings) - added proper user checks and fallbacks
- ✅ Improved error handling for missing profile data
- ✅ Fixed AuthContext timeout handling (use global fetch timeout from supabase.ts)

### Dashboard Improvements
- ✅ Added validation to prevent localhost project URLs from opening
- ✅ Show error message for invalid localhost URLs instead of broken links
- ✅ Improved error handling for project and stats fetching

### Known Remaining Issues
- Profile pages may show empty cards if profile data fails to load (check console for errors)
- Settings page route exists but may need additional content
- Category filtering from home page needs implementation
- BuyButton idea visibility needs verification