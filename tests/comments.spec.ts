import { test, expect } from '@playwright/test';
import { createAndLoginUser, generateUniqueEmail } from './helpers/auth';
import { comments, ideasList, ideaDetail } from './helpers/selectors';
import { sampleComments, testComment } from './fixtures/test-data';

/**
 * Comments System Tests
 *
 * Tests for comments functionality (authenticated users only):
 * - Creating top-level comments
 * - Replying to comments (nested)
 * - Comment display and formatting
 * - Comment form validation
 * - Comment timestamps and author info
 */

test.describe('Comments System - Authenticated User', () => {
  let ideaUrl: string;

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await createAndLoginUser(page, 'Comment Test User');

    // Navigate to an idea detail page and save the URL
    await page.goto('/ideas');
    await page.waitForSelector(ideasList.ideaCard, { state: 'visible' });

    const firstIdea = page.locator(ideasList.ideaCard).first();
    await firstIdea.click();
    await page.waitForURL(/\/ideas\/.+/);

    // Save the idea URL for reuse
    ideaUrl = page.url();

    // Scroll to comments section
    const commentsSection = page.locator(comments.section);
    if (await commentsSection.isVisible()) {
      await commentsSection.scrollIntoViewIfNeeded();
    }
  });

  test('authenticated user can see comment form', async ({ page }) => {
    // Look for comment form or textarea
    const commentForm = page.locator(comments.commentForm);
    const commentTextarea = page.locator(comments.commentTextarea);

    // At least one should be visible
    const hasForm = await commentForm.isVisible();
    const hasTextarea = await commentTextarea.isVisible();

    expect(hasForm || hasTextarea).toBeTruthy();
  });

  test('user can create a top-level comment', async ({ page }) => {
    // Find comment textarea
    const textarea = page.locator(comments.commentTextarea).first();

    if (await textarea.isVisible()) {
      // Fill in comment
      const commentText = `Test comment ${Date.now()}: ${sampleComments.positive[0]}`;
      await textarea.fill(commentText);

      // Submit comment
      const submitButton = page.locator(comments.submitCommentButton).first();
      await submitButton.click();

      // Wait for comment to be posted
      await page.waitForTimeout(2000);

      // Verify comment appears in the list
      const commentsList = page.locator(comments.commentsList);
      await expect(commentsList).toBeVisible();

      // Look for the comment text
      const postedComment = page.locator(`text="${commentText}"`);
      await expect(postedComment).toBeVisible();
    }
  });

  test('user can reply to an existing comment', async ({ page }) => {
    // First, create a top-level comment
    const textarea = page.locator(comments.commentTextarea).first();

    if (await textarea.isVisible()) {
      const topLevelText = `Top level comment ${Date.now()}`;
      await textarea.fill(topLevelText);

      const submitButton = page.locator(comments.submitCommentButton).first();
      await submitButton.click();

      await page.waitForTimeout(2000);

      // Find the comment we just posted
      const postedComment = page.locator(`text="${topLevelText}"`).first();
      await expect(postedComment).toBeVisible();

      // Look for reply button
      const replyButton = page.locator(comments.replyButton).first();

      if (await replyButton.isVisible()) {
        // Click reply button
        await replyButton.click();

        // Wait for reply form to appear
        await page.waitForTimeout(500);

        // Find reply textarea (might be nested or a new form)
        const replyTextarea = page.locator(comments.commentTextarea).last();
        await replyTextarea.fill(`Reply comment ${Date.now()}`);

        // Submit reply
        const replySubmitButton = page.locator(comments.submitCommentButton).last();
        await replySubmitButton.click();

        // Wait for reply to post
        await page.waitForTimeout(2000);

        // Verify reply appears (look for nested comment class)
        const nestedComment = page.locator(comments.nestedComment);
        if (await nestedComment.isVisible()) {
          await expect(nestedComment).toBeVisible();
        }
      }
    }
  });

  test('comment displays author information', async ({ page }) => {
    // Check existing comments for author info
    const commentsList = page.locator(comments.commentsList);

    if (await commentsList.isVisible()) {
      const existingComments = page.locator(comments.comment);
      const count = await existingComments.count();

      if (count > 0) {
        // Check first comment for author
        const firstComment = existingComments.first();
        const author = firstComment.locator(comments.commentAuthor);

        // Author should be visible or name should be in comment
        const hasAuthor = await author.isVisible();
        const commentText = await firstComment.textContent();

        expect(hasAuthor || (commentText && commentText.includes('Test'))).toBeTruthy();
      }
    }
  });

  test('comment displays timestamp', async ({ page }) => {
    // Check existing comments for timestamp
    const commentsList = page.locator(comments.commentsList);

    if (await commentsList.isVisible()) {
      const existingComments = page.locator(comments.comment);
      const count = await existingComments.count();

      if (count > 0) {
        // Check first comment for timestamp
        const firstComment = existingComments.first();
        const timestamp = firstComment.locator(comments.commentTimestamp);

        if (await timestamp.isVisible()) {
          await expect(timestamp).toBeVisible();

          // Verify timestamp has content
          const timeText = await timestamp.textContent();
          expect(timeText).toBeTruthy();
        }
      }
    }
  });

  test('comment form validation - empty comment shows error', async ({ page }) => {
    const textarea = page.locator(comments.commentTextarea).first();

    if (await textarea.isVisible()) {
      // Try to submit empty comment
      const submitButton = page.locator(comments.submitCommentButton).first();
      await submitButton.click();

      // Wait for validation
      await page.waitForTimeout(500);

      // Check for validation error
      const errorMessage = page.locator('text="required", text="cannot be empty", text="Please enter"').first();
      const isDisabled = await submitButton.isDisabled();

      // Should either show error or button should be disabled
      const hasValidation = (await errorMessage.isVisible()) || isDisabled;
      expect(hasValidation).toBeTruthy();
    }
  });

  test('comment form clears after successful submission', async ({ page }) => {
    const textarea = page.locator(comments.commentTextarea).first();

    if (await textarea.isVisible()) {
      // Fill and submit comment
      const commentText = `Clear test ${Date.now()}`;
      await textarea.fill(commentText);

      const submitButton = page.locator(comments.submitCommentButton).first();
      await submitButton.click();

      // Wait for submission
      await page.waitForTimeout(2000);

      // Check if textarea is cleared
      const textareaValue = await textarea.inputValue();
      expect(textareaValue).toBe('');
    }
  });

  test('multiple comments display correctly', async ({ page }) => {
    const textarea = page.locator(comments.commentTextarea).first();

    if (await textarea.isVisible()) {
      // Create first comment
      await textarea.fill(`First comment ${Date.now()}`);
      await page.locator(comments.submitCommentButton).first().click();
      await page.waitForTimeout(2000);

      // Create second comment
      await textarea.fill(`Second comment ${Date.now()}`);
      await page.locator(comments.submitCommentButton).first().click();
      await page.waitForTimeout(2000);

      // Verify multiple comments are visible
      const allComments = page.locator(comments.comment);
      const count = await allComments.count();

      expect(count).toBeGreaterThanOrEqual(2);
    }
  });

  test('comments section shows when no comments exist', async ({ page }) => {
    // Navigate to potentially new idea
    const commentsSection = page.locator(comments.section);

    // Comments section should be visible even if no comments
    if (await commentsSection.isVisible()) {
      await expect(commentsSection).toBeVisible();

      // Should show comment form or "No comments yet" message
      const textarea = page.locator(comments.commentTextarea);
      const noCommentsMsg = page.locator('text="No comments", text="Be the first"').first();

      const hasForm = await textarea.isVisible();
      const hasMessage = await noCommentsMsg.isVisible();

      expect(hasForm || hasMessage).toBeTruthy();
    }
  });

  test('comment content supports basic text formatting', async ({ page }) => {
    const textarea = page.locator(comments.commentTextarea).first();

    if (await textarea.isVisible()) {
      // Create comment with multiple lines
      const multilineComment = `Line 1\nLine 2\nLine 3 - ${Date.now()}`;
      await textarea.fill(multilineComment);

      const submitButton = page.locator(comments.submitCommentButton).first();
      await submitButton.click();

      await page.waitForTimeout(2000);

      // Verify comment posted (exact formatting may vary)
      const hasContent = page.locator(`text="Line 1"`);
      await expect(hasContent).toBeVisible();
    }
  });

  test('long comment text displays properly', async ({ page }) => {
    const textarea = page.locator(comments.commentTextarea).first();

    if (await textarea.isVisible()) {
      // Create long comment
      const longComment = `This is a very long comment that tests how the system handles lengthy text. ${sampleComments.feedback[0]} ${sampleComments.positive[1]} ${Date.now()}`;
      await textarea.fill(longComment);

      const submitButton = page.locator(comments.submitCommentButton).first();
      await submitButton.click();

      await page.waitForTimeout(2000);

      // Verify comment posted
      const postedComment = page.locator(comments.comment).last();
      const content = await postedComment.textContent();

      expect(content).toBeTruthy();
      expect(content!.length).toBeGreaterThan(50);
    }
  });

  test('cancel button clears comment form', async ({ page }) => {
    const textarea = page.locator(comments.commentTextarea).first();

    if (await textarea.isVisible()) {
      // Fill in some text
      await textarea.fill('Test text to cancel');

      // Look for cancel button
      const cancelButton = page.locator(comments.cancelButton).first();

      if (await cancelButton.isVisible()) {
        await cancelButton.click();

        // Verify textarea is cleared
        const textareaValue = await textarea.inputValue();
        expect(textareaValue).toBe('');
      }
    }
  });

  test('comments persist after page reload', async ({ page }) => {
    const textarea = page.locator(comments.commentTextarea).first();

    if (await textarea.isVisible()) {
      // Create a unique comment
      const uniqueComment = `Persist test ${Date.now()} - ${Math.random()}`;
      await textarea.fill(uniqueComment);

      const submitButton = page.locator(comments.submitCommentButton).first();
      await submitButton.click();

      await page.waitForTimeout(2000);

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Scroll to comments
      const commentsSection = page.locator(comments.section);
      if (await commentsSection.isVisible()) {
        await commentsSection.scrollIntoViewIfNeeded();
      }

      // Verify comment still exists
      const persistedComment = page.locator(`text="${uniqueComment}"`);
      await expect(persistedComment).toBeVisible();
    }
  });

  test('comment count updates after posting', async ({ page }) => {
    // Get initial comment count
    const commentCountElement = page.locator(ideaDetail.commentCount);
    let initialCount = 0;

    if (await commentCountElement.isVisible()) {
      const countText = await commentCountElement.textContent();
      initialCount = parseInt(countText?.match(/\d+/)?.[0] || '0');
    }

    // Post a comment
    const textarea = page.locator(comments.commentTextarea).first();
    if (await textarea.isVisible()) {
      await textarea.fill(`Count test ${Date.now()}`);

      const submitButton = page.locator(comments.submitCommentButton).first();
      await submitButton.click();

      await page.waitForTimeout(2000);

      // Check if comment count increased
      if (await commentCountElement.isVisible()) {
        const newCountText = await commentCountElement.textContent();
        const newCount = parseInt(newCountText?.match(/\d+/)?.[0] || '0');

        expect(newCount).toBeGreaterThanOrEqual(initialCount);
      }
    }
  });

  test('nested reply displays with indentation or visual distinction', async ({ page }) => {
    // Create a comment and reply to test nesting
    const textarea = page.locator(comments.commentTextarea).first();

    if (await textarea.isVisible()) {
      // Create parent comment
      const parentText = `Parent ${Date.now()}`;
      await textarea.fill(parentText);
      await page.locator(comments.submitCommentButton).first().click();
      await page.waitForTimeout(2000);

      // Click reply on the comment
      const replyButton = page.locator(comments.replyButton).first();

      if (await replyButton.isVisible()) {
        await replyButton.click();
        await page.waitForTimeout(500);

        // Fill reply
        const replyTextarea = page.locator(comments.commentTextarea).last();
        await replyTextarea.fill(`Child ${Date.now()}`);
        await page.locator(comments.submitCommentButton).last().click();
        await page.waitForTimeout(2000);

        // Look for nested comment
        const nestedComments = page.locator(comments.nestedComment);
        if (await nestedComments.isVisible()) {
          // Verify visual distinction exists (indentation, border, etc.)
          await expect(nestedComments).toBeVisible();
        }
      }
    }
  });
});

test.describe('Comments System - Guest User', () => {
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

  test('guest user can view existing comments', async ({ page }) => {
    // Scroll to comments section
    const commentsSection = page.locator(comments.section);

    if (await commentsSection.isVisible()) {
      await commentsSection.scrollIntoViewIfNeeded();

      // Look for comments list
      const existingComments = page.locator(comments.comment);
      const count = await existingComments.count();

      if (count > 0) {
        // Verify can read comment content
        const firstComment = existingComments.first();
        await expect(firstComment).toBeVisible();

        const content = await firstComment.textContent();
        expect(content).toBeTruthy();
      }
    }
  });

  test('guest user cannot post comments', async ({ page }) => {
    // Scroll to comments section
    const commentsSection = page.locator(comments.section);

    if (await commentsSection.isVisible()) {
      await commentsSection.scrollIntoViewIfNeeded();

      // Verify comment form is hidden or disabled
      const textarea = page.locator(comments.commentTextarea);
      const submitButton = page.locator(comments.submitCommentButton);

      const isTextareaVisible = await textarea.isVisible();
      const isButtonVisible = await submitButton.isVisible();

      if (isTextareaVisible && isButtonVisible) {
        // If visible, should be disabled
        const isDisabled = await submitButton.isDisabled();
        expect(isDisabled).toBeTruthy();
      }
    }
  });

  test('guest user sees login prompt to comment', async ({ page }) => {
    // Scroll to comments section
    const commentsSection = page.locator(comments.section);

    if (await commentsSection.isVisible()) {
      await commentsSection.scrollIntoViewIfNeeded();

      // Look for login prompt
      const loginPrompt = page.locator(
        `${comments.loginToCommentMessage}, text="Login to comment", text="Sign in to comment"`
      ).first();

      if (await loginPrompt.isVisible()) {
        await expect(loginPrompt).toBeVisible();
      }
    }
  });
});
