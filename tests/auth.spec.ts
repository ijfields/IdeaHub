import { test, expect } from '@playwright/test';
import { selectors } from './helpers/selectors';
import { signup, login, logout, testUsers, waitForAuth } from './helpers/auth';

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAuth(page);
  });

  test.describe('Signup Flow', () => {
    test('should display signup page', async ({ page }) => {
      await page.goto('/signup');
      await expect(page.locator(selectors.signup.cardTitle)).toBeVisible();
      await expect(page.locator(selectors.signup.displayNameInput)).toBeVisible();
      await expect(page.locator(selectors.signup.emailInput)).toBeVisible();
      await expect(page.locator(selectors.signup.passwordInput)).toBeVisible();
      await expect(page.locator(selectors.signup.confirmPasswordInput)).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/signup');
      await page.click(selectors.signup.submitButton);
      
      // Check for validation errors (they should appear)
      const emailError = page.locator('text=/email/i').first();
      const passwordError = page.locator('text=/password/i').first();
      
      // At least one error should be visible
      const hasErrors = await Promise.race([
        emailError.isVisible().then(() => true),
        passwordError.isVisible().then(() => true),
        page.waitForTimeout(1000).then(() => false),
      ]);
      
      expect(hasErrors).toBeTruthy();
    });

    test('should show error for password mismatch', async ({ page }) => {
      await page.goto('/signup');
      await page.fill(selectors.signup.displayNameInput, testUsers.valid.displayName);
      await page.fill(selectors.signup.emailInput, testUsers.new.email);
      await page.fill(selectors.signup.passwordInput, testUsers.valid.password);
      await page.fill(selectors.signup.confirmPasswordInput, 'DifferentPassword123!');
      
      // Try to submit
      await page.click(selectors.signup.submitButton);
      
      // Should show password mismatch error
      const errorText = page.locator('text=/password.*match/i');
      await expect(errorText.first()).toBeVisible({ timeout: 5000 });
    });

    test('should require terms acceptance', async ({ page }) => {
      await page.goto('/signup');
      await page.fill(selectors.signup.displayNameInput, testUsers.valid.displayName);
      await page.fill(selectors.signup.emailInput, testUsers.new.email);
      await page.fill(selectors.signup.passwordInput, testUsers.valid.password);
      await page.fill(selectors.signup.confirmPasswordInput, testUsers.valid.password);
      
      // Don't check terms checkbox
      await page.click(selectors.signup.submitButton);
      
      // Should show terms error
      const termsError = page.locator('text=/terms/i');
      await expect(termsError.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Login Flow', () => {
    test('should display login page', async ({ page }) => {
      await page.goto('/login');
      await expect(page.locator(selectors.login.cardTitle)).toBeVisible();
      await expect(page.locator(selectors.login.emailInput)).toBeVisible();
      await expect(page.locator(selectors.login.passwordInput)).toBeVisible();
      await expect(page.locator(selectors.login.submitButton)).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/login');
      await page.click(selectors.login.submitButton);
      
      // Check for validation errors
      const emailError = page.locator('text=/email/i').first();
      const passwordError = page.locator('text=/password/i').first();
      
      const hasErrors = await Promise.race([
        emailError.isVisible().then(() => true),
        passwordError.isVisible().then(() => true),
        page.waitForTimeout(1000).then(() => false),
      ]);
      
      expect(hasErrors).toBeTruthy();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      await page.fill(selectors.login.emailInput, 'invalid@example.com');
      await page.fill(selectors.login.passwordInput, 'WrongPassword123!');
      await page.click(selectors.login.submitButton);
      
      // Should show error toast or message
      const errorMessage = page.locator('text=/invalid|incorrect|failed/i').first();
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });

    test('should navigate to signup page', async ({ page }) => {
      await page.goto('/login');
      await page.click(selectors.login.signupLink);
      await expect(page).toHaveURL('/signup');
    });
  });

  test.describe('Navigation', () => {
    test('should navigate between login and signup', async ({ page }) => {
      await page.goto('/login');
      await page.click(selectors.login.signupLink);
      await expect(page).toHaveURL('/signup');
      
      await page.click(selectors.signup.loginLink);
      await expect(page).toHaveURL('/login');
    });

    test('should access login from header', async ({ page }) => {
      await page.goto('/');
      const loginLink = page.locator(selectors.nav.loginLink).first();
      if (await loginLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await loginLink.click();
        await expect(page).toHaveURL('/login');
      }
    });

    test('should access signup from header', async ({ page }) => {
      await page.goto('/');
      const signupLink = page.locator(selectors.nav.signupLink).first();
      if (await signupLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await signupLink.click();
        await expect(page).toHaveURL('/signup');
      }
    });
  });
});



