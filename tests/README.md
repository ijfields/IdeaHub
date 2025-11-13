# Playwright E2E Tests

This directory contains end-to-end tests for the AI Ideas Hub application using Playwright.

## Test Structure

```
tests/
├── helpers/
│   ├── selectors.ts    # Centralized selectors for UI elements
│   └── auth.ts         # Authentication helper functions
├── auth.spec.ts        # Authentication flow tests
├── guest-access.spec.ts # Guest user access tests
└── ideas-browsing.spec.ts # Ideas browsing tests
```

## Running Tests

### Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   # or from root
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

3. **Start the development servers:**
   - Backend: `cd backend && npm run dev` (runs on port 3000)
   - Frontend: `cd frontend && npm run dev` (runs on port 5173)

### Run Tests

From the project root:

```bash
# Run all tests
npm test
# or
npx playwright test

# Run with UI (recommended for debugging)
npm run test:ui
# or
npx playwright test --ui

# Run in headed mode (see browser)
npm run test:headed
# or
npx playwright test --headed

# Run specific test file
npx playwright test tests/auth.spec.ts

# Run specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Debug a test
npx playwright test --debug tests/auth.spec.ts

# Run with detailed output
npx playwright test --reporter=list
```

## Test Commands

- `npm test` - Run all tests
- `npm run test:ui` - Run with interactive UI
- `npm run test:headed` - Run with visible browser
- `npm run test:debug` - Debug mode
- `npm run test:chromium` - Run only Chromium tests
- `npm run test:firefox` - Run only Firefox tests
- `npm run test:webkit` - Run only WebKit tests
- `npm run test:report` - Show test report

## Writing Tests

### Using Selectors

Import selectors from helpers:

```typescript
import { selectors } from './helpers/selectors';

// Use selectors
await page.fill(selectors.login.emailInput, 'test@example.com');
await page.click(selectors.login.submitButton);
```

### Using Auth Helpers

```typescript
import { login, signup, logout } from './helpers/auth';

// Login
await login(page, 'test@example.com', 'password123');

// Signup
await signup(page, 'Test User', 'test@example.com', 'password123');

// Logout
await logout(page);
```

### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

## Troubleshooting

### Tests fail immediately
- Verify both servers are running (backend on 3000, frontend on 5173)
- Check browser console: `npx playwright test --headed`
- Ensure Supabase credentials are correct in `.env` files

### Browser not found
```bash
npx playwright install chromium firefox webkit
```

### See what's happening
```bash
npx playwright test --ui
```

This opens an interactive UI where you can see each test step.

## Configuration

Test configuration is in `playwright.config.ts` at the project root.

Key settings:
- `baseURL`: `http://localhost:5173` (frontend dev server)
- `testDir`: `./tests`
- `webServer`: Automatically starts frontend dev server if not running

## Notes

- Tests use the actual UI structure, so selectors may need updates if UI changes
- Authentication tests require valid Supabase credentials
- Some tests may need adjustment based on actual API responses
- Tests are designed to be resilient to timing issues with `waitFor` patterns




