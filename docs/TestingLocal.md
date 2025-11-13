how can i run the tests locally? ive downloaded the repo

Here's how to run the Playwright tests locally:

Prerequisites
Node.js v18+ installed
npm or pnpm package manager
Setup Steps
1. Install Dependencies
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install Playwright browsers (from project root)
cd ..
npx playwright install
2. Configure Environment Variables
Backend (/backend/.env):

PORT=3000
NODE_ENV=development
SUPABASE_URL=https://blhyihgbayeqrubmpqmn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-jwt-secret-here
Frontend (/frontend/.env):

VITE_SUPABASE_URL=https://blhyihgbayeqrubmpqmn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:3000
3. Start Servers (in separate terminals)
Terminal 1 - Backend:

cd backend
npm run dev
Backend will start on http://localhost:3000

Terminal 2 - Frontend:

cd frontend
npm run dev
Frontend will start on http://localhost:5173

4. Install Playwright (if not already installed)
From project root:

npm install
npx playwright install
This will install Playwright and the required browsers.

5. Run Tests
Terminal 3 - From project root:

# Run all tests
npm test
# or
npx playwright test

# Run with UI (recommended for debugging)
npm run test:ui
# or
npx playwright test --ui

# Run specific test file
npx playwright test tests/auth.spec.ts

# Run in headed mode (see browser)
npm run test:headed
# or
npx playwright test --headed

# Run specific browser only
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Run with detailed output
npx playwright test --reporter=list

# Debug specific test
npx playwright test --debug tests/auth.spec.ts
Useful Test Commands
# Run and show browser
npx playwright test --headed --workers=1

# Run specific test by name
npx playwright test -g "user can sign up"

# Show test report
npx playwright show-report

# Update snapshots (if using visual regression)
npx playwright test --update-snapshots
Troubleshooting
If tests fail immediately:

Verify both servers are running (backend on 3000, frontend on 5173)
Check browser console for errors: npx playwright test --headed
Ensure Supabase credentials are correct in .env files
If you see "browser not found":

npx playwright install chromium firefox webkit
To see what's happening:

npx playwright test --ui
This opens an interactive UI where you can see each test step.

