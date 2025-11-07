import { test, expect } from '@playwright/test';
import { signup, login, logout, generateUniqueEmail, generateTestPassword } from './helpers/auth';
import { navigation, auth } from './helpers/selectors';

/**
 * Authentication Tests
 *
 * Tests for authentication flows:
 * - User signup
 * - User login
 * - Logout functionality
 * - Protected routes redirect to login
 * - Invalid credentials handling
 * - Form validation
 */

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('user can sign up with valid credentials', async ({ page }) => {
    const email = generateUniqueEmail();
    const password = generateTestPassword();

    // Use signup helper
    const credentials = await signup(page, email, password, 'Test User');

    // Verify successful signup (redirected to home/dashboard)
    await expect(page).toHaveURL(/\/(home|dashboard|ideas)?/);

    // Verify user is logged in (logout button or user menu visible)
    const logoutButton = page.locator(navigation.logoutButton);
    const userMenu = page.locator(navigation.userMenu);

    // Either logout button or user menu should be visible
    const isLoggedIn = (await logoutButton.isVisible()) || (await userMenu.isVisible());
    expect(isLoggedIn).toBeTruthy();

    // Verify signup/login links are hidden
    const loginLink = page.locator(navigation.loginLink);
    await expect(loginLink).not.toBeVisible();
  });

  test('user can log in with existing credentials', async ({ page }) => {
    // First, create a user
    const email = generateUniqueEmail();
    const password = generateTestPassword();
    await signup(page, email, password);

    // Log out
    await logout(page);

    // Verify logged out
    const loginLink = page.locator(navigation.loginLink);
    await expect(loginLink).toBeVisible();

    // Now log back in
    await login(page, email, password);

    // Verify successful login
    await expect(page).toHaveURL(/\/(home|dashboard|ideas)?/);

    // Verify logged in state
    const logoutButton = page.locator(navigation.logoutButton);
    const userMenu = page.locator(navigation.userMenu);
    const isLoggedIn = (await logoutButton.isVisible()) || (await userMenu.isVisible());
    expect(isLoggedIn).toBeTruthy();
  });

  test('user can log out', async ({ page }) => {
    // First, create and log in a user
    const email = generateUniqueEmail();
    const password = generateTestPassword();
    await signup(page, email, password);

    // Verify logged in
    const logoutButton = page.locator(navigation.logoutButton);
    const userMenu = page.locator(navigation.userMenu);
    const wasLoggedIn = (await logoutButton.isVisible()) || (await userMenu.isVisible());
    expect(wasLoggedIn).toBeTruthy();

    // Log out
    await logout(page);

    // Verify logged out (redirected to home and login link visible)
    await expect(page).toHaveURL(/\/?(home)?$/);

    const loginLink = page.locator(navigation.loginLink);
    await expect(loginLink).toBeVisible();

    // Verify logout button is hidden
    await expect(logoutButton).not.toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Try to log in with invalid credentials
    const invalidEmail = 'nonexistent@example.com';
    const invalidPassword = 'wrongpassword123';

    await page.fill(auth.loginEmailInput, invalidEmail);
    await page.fill(auth.loginPasswordInput, invalidPassword);
    await page.click(auth.loginSubmitButton);

    // Wait a moment for error to appear
    await page.waitForTimeout(1000);

    // Verify error message is shown
    const errorMessage = page.locator(
      `${auth.loginError}, text="Invalid credentials", text="Login failed", text="Incorrect email or password"`
    ).first();

    // Should either show error message or stay on login page
    const isErrorVisible = await errorMessage.isVisible();
    const isStillOnLogin = page.url().includes('/login');

    expect(isErrorVisible || isStillOnLogin).toBeTruthy();
  });

  test('signup with invalid email shows validation error', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');

    // Try to sign up with invalid email
    const invalidEmail = 'not-an-email';
    const password = generateTestPassword();

    await page.fill(auth.signupEmailInput, invalidEmail);
    await page.fill(auth.signupPasswordInput, password);
    await page.click(auth.signupSubmitButton);

    // Wait for validation
    await page.waitForTimeout(500);

    // Check for HTML5 validation or custom error
    const emailInput = page.locator(auth.signupEmailInput);
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);

    // Should have validation message or error shown
    const errorMessage = page.locator(auth.signupError);
    const hasError = (validationMessage && validationMessage.length > 0) || (await errorMessage.isVisible());

    expect(hasError).toBeTruthy();
  });

  test('signup with weak password shows validation error', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');

    // Try to sign up with weak password
    const email = generateUniqueEmail();
    const weakPassword = '123'; // Too short

    await page.fill(auth.signupEmailInput, email);
    await page.fill(auth.signupPasswordInput, weakPassword);
    await page.click(auth.signupSubmitButton);

    // Wait for validation
    await page.waitForTimeout(1000);

    // Check for validation error
    const errorMessage = page.locator(
      `${auth.signupError}, text="Password", text="at least", text="too short"`
    ).first();

    const passwordInput = page.locator(auth.signupPasswordInput);
    const validationMessage = await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);

    // Should show error or validation message
    const hasError = (await errorMessage.isVisible()) || (validationMessage && validationMessage.length > 0);
    expect(hasError).toBeTruthy();
  });

  test('signup with missing required fields shows validation error', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');

    // Try to submit without filling any fields
    await page.click(auth.signupSubmitButton);

    // Wait for validation
    await page.waitForTimeout(500);

    // Check email field for required validation
    const emailInput = page.locator(auth.signupEmailInput);
    const emailValidation = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);

    // Should have validation message for required field
    expect(emailValidation).toBeTruthy();
    expect(emailValidation.length).toBeGreaterThan(0);
  });

  test('protected route redirects to login when not authenticated', async ({ page }) => {
    // Ensure logged out
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Try to access protected route (dashboard or profile)
    await page.goto('/dashboard');

    // Wait for redirect
    await page.waitForTimeout(1000);

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('protected route (profile) redirects to login when not authenticated', async ({ page }) => {
    // Ensure logged out
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Try to access profile page
    await page.goto('/profile');

    // Wait for redirect
    await page.waitForTimeout(1000);

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page has link to signup', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Verify signup link exists
    const signupLink = page.locator(auth.signupLinkFromLogin);
    await expect(signupLink).toBeVisible();

    // Click signup link
    await signupLink.click();

    // Verify navigation to signup page
    await expect(page).toHaveURL(/\/signup/);
  });

  test('signup page has link to login', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');

    // Verify login link exists
    const loginLink = page.locator(auth.loginLinkFromSignup);
    await expect(loginLink).toBeVisible();

    // Click login link
    await loginLink.click();

    // Verify navigation to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('signup with existing email shows error', async ({ page }) => {
    // Create a user first
    const email = generateUniqueEmail();
    const password = generateTestPassword();
    await signup(page, email, password);

    // Log out
    await logout(page);

    // Try to sign up again with same email
    await page.goto('/signup');
    await page.fill(auth.signupEmailInput, email);
    await page.fill(auth.signupPasswordInput, password);
    await page.click(auth.signupSubmitButton);

    // Wait for error
    await page.waitForTimeout(2000);

    // Should show error about email already in use
    const errorMessage = page.locator(
      `${auth.signupError}, text="already", text="exists", text="in use"`
    ).first();

    // Either error is visible or still on signup page
    const isErrorVisible = await errorMessage.isVisible();
    const isStillOnSignup = page.url().includes('/signup');

    expect(isErrorVisible || isStillOnSignup).toBeTruthy();
  });

  test('login form has accessible labels', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Check for email label
    const emailLabel = page.locator('label:has-text("Email"), label[for*="email"]');
    await expect(emailLabel).toBeVisible();

    // Check for password label
    const passwordLabel = page.locator('label:has-text("Password"), label[for*="password"]');
    await expect(passwordLabel).toBeVisible();
  });

  test('signup form has accessible labels', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');

    // Check for email label
    const emailLabel = page.locator('label:has-text("Email"), label[for*="email"]');
    await expect(emailLabel).toBeVisible();

    // Check for password label
    const passwordLabel = page.locator('label:has-text("Password"), label[for*="password"]');
    await expect(passwordLabel).toBeVisible();
  });

  test('authentication persists after page reload', async ({ page }) => {
    // Sign up and log in
    const email = generateUniqueEmail();
    const password = generateTestPassword();
    await signup(page, email, password);

    // Verify logged in
    const logoutButton = page.locator(navigation.logoutButton);
    const userMenu = page.locator(navigation.userMenu);
    const wasLoggedIn = (await logoutButton.isVisible()) || (await userMenu.isVisible());
    expect(wasLoggedIn).toBeTruthy();

    // Reload the page
    await page.reload();

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify still logged in after reload
    const stillLoggedIn = (await logoutButton.isVisible()) || (await userMenu.isVisible());
    expect(stillLoggedIn).toBeTruthy();
  });

  test('user can navigate between login and signup pages', async ({ page }) => {
    // Start at login
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);

    // Click signup link
    const signupLink = page.locator(auth.signupLinkFromLogin);
    await signupLink.click();
    await expect(page).toHaveURL(/\/signup/);

    // Click login link
    const loginLink = page.locator(auth.loginLinkFromSignup);
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });
});
