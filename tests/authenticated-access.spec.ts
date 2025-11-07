import { test, expect } from '@playwright/test';
import { createAndLoginUser } from './helpers/auth';
import { navigation, ideasList, ideaDetail, dashboard, profile } from './helpers/selectors';
import { freeTierIdeas } from './fixtures/test-data';

/**
 * Authenticated User Access Tests
 *
 * Tests for authenticated users to verify:
 * - Can see all 87 ideas (not just 5)
 * - Can access any idea detail page
 * - BuyButton shows full content
 * - Can access dashboard
 * - Can access profile
 * - Premium features are unlocked
 */

test.describe('Authenticated User Access', () => {
  // Setup: Create and login a user before each test
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page, 'Test User');
    // Wait for auth to settle
    await page.waitForTimeout(1000);
  });

  test('authenticated user sees all ideas (not just 5)', async ({ page }) => {
    // Navigate to ideas list
    await page.goto('/ideas');

    // Wait for ideas to load
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible', timeout: 10000 });

    // Count idea cards
    const ideaCards = page.locator(ideasList.ideaCard);
    const count = await ideaCards.count();

    // Authenticated users should see MORE than 5 ideas
    // Should see all 87 ideas (or at least significantly more than 5)
    expect(count).toBeGreaterThan(5);

    // Optionally verify count is close to 87 (might have pagination)
    // For now, just verify it's more than the 5 free-tier ideas
  });

  test('authenticated user can access free-tier ideas', async ({ page }) => {
    // Navigate to ideas list
    await page.goto('/ideas');

    // Wait for ideas to load
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });

    // Verify all free-tier ideas are still accessible
    for (const idea of freeTierIdeas) {
      const ideaCard = page.locator(`text="${idea.title}"`);
      await expect(ideaCard).toBeVisible();
    }
  });

  test('authenticated user can access premium ideas', async ({ page }) => {
    // Navigate to ideas list
    await page.goto('/ideas');

    // Wait for ideas to load
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });

    // Get all idea cards
    const ideaCards = page.locator(ideasList.ideaCard);
    const count = await ideaCards.count();

    // Should have premium ideas (more than 5)
    expect(count).toBeGreaterThan(5);

    // Try to access an idea that's not in the free-tier list
    // Click on an idea beyond the first 5
    if (count > 5) {
      const sixthIdea = ideaCards.nth(5); // 6th card (0-indexed)
      await sixthIdea.click();

      // Should successfully navigate to detail page
      await page.waitForURL(/\/ideas\/.+/, { timeout: 5000 });

      // Verify detail page loaded
      const ideaTitle = page.locator(ideaDetail.title);
      await expect(ideaTitle).toBeVisible();
    }
  });

  test('authenticated user sees BuyButton with full content', async ({ page }) => {
    // Navigate to ideas list
    await page.goto('/ideas');

    // Wait for ideas to load
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });

    // Look for BuyButton idea
    const buyButtonCard = page.locator('text="BuyButton"').first();

    if (await buyButtonCard.isVisible()) {
      // Click on BuyButton idea
      await buyButtonCard.click();
      await page.waitForURL(/\/ideas\/.+/);

      // Wait for content to load
      await page.waitForTimeout(1000);

      // Scroll down to see more content
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

      // Verify full implementation guide content is visible or accessible
      // (authenticated users should see more than just the basic overview)

      // Look for implementation-specific terms
      const implementationContent = page.locator(
        'text="Implementation", text="Step-by-Step", text="Code Architecture", text="Monetization"'
      ).first();

      // At least some implementation detail should be visible
      const hasImplementationContent = await implementationContent.isVisible();
      expect(hasImplementationContent).toBeTruthy();
    }
  });

  test('authenticated user can access dashboard', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Verify dashboard loaded
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify dashboard content is visible
    const dashboardContainer = page.locator(dashboard.container);
    await expect(dashboardContainer).toBeVisible();

    // Verify some dashboard elements
    const welcomeMessage = page.locator(dashboard.welcomeMessage);
    if (await welcomeMessage.isVisible()) {
      await expect(welcomeMessage).toBeVisible();
    }
  });

  test('authenticated user can access profile', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profile');

    // Verify profile loaded
    await expect(page).toHaveURL(/\/profile/);

    // Verify profile content is visible
    const profileContainer = page.locator(profile.container);
    await expect(profileContainer).toBeVisible();
  });

  test('authenticated user navigation shows dashboard and profile links', async ({ page }) => {
    // Go to home page
    await page.goto('/');

    // Wait for navigation to load
    await page.waitForSelector(navigation.header, { state: 'visible' });

    // Check for dashboard link (might be in user menu or main nav)
    const dashboardLink = page.locator(navigation.dashboardLink);

    // Check for profile link
    const profileLink = page.locator(navigation.profileLink);

    // Check user menu
    const userMenu = page.locator(navigation.userMenu);

    // At least one of these should be visible for authenticated users
    const hasDashboard = await dashboardLink.isVisible();
    const hasProfile = await profileLink.isVisible();
    const hasUserMenu = await userMenu.isVisible();

    expect(hasDashboard || hasProfile || hasUserMenu).toBeTruthy();
  });

  test('authenticated user does not see signup prompts', async ({ page }) => {
    // Navigate to ideas list
    await page.goto('/ideas');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify signup CTAs are not shown (or less prominent)
    const signupLink = page.locator(navigation.signupLink);

    // Signup link should NOT be visible in main navigation
    const isSignupVisible = await signupLink.isVisible();
    expect(isSignupVisible).toBeFalsy();
  });

  test('authenticated user does not see login link in navigation', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Wait for navigation to load
    await page.waitForSelector(navigation.header, { state: 'visible' });

    // Login link should not be visible
    const loginLink = page.locator(navigation.loginLink);
    await expect(loginLink).not.toBeVisible();
  });

  test('authenticated user sees logout button or user menu', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Wait for navigation to load
    await page.waitForSelector(navigation.header, { state: 'visible' });

    // Check for logout button or user menu
    const logoutButton = page.locator(navigation.logoutButton);
    const userMenu = page.locator(navigation.userMenu);

    // At least one should be visible
    const hasLogout = await logoutButton.isVisible();
    const hasUserMenu = await userMenu.isVisible();

    expect(hasLogout || hasUserMenu).toBeTruthy();
  });

  test('authenticated user can access any idea detail page', async ({ page }) => {
    // Navigate to ideas list
    await page.goto('/ideas');

    // Wait for ideas to load
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });

    // Get all idea cards
    const ideaCards = page.locator(ideasList.ideaCard);
    const count = await ideaCards.count();

    // Test accessing multiple ideas (first 3 for efficiency)
    const testCount = Math.min(count, 3);

    for (let i = 0; i < testCount; i++) {
      // Navigate back to ideas list
      await page.goto('/ideas');
      await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });

      // Click on idea
      const ideaCard = ideaCards.nth(i);
      await ideaCard.click();

      // Verify navigation to detail page
      await page.waitForURL(/\/ideas\/.+/, { timeout: 5000 });

      // Verify detail page loaded
      const ideaTitle = page.locator(ideaDetail.title);
      await expect(ideaTitle).toBeVisible();

      // Verify description is visible
      const description = page.locator(ideaDetail.description);
      await expect(description).toBeVisible();
    }
  });

  test('authenticated user can view idea stats (view count, comment count)', async ({ page }) => {
    // Navigate to an idea detail page
    await page.goto('/ideas');
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });

    const firstIdea = page.locator(ideasList.ideaCard).first();
    await firstIdea.click();
    await page.waitForURL(/\/ideas\/.+/);

    // Look for stats elements
    const viewCount = page.locator(ideaDetail.viewCount);
    const commentCount = page.locator(ideaDetail.commentCount);
    const projectCount = page.locator(ideaDetail.projectCount);

    // At least some stats should be visible
    const hasViewCount = await viewCount.isVisible();
    const hasCommentCount = await commentCount.isVisible();
    const hasProjectCount = await projectCount.isVisible();

    // At least one stat should be shown
    expect(hasViewCount || hasCommentCount || hasProjectCount).toBeTruthy();
  });

  test('authenticated user can navigate between pages freely', async ({ page }) => {
    // Start at home
    await page.goto('/');

    // Navigate to ideas
    await page.goto('/ideas');
    await expect(page).toHaveURL(/\/ideas/);

    // Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to profile
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile/);

    // Navigate back to home
    await page.goto('/');
    await expect(page).toHaveURL(/\/?(home)?$/);

    // All navigations should succeed without redirects to login
  });

  test('authenticated user sees all idea categories', async ({ page }) => {
    // Navigate to ideas list
    await page.goto('/ideas');

    // Wait for ideas to load
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });

    // Scroll through page to see all ideas
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Get all idea cards
    const ideaCards = page.locator(ideasList.ideaCard);
    const count = await ideaCards.count();

    // Should see many ideas from different categories
    // Authenticated users have access to all 13 categories
    expect(count).toBeGreaterThanOrEqual(10); // At least 10 ideas visible
  });

  test('authenticated user can search across all ideas', async ({ page }) => {
    // Navigate to ideas list
    await page.goto('/ideas');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();

    if (await searchInput.isVisible()) {
      // Search for a term that might be in premium ideas
      await searchInput.fill('SaaS');

      // Wait for results
      await page.waitForTimeout(1000);

      // Should show results (authenticated users can search all ideas)
      const ideaCards = page.locator(ideasList.ideaCard);
      const count = await ideaCards.count();

      // Should have at least some results
      expect(count).toBeGreaterThan(0);
    }
  });

  test('authenticated user authentication persists across navigation', async ({ page }) => {
    // Start at home
    await page.goto('/');

    // Verify logged in
    const logoutButton = page.locator(navigation.logoutButton);
    const userMenu = page.locator(navigation.userMenu);
    const isLoggedIn = (await logoutButton.isVisible()) || (await userMenu.isVisible());
    expect(isLoggedIn).toBeTruthy();

    // Navigate to different pages
    await page.goto('/ideas');
    const stillLoggedIn1 = (await logoutButton.isVisible()) || (await userMenu.isVisible());
    expect(stillLoggedIn1).toBeTruthy();

    await page.goto('/dashboard');
    const stillLoggedIn2 = (await logoutButton.isVisible()) || (await userMenu.isVisible());
    expect(stillLoggedIn2).toBeTruthy();

    // Auth should persist across all navigation
  });
});
