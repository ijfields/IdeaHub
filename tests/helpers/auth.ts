import { Page } from '@playwright/test';
import { selectors } from './selectors';

/**
 * Authentication Helpers
 * 
 * Reusable functions for authentication flows in tests
 */

export interface TestUser {
  email: string;
  password: string;
  displayName: string;
}

export const testUsers = {
  valid: {
    email: 'test@example.com',
    password: 'Test1234!',
    displayName: 'Test User',
  },
  new: {
    email: `test-${Date.now()}@example.com`,
    password: 'Test1234!',
    displayName: 'New Test User',
  },
};

/**
 * Login as a user
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.fill(selectors.login.emailInput, email);
  await page.fill(selectors.login.passwordInput, password);
  await page.click(selectors.login.submitButton);
  // Wait for navigation after login
  await page.waitForURL('/', { timeout: 10000 });
}

/**
 * Sign up a new user
 */
export async function signup(
  page: Page,
  displayName: string,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/signup');
  await page.fill(selectors.signup.displayNameInput, displayName);
  await page.fill(selectors.signup.emailInput, email);
  await page.fill(selectors.signup.passwordInput, password);
  await page.fill(selectors.signup.confirmPasswordInput, password);
  await page.check(selectors.signup.acceptTermsCheckbox);
  await page.click(selectors.signup.submitButton);
  // Wait for navigation after signup
  await page.waitForURL('/', { timeout: 10000 });
}

/**
 * Logout current user
 */
export async function logout(page: Page): Promise<void> {
  // Click user menu (avatar or dropdown)
  const userMenu = page.locator(selectors.nav.userMenu).first();
  if (await userMenu.isVisible({ timeout: 2000 }).catch(() => false)) {
    await userMenu.click();
  }
  
  // Click logout button
  await page.click(selectors.nav.logoutButton);
  // Wait for navigation to home
  await page.waitForURL('/', { timeout: 5000 });
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  // Check for user menu or profile link
  const userMenu = page.locator(selectors.nav.userMenu);
  const profileLink = page.locator(selectors.nav.profileLink);
  
  return (
    (await userMenu.isVisible({ timeout: 2000 }).catch(() => false)) ||
    (await profileLink.isVisible({ timeout: 2000 }).catch(() => false))
  );
}

/**
 * Wait for authentication to complete
 */
export async function waitForAuth(page: Page): Promise<void> {
  // Wait for auth state to settle (check for loading states to disappear)
  await page.waitForLoadState('networkidle');
  // Small delay to ensure auth context is ready
  await page.waitForTimeout(500);
}



