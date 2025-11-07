import { Page } from '@playwright/test';

/**
 * Authentication Helper Functions
 *
 * These helpers provide reusable authentication flows for Playwright tests.
 * They handle signup, login, logout, and test email generation.
 */

/**
 * Generates a unique email address for testing
 * Format: test-{timestamp}-{random}@example.com
 */
export function generateUniqueEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `test-${timestamp}-${random}@example.com`;
}

/**
 * Generates a test password
 * Returns a strong password that meets common requirements
 */
export function generateTestPassword(): string {
  return 'TestPassword123!';
}

/**
 * Signs up a new user account
 * @param page - Playwright Page object
 * @param email - User email (optional, generates unique if not provided)
 * @param password - User password (optional, uses default if not provided)
 * @param displayName - Optional display name for the user
 * @returns Object containing email and password used
 */
export async function signup(
  page: Page,
  email?: string,
  password?: string,
  displayName?: string
): Promise<{ email: string; password: string }> {
  const testEmail = email || generateUniqueEmail();
  const testPassword = password || generateTestPassword();

  // Navigate to signup page
  await page.goto('/signup');

  // Wait for signup form to be visible
  await page.waitForSelector('form', { state: 'visible' });

  // Fill in the signup form
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPassword);

  // Fill display name if provided
  if (displayName) {
    const displayNameInput = page.locator('input[name="displayName"]');
    if (await displayNameInput.isVisible()) {
      await displayNameInput.fill(displayName);
    }
  }

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for successful signup (redirects to home or dashboard)
  await page.waitForURL(/\/(home|dashboard|ideas)?/, { timeout: 10000 });

  return { email: testEmail, password: testPassword };
}

/**
 * Logs in an existing user
 * @param page - Playwright Page object
 * @param email - User email
 * @param password - User password
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  // Navigate to login page
  await page.goto('/login');

  // Wait for login form to be visible
  await page.waitForSelector('form', { state: 'visible' });

  // Fill in the login form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for successful login (redirects to home or dashboard)
  await page.waitForURL(/\/(home|dashboard|ideas)?/, { timeout: 10000 });
}

/**
 * Logs out the current user
 * @param page - Playwright Page object
 */
export async function logout(page: Page): Promise<void> {
  // Look for logout button/link in header or user menu
  // Common patterns: "Logout", "Sign Out", user menu dropdown

  // Try to find user menu dropdown first
  const userMenu = page.locator('[data-testid="user-menu"], [aria-label="User menu"]');
  if (await userMenu.isVisible()) {
    await userMenu.click();
    await page.waitForTimeout(500); // Wait for dropdown to open
  }

  // Click logout button
  await page.click('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout"), a:has-text("Sign Out")');

  // Wait for redirect to home page
  await page.waitForURL(/\/?(home)?$/, { timeout: 5000 });
}

/**
 * Checks if user is currently logged in
 * @param page - Playwright Page object
 * @returns true if user is logged in, false otherwise
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  // Check for presence of user menu or logout button
  const userMenu = page.locator('[data-testid="user-menu"], button:has-text("Logout"), a:has-text("Logout")');
  return await userMenu.isVisible();
}

/**
 * Ensures user is logged out
 * Checks if logged in and logs out if necessary
 * @param page - Playwright Page object
 */
export async function ensureLoggedOut(page: Page): Promise<void> {
  if (await isLoggedIn(page)) {
    await logout(page);
  }
}

/**
 * Creates a test user and logs them in
 * Useful for beforeEach hooks in authenticated tests
 * @param page - Playwright Page object
 * @returns Object containing email and password of created user
 */
export async function createAndLoginUser(
  page: Page,
  displayName?: string
): Promise<{ email: string; password: string }> {
  const credentials = await signup(page, undefined, undefined, displayName);
  // signup() already logs the user in, so we just return credentials
  return credentials;
}

/**
 * Gets authentication token from browser storage (if using token-based auth)
 * @param page - Playwright Page object
 * @returns Authentication token or null if not found
 */
export async function getAuthToken(page: Page): Promise<string | null> {
  // Check localStorage for Supabase auth token
  const token = await page.evaluate(() => {
    const authData = localStorage.getItem('supabase.auth.token');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        return parsed.access_token || null;
      } catch {
        return null;
      }
    }
    return null;
  });

  return token;
}

/**
 * Waits for authentication state to be ready
 * Useful for ensuring auth context is loaded before tests
 * @param page - Playwright Page object
 */
export async function waitForAuthReady(page: Page): Promise<void> {
  // Wait for auth context to be initialized
  // This checks for the presence of auth-related elements
  await page.waitForTimeout(1000);

  // Wait for any loading spinners to disappear
  const spinner = page.locator('[data-testid="loading-spinner"], .loading');
  if (await spinner.isVisible()) {
    await spinner.waitFor({ state: 'hidden', timeout: 5000 });
  }
}
