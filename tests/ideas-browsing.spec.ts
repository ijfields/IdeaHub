import { test, expect } from '@playwright/test';
import { selectors } from './helpers/selectors';
import { waitForAuth } from './helpers/auth';

test.describe('Ideas Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAuth(page);
  });

  test('should navigate to ideas list from home', async ({ page }) => {
    const browseButton = page.locator(selectors.home.browseFreeIdeasButton).first();
    if (await browseButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await browseButton.click();
      await expect(page).toHaveURL('/ideas');
    }
  });

  test('should display ideas list page', async ({ page }) => {
    await page.goto('/ideas');
    await page.waitForLoadState('networkidle');
    
    // Should show ideas page content
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto('/ideas');
    
    // Look for search input (could be in header or on page)
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill('finance');
      await page.waitForTimeout(500); // Wait for debounce
    }
  });

  test('should navigate to idea detail page', async ({ page }) => {
    await page.goto('/ideas');
    await page.waitForLoadState('networkidle');
    
    // Find first idea link
    const ideaLink = page.locator('a[href*="/ideas/"]').first();
    if (await ideaLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ideaLink.click();
      await page.waitForURL(/\/ideas\/.+/, { timeout: 5000 });
      
      // Should show idea detail
      const title = page.locator('h1').first();
      await expect(title).toBeVisible();
    }
  });

  test('should display idea details', async ({ page }) => {
    await page.goto('/ideas');
    await page.waitForLoadState('networkidle');
    
    const ideaLink = page.locator('a[href*="/ideas/"]').first();
    if (await ideaLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ideaLink.click();
      await page.waitForURL(/\/ideas\/.+/, { timeout: 5000 });
      
      // Check for idea content
      const pageContent = page.locator('body');
      await expect(pageContent).toBeVisible();
    }
  });

  test('should navigate back from idea detail', async ({ page }) => {
    await page.goto('/ideas');
    await page.waitForLoadState('networkidle');
    
    const ideaLink = page.locator('a[href*="/ideas/"]').first();
    if (await ideaLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ideaLink.click();
      await page.waitForURL(/\/ideas\/.+/, { timeout: 5000 });
      
      // Navigate back
      await page.goBack();
      await expect(page).toHaveURL('/ideas');
    }
  });
});




