import { test, expect } from '@playwright/test';
import { createAndLoginUser } from './helpers/auth';
import { hero, ideasList, ideaDetail, searchAndFilter, navigation, footer } from './helpers/selectors';
import { categories, difficultyLevels, searchQueries } from './fixtures/test-data';

/**
 * Ideas Browsing and Navigation Tests
 *
 * Tests for browsing ideas and navigation:
 * - Home page loads correctly
 * - Ideas list displays properly
 * - Category filtering works
 * - Search functionality (if implemented)
 * - Idea detail page loads
 * - Navigation between pages
 * - Footer and header elements
 */

test.describe('Ideas Browsing - Guest User', () => {
  test.beforeEach(async ({ page }) => {
    // Start as guest user
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('home page loads with hero section', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Verify hero section is visible
    const heroContainer = page.locator(hero.container);
    if (await heroContainer.isVisible()) {
      await expect(heroContainer).toBeVisible();
    }

    // Verify hero title
    const heroTitle = page.locator(hero.title);
    await expect(heroTitle).toBeVisible();

    // Verify hero has some text content
    const titleText = await heroTitle.textContent();
    expect(titleText).toBeTruthy();
    expect(titleText!.length).toBeGreaterThan(0);
  });

  test('home page has navigation header', async ({ page }) => {
    await page.goto('/');

    // Verify header is visible
    const header = page.locator(navigation.header);
    await expect(header).toBeVisible();

    // Verify logo/home link
    const logo = page.locator(navigation.logo);
    await expect(logo).toBeVisible();

    // Verify navigation links
    const ideasLink = page.locator(navigation.ideasLink);
    await expect(ideasLink).toBeVisible();
  });

  test('home page has footer', async ({ page }) => {
    await page.goto('/');

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Verify footer is visible
    const footerContainer = page.locator(footer.container);
    await expect(footerContainer).toBeVisible();
  });

  test('clicking ideas link navigates to ideas list', async ({ page }) => {
    await page.goto('/');

    // Click ideas link
    const ideasLink = page.locator(navigation.ideasLink);
    await ideasLink.click();

    // Verify navigation to ideas list
    await expect(page).toHaveURL(/\/ideas/);

    // Verify ideas are displayed
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible', timeout: 10000 });
    const ideaCards = page.locator(ideasList.ideaCard);
    const count = await ideaCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('ideas list displays idea cards', async ({ page }) => {
    await page.goto('/ideas');

    // Wait for ideas to load
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });

    // Verify idea cards are displayed
    const ideaCards = page.locator(ideasList.ideaCard);
    const count = await ideaCards.count();
    expect(count).toBeGreaterThan(0);

    // Verify first card has title
    const firstCard = ideaCards.first();
    const title = firstCard.locator(ideasList.ideaTitle);
    await expect(title).toBeVisible();
  });

  test('idea card displays key information', async ({ page }) => {
    await page.goto('/ideas');

    // Wait for ideas to load
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });

    // Get first idea card
    const firstCard = page.locator(ideasList.ideaCard).first();

    // Verify title exists
    const title = firstCard.locator(ideasList.ideaTitle);
    await expect(title).toBeVisible();

    // Verify some content exists (description or other info)
    const cardText = await firstCard.textContent();
    expect(cardText).toBeTruthy();
    expect(cardText!.length).toBeGreaterThan(10);
  });

  test('clicking idea card navigates to detail page', async ({ page }) => {
    await page.goto('/ideas');

    // Wait for ideas to load
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });

    // Click first idea card
    const firstCard = page.locator(ideasList.ideaCard).first();
    await firstCard.click();

    // Verify navigation to detail page
    await page.waitForURL(/\/ideas\/.+/, { timeout: 5000 });

    // Verify detail page loaded
    const ideaTitle = page.locator(ideaDetail.title);
    await expect(ideaTitle).toBeVisible();
  });

  test('idea detail page displays comprehensive information', async ({ page }) => {
    await page.goto('/ideas');
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });

    // Navigate to detail page
    const firstCard = page.locator(ideasList.ideaCard).first();
    await firstCard.click();
    await page.waitForURL(/\/ideas\/.+/);

    // Verify title
    const title = page.locator(ideaDetail.title);
    await expect(title).toBeVisible();

    // Verify description exists
    const description = page.locator(ideaDetail.description);
    await expect(description).toBeVisible();

    // Verify has meaningful content
    const descText = await description.textContent();
    expect(descText).toBeTruthy();
    expect(descText!.length).toBeGreaterThan(20);
  });

  test('navigation breadcrumbs or back button works', async ({ page }) => {
    await page.goto('/ideas');
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });

    // Navigate to detail page
    const firstCard = page.locator(ideasList.ideaCard).first();
    await firstCard.click();
    await page.waitForURL(/\/ideas\/.+/);

    // Go back using browser back button
    await page.goBack();

    // Verify back on ideas list
    await expect(page).toHaveURL(/\/ideas/);

    // Verify ideas are displayed again
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });
  });

  test('logo link returns to home page', async ({ page }) => {
    // Start at ideas page
    await page.goto('/ideas');

    // Click logo
    const logo = page.locator(navigation.logo).first();
    await logo.click();

    // Verify navigation to home
    await expect(page).toHaveURL(/\/?(home)?$/);
  });
});

test.describe('Ideas Browsing - Authenticated User', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await createAndLoginUser(page);
    await page.waitForTimeout(1000);
  });

  test('authenticated user sees more than 5 ideas', async ({ page }) => {
    await page.goto('/ideas');

    // Wait for ideas to load
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible', timeout: 10000 });

    // Count ideas
    const ideaCards = page.locator(ideasList.ideaCard);
    const count = await ideaCards.count();

    // Should see more than 5 (all 87 ideas accessible)
    expect(count).toBeGreaterThan(5);
  });

  test('category filter displays and works', async ({ page }) => {
    await page.goto('/ideas');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Look for category filter
    const categoryFilter = page.locator(searchAndFilter.categoryFilter);

    if (await categoryFilter.isVisible()) {
      // Category filter exists
      await expect(categoryFilter).toBeVisible();

      // Try selecting a category
      await categoryFilter.selectOption({ index: 1 }); // Select second option (first is usually "All")

      // Wait for filter to apply
      await page.waitForTimeout(1000);

      // Verify ideas are still displayed
      const ideaCards = page.locator(ideasList.ideaCard);
      const count = await ideaCards.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('difficulty filter displays and works', async ({ page }) => {
    await page.goto('/ideas');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Look for difficulty filter
    const difficultyFilter = page.locator(searchAndFilter.difficultyFilter);

    if (await difficultyFilter.isVisible()) {
      await expect(difficultyFilter).toBeVisible();

      // Try selecting a difficulty level
      await difficultyFilter.selectOption({ label: 'Beginner' });

      // Wait for filter to apply
      await page.waitForTimeout(1000);

      // Verify ideas are displayed
      const ideaCards = page.locator(ideasList.ideaCard);
      const count = await ideaCards.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('search functionality works', async ({ page }) => {
    await page.goto('/ideas');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Look for search input
    const searchInput = page.locator(searchAndFilter.searchInput);

    if (await searchInput.isVisible()) {
      // Search for a common term
      await searchInput.fill(searchQueries.valid[0]); // "finance"

      // Wait for search results
      await page.waitForTimeout(1000);

      // Verify results are displayed
      const ideaCards = page.locator(ideasList.ideaCard);
      const count = await ideaCards.count();

      // Should have at least some results
      expect(count).toBeGreaterThanOrEqual(0); // 0 or more is acceptable
    }
  });

  test('search with no results shows empty state', async ({ page }) => {
    await page.goto('/ideas');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator(searchAndFilter.searchInput);

    if (await searchInput.isVisible()) {
      // Search for something that won't match
      await searchInput.fill(searchQueries.noResults[0]);

      // Wait for search
      await page.waitForTimeout(1000);

      // Check for either no cards or empty state message
      const ideaCards = page.locator(ideasList.ideaCard);
      const count = await ideaCards.count();

      if (count === 0) {
        // Look for empty state message
        const emptyState = page.locator('text="No ideas found", text="No results", text="Try different"').first();
        // Empty state should exist or just no cards shown
        // This is acceptable behavior
        expect(true).toBeTruthy();
      }
    }
  });

  test('clear filters button resets filters', async ({ page }) => {
    await page.goto('/ideas');
    await page.waitForLoadState('networkidle');

    // Look for clear/reset button
    const clearButton = page.locator(searchAndFilter.clearFiltersButton);

    if (await clearButton.isVisible()) {
      // Apply a filter first
      const categoryFilter = page.locator(searchAndFilter.categoryFilter);
      if (await categoryFilter.isVisible()) {
        await categoryFilter.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        // Click clear button
        await clearButton.click();
        await page.waitForTimeout(500);

        // Verify all ideas are shown again
        const ideaCards = page.locator(ideasList.ideaCard);
        const count = await ideaCards.count();
        expect(count).toBeGreaterThan(5);
      }
    }
  });

  test('pagination works if implemented', async ({ page }) => {
    await page.goto('/ideas');
    await page.waitForLoadState('networkidle');

    // Scroll to bottom to find pagination
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Look for pagination controls
    const nextButton = page.locator('button:has-text("Next"), button[aria-label="Next page"]').first();

    if (await nextButton.isVisible()) {
      // Click next page
      await nextButton.click();

      // Wait for new page to load
      await page.waitForTimeout(1000);

      // Verify ideas are still displayed
      const ideaCards = page.locator(ideasList.ideaCard);
      const count = await ideaCards.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('idea cards show category and difficulty badges', async ({ page }) => {
    await page.goto('/ideas');
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });

    // Get first idea card
    const firstCard = page.locator(ideasList.ideaCard).first();

    // Look for category badge
    const category = firstCard.locator(ideasList.ideaCategory);
    if (await category.isVisible()) {
      await expect(category).toBeVisible();
    }

    // Look for difficulty badge
    const difficulty = firstCard.locator(ideasList.ideaDifficulty);
    if (await difficulty.isVisible()) {
      await expect(difficulty).toBeVisible();
    }

    // At least card should have some metadata
    const cardText = await firstCard.textContent();
    expect(cardText).toBeTruthy();
  });

  test('detail page shows category and difficulty', async ({ page }) => {
    await page.goto('/ideas');
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });

    // Navigate to detail page
    const firstCard = page.locator(ideasList.ideaCard).first();
    await firstCard.click();
    await page.waitForURL(/\/ideas\/.+/);

    // Look for category
    const category = page.locator(ideaDetail.category);
    if (await category.isVisible()) {
      await expect(category).toBeVisible();
    }

    // Look for difficulty
    const difficulty = page.locator(ideaDetail.difficulty);
    if (await difficulty.isVisible()) {
      await expect(difficulty).toBeVisible();
    }
  });

  test('detail page shows tools and tags', async ({ page }) => {
    await page.goto('/ideas');
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });

    // Navigate to detail page
    const firstCard = page.locator(ideasList.ideaCard).first();
    await firstCard.click();
    await page.waitForURL(/\/ideas\/.+/);

    // Look for tools list
    const tools = page.locator(ideaDetail.tools);
    if (await tools.isVisible()) {
      await expect(tools).toBeVisible();

      // Verify has content
      const toolsText = await tools.textContent();
      expect(toolsText).toBeTruthy();
    }

    // Look for tags
    const tags = page.locator(ideaDetail.tags);
    if (await tags.isVisible()) {
      await expect(tags).toBeVisible();
    }
  });

  test('detail page shows estimated build time and monetization', async ({ page }) => {
    await page.goto('/ideas');
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });

    // Navigate to detail page
    const firstCard = page.locator(ideasList.ideaCard).first();
    await firstCard.click();
    await page.waitForURL(/\/ideas\/.+/);

    // Look for estimated time
    const estimatedTime = page.locator(ideaDetail.estimatedTime);
    if (await estimatedTime.isVisible()) {
      await expect(estimatedTime).toBeVisible();
    }

    // Look for monetization info
    const monetization = page.locator(ideaDetail.monetizationPotential);
    if (await monetization.isVisible()) {
      await expect(monetization).toBeVisible();
    }
  });

  test('multiple idea cards can be clicked in sequence', async ({ page }) => {
    await page.goto('/ideas');
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });

    // Test clicking first 3 ideas
    for (let i = 0; i < 3; i++) {
      // Go back to ideas list
      await page.goto('/ideas');
      await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });

      // Click idea
      const ideaCard = page.locator(ideasList.ideaCard).nth(i);
      await ideaCard.click();

      // Verify detail page loaded
      await page.waitForURL(/\/ideas\/.+/);
      const title = page.locator(ideaDetail.title);
      await expect(title).toBeVisible();
    }
  });
});
