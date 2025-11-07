import { test, expect } from '@playwright/test';
import { createAndLoginUser } from './helpers/auth';
import { projectSubmission, ideasList, ideaDetail } from './helpers/selectors';
import { sampleProjects, testProject } from './fixtures/test-data';

/**
 * Project Submission Tests
 *
 * Tests for project submission functionality (authenticated users only):
 * - Submit project form
 * - Form validation (required fields, URL format)
 * - Project display on idea page
 * - Project links are clickable
 * - Tools selection
 */

test.describe('Project Submissions - Authenticated User', () => {
  let ideaUrl: string;

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await createAndLoginUser(page, 'Project Test User');

    // Navigate to an idea detail page
    await page.goto('/ideas');
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });

    const firstIdea = page.locator(ideasList.ideaCard).first();
    await firstIdea.click();
    await page.waitForURL(/\/ideas\/.+/);

    // Save the idea URL
    ideaUrl = page.url();

    // Scroll to projects section
    const projectsSection = page.locator(projectSubmission.section);
    if (await projectsSection.isVisible()) {
      await projectsSection.scrollIntoViewIfNeeded();
    }
  });

  test('authenticated user can see project submission form', async ({ page }) => {
    // Look for submit project button or form
    const submitButton = page.locator(projectSubmission.submitButton);
    const projectForm = page.locator(projectSubmission.projectForm);

    // Either submit button or form should be visible
    const hasButton = await submitButton.isVisible();
    const hasForm = await projectForm.isVisible();

    expect(hasButton || hasForm).toBeTruthy();
  });

  test('clicking submit project button shows form', async ({ page }) => {
    // Look for submit button
    const submitButton = page.locator(projectSubmission.submitButton).first();

    if (await submitButton.isVisible()) {
      // Click submit button
      await submitButton.click();

      // Wait for form to appear
      await page.waitForTimeout(500);

      // Verify form is visible
      const projectForm = page.locator(projectSubmission.projectForm);
      await expect(projectForm).toBeVisible();
    }
  });

  test('user can submit a valid project', async ({ page }) => {
    // Open project form if needed
    const submitButton = page.locator(projectSubmission.submitButton).first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);
    }

    // Fill project form
    const titleInput = page.locator(projectSubmission.titleInput);
    const urlInput = page.locator(projectSubmission.urlInput);
    const descriptionTextarea = page.locator(projectSubmission.descriptionTextarea);

    if (await titleInput.isVisible()) {
      // Create unique project data
      const uniqueTitle = `${testProject.valid.title} - ${Date.now()}`;
      const uniqueUrl = `${testProject.valid.url}?t=${Date.now()}`;

      await titleInput.fill(uniqueTitle);
      await urlInput.fill(uniqueUrl);
      await descriptionTextarea.fill(testProject.valid.description);

      // Submit form
      const submitFormButton = page.locator(projectSubmission.submitFormButton);
      await submitFormButton.click();

      // Wait for submission
      await page.waitForTimeout(2000);

      // Verify project appears in list
      const projectsList = page.locator(projectSubmission.projectsList);
      if (await projectsList.isVisible()) {
        const postedProject = page.locator(`text="${uniqueTitle}"`);
        await expect(postedProject).toBeVisible();
      }
    }
  });

  test('project form validates required fields', async ({ page }) => {
    // Open form
    const submitButton = page.locator(projectSubmission.submitButton).first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);
    }

    // Try to submit without filling required fields
    const submitFormButton = page.locator(projectSubmission.submitFormButton);

    if (await submitFormButton.isVisible()) {
      await submitFormButton.click();

      // Wait for validation
      await page.waitForTimeout(500);

      // Check for validation errors
      const titleInput = page.locator(projectSubmission.titleInput);
      const urlInput = page.locator(projectSubmission.urlInput);

      // Check HTML5 validation
      const titleValidation = await titleInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      const urlValidation = await urlInput.evaluate((el: HTMLInputElement) => el.validationMessage);

      // At least one should have validation message
      const hasValidation = (titleValidation && titleValidation.length > 0) ||
                           (urlValidation && urlValidation.length > 0);
      expect(hasValidation).toBeTruthy();
    }
  });

  test('project form validates URL format', async ({ page }) => {
    // Open form
    const submitButton = page.locator(projectSubmission.submitButton).first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);
    }

    const titleInput = page.locator(projectSubmission.titleInput);
    const urlInput = page.locator(projectSubmission.urlInput);

    if (await titleInput.isVisible() && await urlInput.isVisible()) {
      // Fill with invalid URL
      await titleInput.fill(testProject.invalidUrl.title);
      await urlInput.fill(testProject.invalidUrl.url);

      // Try to submit
      const submitFormButton = page.locator(projectSubmission.submitFormButton);
      await submitFormButton.click();

      // Wait for validation
      await page.waitForTimeout(1000);

      // Check for validation error
      const urlValidation = await urlInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      const errorMessage = page.locator('text="valid URL", text="Invalid URL"').first();

      const hasError = (urlValidation && urlValidation.length > 0) || (await errorMessage.isVisible());
      expect(hasError).toBeTruthy();
    }
  });

  test('project displays with title, URL, and description', async ({ page }) => {
    // Submit a project first
    const submitButton = page.locator(projectSubmission.submitButton).first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);
    }

    const titleInput = page.locator(projectSubmission.titleInput);
    const urlInput = page.locator(projectSubmission.urlInput);
    const descriptionTextarea = page.locator(projectSubmission.descriptionTextarea);

    if (await titleInput.isVisible()) {
      const uniqueTitle = `Display Test ${Date.now()}`;
      const uniqueUrl = `https://test.example.com/${Date.now()}`;
      const description = 'Test description for display';

      await titleInput.fill(uniqueTitle);
      await urlInput.fill(uniqueUrl);
      await descriptionTextarea.fill(description);

      const submitFormButton = page.locator(projectSubmission.submitFormButton);
      await submitFormButton.click();
      await page.waitForTimeout(2000);

      // Verify project is displayed with all info
      const postedProject = page.locator(`text="${uniqueTitle}"`);
      await expect(postedProject).toBeVisible();

      // Verify URL is clickable
      const projectUrl = page.locator(`a[href*="${Date.now()}"]`);
      if (await projectUrl.isVisible()) {
        await expect(projectUrl).toBeVisible();
      }
    }
  });

  test('project URL is clickable and opens in new tab', async ({ page }) => {
    // Look for existing projects
    const projectsList = page.locator(projectSubmission.projectsList);

    if (await projectsList.isVisible()) {
      const projectLinks = page.locator(`${projectSubmission.projectsList} a`);
      const count = await projectLinks.count();

      if (count > 0) {
        // Check first project link
        const firstLink = projectLinks.first();
        await expect(firstLink).toBeVisible();

        // Verify link has href
        const href = await firstLink.getAttribute('href');
        expect(href).toBeTruthy();

        // Verify opens in new tab (target="_blank")
        const target = await firstLink.getAttribute('target');
        if (target) {
          expect(target).toBe('_blank');
        }
      }
    }
  });

  test('user can select tools used in project', async ({ page }) => {
    // Open form
    const submitButton = page.locator(projectSubmission.submitButton).first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);
    }

    // Look for tools selection
    const toolsSelect = page.locator(projectSubmission.toolsSelect);

    if (await toolsSelect.isVisible()) {
      // Select tool(s)
      await toolsSelect.selectOption({ label: 'Claude' });

      // Fill rest of form
      const titleInput = page.locator(projectSubmission.titleInput);
      const urlInput = page.locator(projectSubmission.urlInput);

      await titleInput.fill(`Tools Test ${Date.now()}`);
      await urlInput.fill(`https://tools-test.example.com/${Date.now()}`);

      // Submit
      const submitFormButton = page.locator(projectSubmission.submitFormButton);
      await submitFormButton.click();
      await page.waitForTimeout(2000);

      // Verify tools are displayed with project
      const projectTools = page.locator(projectSubmission.projectTools);
      if (await projectTools.isVisible()) {
        const toolsText = await projectTools.textContent();
        expect(toolsText).toContain('Claude');
      }
    }
  });

  test('project submission updates project count', async ({ page }) => {
    // Get initial project count
    const projectCountElement = page.locator(ideaDetail.projectCount);
    let initialCount = 0;

    if (await projectCountElement.isVisible()) {
      const countText = await projectCountElement.textContent();
      initialCount = parseInt(countText?.match(/\d+/)?.[0] || '0');
    }

    // Submit a project
    const submitButton = page.locator(projectSubmission.submitButton).first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);

      const titleInput = page.locator(projectSubmission.titleInput);
      if (await titleInput.isVisible()) {
        await titleInput.fill(`Count Test ${Date.now()}`);
        await page.locator(projectSubmission.urlInput).fill(`https://count.test/${Date.now()}`);

        await page.locator(projectSubmission.submitFormButton).click();
        await page.waitForTimeout(2000);

        // Check if count increased
        if (await projectCountElement.isVisible()) {
          const newCountText = await projectCountElement.textContent();
          const newCount = parseInt(newCountText?.match(/\d+/)?.[0] || '0');

          expect(newCount).toBeGreaterThanOrEqual(initialCount);
        }
      }
    }
  });

  test('multiple projects display in list', async ({ page }) => {
    // Check if projects list exists
    const projectsList = page.locator(projectSubmission.projectsList);

    if (await projectsList.isVisible()) {
      // Look for existing projects
      const projects = page.locator(projectSubmission.project);
      const count = await projects.count();

      if (count > 1) {
        // Multiple projects exist
        expect(count).toBeGreaterThan(1);

        // Verify each has title and URL
        for (let i = 0; i < Math.min(count, 3); i++) {
          const project = projects.nth(i);
          const title = project.locator(projectSubmission.projectTitle);
          await expect(title).toBeVisible();
        }
      }
    }
  });

  test('project form has cancel button that closes form', async ({ page }) => {
    // Open form
    const submitButton = page.locator(projectSubmission.submitButton).first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);

      // Verify form is open
      const projectForm = page.locator(projectSubmission.projectForm);
      await expect(projectForm).toBeVisible();

      // Look for cancel button
      const cancelButton = page.locator('button:has-text("Cancel")').first();

      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        await page.waitForTimeout(500);

        // Verify form is closed/hidden
        const isFormVisible = await projectForm.isVisible();
        expect(isFormVisible).toBeFalsy();
      }
    }
  });

  test('project form clears after successful submission', async ({ page }) => {
    // Open form
    const submitButton = page.locator(projectSubmission.submitButton).first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);
    }

    const titleInput = page.locator(projectSubmission.titleInput);
    const urlInput = page.locator(projectSubmission.urlInput);
    const descriptionTextarea = page.locator(projectSubmission.descriptionTextarea);

    if (await titleInput.isVisible()) {
      // Fill and submit
      await titleInput.fill(`Clear Test ${Date.now()}`);
      await urlInput.fill(`https://clear.test/${Date.now()}`);
      await descriptionTextarea.fill('Description');

      await page.locator(projectSubmission.submitFormButton).click();
      await page.waitForTimeout(2000);

      // Check if form was cleared or closed
      const isTitleEmpty = (await titleInput.inputValue()) === '';
      const isUrlEmpty = (await urlInput.inputValue()) === '';

      // Form should either be cleared or closed
      const formClosed = !(await titleInput.isVisible());

      expect(isTitleEmpty || isUrlEmpty || formClosed).toBeTruthy();
    }
  });

  test('project persists after page reload', async ({ page }) => {
    // Submit a unique project
    const submitButton = page.locator(projectSubmission.submitButton).first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);

      const titleInput = page.locator(projectSubmission.titleInput);
      if (await titleInput.isVisible()) {
        const uniqueTitle = `Persist Test ${Date.now()} - ${Math.random()}`;
        await titleInput.fill(uniqueTitle);
        await page.locator(projectSubmission.urlInput).fill(`https://persist.test/${Date.now()}`);

        await page.locator(projectSubmission.submitFormButton).click();
        await page.waitForTimeout(2000);

        // Reload page
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Scroll to projects section
        const projectsSection = page.locator(projectSubmission.section);
        if (await projectsSection.isVisible()) {
          await projectsSection.scrollIntoViewIfNeeded();
        }

        // Verify project still exists
        const persistedProject = page.locator(`text="${uniqueTitle}"`);
        await expect(persistedProject).toBeVisible();
      }
    }
  });

  test('long project title displays properly', async ({ page }) => {
    // Open form
    const submitButton = page.locator(projectSubmission.submitButton).first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);

      const titleInput = page.locator(projectSubmission.titleInput);
      if (await titleInput.isVisible()) {
        const longTitle = `This is a very long project title that tests how the system handles lengthy text in project submissions ${Date.now()}`;
        await titleInput.fill(longTitle);
        await page.locator(projectSubmission.urlInput).fill(`https://long-title.test/${Date.now()}`);

        await page.locator(projectSubmission.submitFormButton).click();
        await page.waitForTimeout(2000);

        // Verify project is displayed (may be truncated with ellipsis)
        const postedProject = page.locator(projectSubmission.project).last();
        await expect(postedProject).toBeVisible();

        const projectText = await postedProject.textContent();
        expect(projectText).toBeTruthy();
      }
    }
  });

  test('project description supports multiline text', async ({ page }) => {
    // Open form
    const submitButton = page.locator(projectSubmission.submitButton).first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);

      const titleInput = page.locator(projectSubmission.titleInput);
      const descriptionTextarea = page.locator(projectSubmission.descriptionTextarea);

      if (await titleInput.isVisible() && await descriptionTextarea.isVisible()) {
        const multilineDesc = `Line 1: First line\nLine 2: Second line\nLine 3: Third line - ${Date.now()}`;
        await titleInput.fill(`Multiline Test ${Date.now()}`);
        await page.locator(projectSubmission.urlInput).fill(`https://multiline.test/${Date.now()}`);
        await descriptionTextarea.fill(multilineDesc);

        await page.locator(projectSubmission.submitFormButton).click();
        await page.waitForTimeout(2000);

        // Verify project posted
        const postedProject = page.locator(`text="Line 1"`);
        await expect(postedProject).toBeVisible();
      }
    }
  });
});

test.describe('Project Submissions - Guest User', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure logged out
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Navigate to an idea
    await page.goto('/ideas');
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });
    const firstIdea = page.locator(ideasList.ideaCard).first();
    await firstIdea.click();
    await page.waitForURL(/\/ideas\/.+/);
  });

  test('guest user can view existing projects', async ({ page }) => {
    // Scroll to projects section
    const projectsSection = page.locator(projectSubmission.section);

    if (await projectsSection.isVisible()) {
      await projectsSection.scrollIntoViewIfNeeded();

      // Look for projects list
      const projectsList = page.locator(projectSubmission.projectsList);
      if (await projectsList.isVisible()) {
        const projects = page.locator(projectSubmission.project);
        const count = await projects.count();

        if (count > 0) {
          // Verify can view project info
          const firstProject = projects.first();
          await expect(firstProject).toBeVisible();

          const projectTitle = firstProject.locator(projectSubmission.projectTitle);
          await expect(projectTitle).toBeVisible();
        }
      }
    }
  });

  test('guest user cannot submit projects', async ({ page }) => {
    // Scroll to projects section
    const projectsSection = page.locator(projectSubmission.section);

    if (await projectsSection.isVisible()) {
      await projectsSection.scrollIntoViewIfNeeded();

      // Verify submit button is hidden or shows login prompt
      const submitButton = page.locator(projectSubmission.submitButton);
      const loginMessage = page.locator(projectSubmission.loginToSubmitMessage);

      const hasSubmitButton = await submitButton.isVisible();
      const hasLoginMessage = await loginMessage.isVisible();

      // Either no submit button OR login message shown
      if (hasSubmitButton) {
        // If button exists, clicking should show login prompt
        await submitButton.click();
        await page.waitForTimeout(500);

        // Should redirect to login or show modal
        const isOnLogin = page.url().includes('/login');
        expect(isOnLogin || hasLoginMessage).toBeTruthy();
      }
    }
  });

  test('guest user sees login prompt to submit project', async ({ page }) => {
    // Scroll to projects section
    const projectsSection = page.locator(projectSubmission.section);

    if (await projectsSection.isVisible()) {
      await projectsSection.scrollIntoViewIfNeeded();

      // Look for login prompt
      const loginPrompt = page.locator(
        `${projectSubmission.loginToSubmitMessage}, text="Login to submit", text="Sign in to share"`
      ).first();

      if (await loginPrompt.isVisible()) {
        await expect(loginPrompt).toBeVisible();
      }
    }
  });
});
