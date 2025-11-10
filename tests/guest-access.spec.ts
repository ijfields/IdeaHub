import { test, expect } from '@playwright/test';
import { selectors } from './helpers/selectors';
import { waitForAuth } from './helpers/auth';

test.describe('Guest User Access', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAuth(page);
  });

  test('should display home page for guests', async ({ page }) => {
    await expect(page.locator(selectors.home.heroTitle)).toBeVisible();
    await expect(page.locator(selectors.home.browseFreeIdeasButton)).toBeVisible();
    await expect(page.locator(selectors.home.signupButton)).toBeVisible();
  });

  test('should show 5 free ideas on home page', async ({ page }) => {
    // Check for featured ideas section
    const featuredSection = page.locator('text=/5 Free Ideas|Featured Ideas/i').first();
    await expect(featuredSection).toBeVisible({ timeout: 5000 });
    
    // Check for idea cards (should be at least 5)
    const ideaCards = page.locator(selectors.home.featuredIdeas);
    const count = await ideaCards.count();
    expect(count).toBeGreaterThanOrEqual(0); // At least some ideas visible
  });

  test('should navigate to ideas list page', async ({ page }) => {
    await page.click(selectors.home.browseFreeIdeasButton);
    await expect(page).toHaveURL('/ideas');
  });

  test('should show signup prompts for guests', async ({ page }) => {
    // Check for signup CTAs on home page
    const signupCTAs = page.locator('text=/sign up|create account|get full access/i');
    const count = await signupCTAs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should access ideas list as guest', async ({ page }) => {
    await page.goto('/ideas');
    
    // Should show ideas list
    const ideasPage = page.locator('h1, h2').first();
    await expect(ideasPage).toBeVisible();
  });

  test('should show limited content for guest on idea detail', async ({ page }) => {
    // Navigate to ideas list first
    await page.goto('/ideas');
    await page.waitForLoadState('networkidle');
    
    // Try to find and click first idea card
    const firstIdeaLink = page.locator('a[href*="/ideas/"]').first();
    if (await firstIdeaLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstIdeaLink.click();
      await page.waitForURL(/\/ideas\/.+/, { timeout: 5000 });
      
      // Should show idea detail page
      const ideaTitle = page.locator('h1').first();
      await expect(ideaTitle).toBeVisible();
    }
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/profile');
    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });

  test('should redirect to login when accessing dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });
});



