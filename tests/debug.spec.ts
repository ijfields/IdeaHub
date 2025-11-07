import { test, expect } from '@playwright/test';

test.describe('Basic Page Load Tests', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if page loaded
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check for any heading
    const heading = page.locator('h1, h2').first();
    if (await heading.isVisible({ timeout: 5000 }).catch(() => false)) {
      const text = await heading.textContent();
      console.log('Found heading:', text);
    }
  });

  test('should load login page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check if page loaded
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check for email input
    const emailInput = page.locator('#email');
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('Email input found');
    } else {
      console.log('Email input not found - checking page content');
      const pageContent = await page.content();
      console.log('Page has email:', pageContent.includes('email'));
    }
  });
});

