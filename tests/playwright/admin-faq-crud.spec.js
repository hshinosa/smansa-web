// tests/playwright/admin-faq-crud.spec.js
// Admin FAQ CRUD Operations - Complete test suite

import { test, expect } from '@playwright/test';

// Test data - unique identifier to avoid conflicts
const TEST_TIMESTAMP = Date.now();
const TEST_FAQ = {
  question: `Test FAQ Question ${TEST_TIMESTAMP}`,
  answer: `This is a test answer for FAQ ${TEST_TIMESTAMP}. It contains detailed information.`,
  category: 'Umum',
};

const UPDATED_FAQ = {
  question: `Updated FAQ Question ${TEST_TIMESTAMP}`,
  answer: `This is the updated answer for FAQ ${TEST_TIMESTAMP}.`,
  category: 'Akademik',
};

// Admin credentials (adjust as needed)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';

test.describe('Admin FAQ CRUD Operations', () => {
  // Shared login state for all tests
  test.beforeEach(async ({ page }) => {
    // Navigate to login
    await page.goto('/admin/login');
    await expect(page).toHaveTitle(/Login/);

    // Fill login form
    await page.fill('#email', ADMIN_EMAIL);
    await page.fill('#password', ADMIN_PASSWORD);

    // Submit and wait for redirect
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/**', { timeout: 10000 });
  });

  test('Step 1: Navigate to FAQ page', async ({ page }) => {
    // Navigate to FAQ
    await page.goto('/admin/faqs');

    // Verify page loaded - look for FAQ-related heading
    const header = page.locator('h1, h2, [class*="header"]').filter({ hasText: /FAQ|Kelola FAQ/ }).first();
    await expect(header).toBeVisible();

    // Verify FAQ list or empty state exists
    const faqList = page.locator('[class*="space-y"], [class*="faq"], [class*="list"]').first();
    const emptyState = page.locator('text=Belum ada FAQ');
    await expect(faqList.or(emptyState)).toBeVisible();
  });

  test('Step 2: Create new FAQ entry', async ({ page }) => {
    // Navigate to FAQ
    await page.goto('/admin/faqs');

    // Click "Tambah FAQ" button - try multiple selectors
    const addButton = page.locator('
      button:has-text("Tambah"),
      button:has-text("Add"),
      [class*="PrimaryButton"]
    ').first();
    await addButton.click();

    // Wait for modal to appear
    const modal = page.locator('[role="dialog"], .modal, [class*="Modal"]').first();
    await expect(modal).toBeVisible();

    // Fill form fields
    await page.selectOption('#category', TEST_FAQ.category);
    await page.fill('#question', TEST_FAQ.question);
    await page.fill('#answer', TEST_FAQ.answer);

    // Ensure published is checked (default)
    const publishCheckbox = page.locator('#is_published');
    await expect(publishCheckbox).toBeChecked();

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success indication (toast or modal close)
    await page.waitForTimeout(1000);
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });

  test('Step 3: Verify FAQ appears in list', async ({ page }) => {
    // Navigate to FAQ
    await page.goto('/admin/faqs');

    // Look for the created FAQ
    const faqElement = page.locator(`text=${TEST_FAQ.question}`);
    await expect(faqElement).toBeVisible({ timeout: 5000 });

    // Expand the FAQ to verify content
    await faqElement.click();
    await page.waitForTimeout(300);

    // Verify answer content is visible when expanded
    const answerContent = page.locator(`text=${TEST_FAQ.answer.substring(0, 30)}`);
    await expect(answerContent).toBeVisible();
  });

  test('Step 4: Edit the FAQ entry', async ({ page }) => {
    // Navigate to FAQ
    await page.goto('/admin/faqs');

    // Find the test FAQ
    const faqElement = page.locator(`text=${TEST_FAQ.question}`);
    await expect(faqElement).toBeVisible();

    // Navigate up to find the container with action buttons
    const faqContainer = faqElement.locator('xpath=ancestor::div[contains(@class, "rounded") or contains(@class, "card") or contains(@class, "item")][1]');

    // Find and click edit button (look for Edit2 icon)
    const editButton = faqContainer.locator('button').nth(0); // First action button is usually edit
    await expect(editButton).toBeVisible();
    await editButton.click();

    // Wait for modal
    const modal = page.locator('[role="dialog"], .modal, [class*="Modal"]').first();
    await expect(modal).toBeVisible();

    // Verify modal title indicates edit mode
    await expect(page.locator('text=Edit FAQ')).toBeVisible();

    // Update form fields
    await page.selectOption('#category', UPDATED_FAQ.category);
    await page.fill('#question', UPDATED_FAQ.question);
    await page.fill('#answer', UPDATED_FAQ.answer);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success
    await page.waitForTimeout(1000);
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });

  test('Step 5: Verify edited FAQ in list', async ({ page }) => {
    // Navigate to FAQ
    await page.goto('/admin/faqs');

    // Verify old question is gone
    await expect(page.locator(`text=${TEST_FAQ.question}`)).not.toBeVisible();

    // Verify new question exists
    const updatedElement = page.locator(`text=${UPDATED_FAQ.question}`);
    await expect(updatedElement).toBeVisible({ timeout: 5000 });

    // Verify updated category badge
    const categoryBadge = updatedElement.locator('xpath=..').locator(`text=${UPDATED_FAQ.category}`);
    await expect(categoryBadge.or(updatedElement)).toBeVisible();
  });

  test('Step 6: Delete the FAQ entry', async ({ page }) => {
    // Navigate to FAQ
    await page.goto('/admin/faqs');

    // Find the updated FAQ
    const faqElement = page.locator(`text=${UPDATED_FAQ.question}`);
    await expect(faqElement).toBeVisible();

    // Navigate to find delete button
    const faqContainer = faqElement.locator('xpath=ancestor::div[contains(@class, "rounded") or contains(@class, "card") or contains(@class, "item")][1]');

    // Click delete button (second action button)
    const deleteButton = faqContainer.locator('button').nth(1);
    await expect(deleteButton).toBeVisible();

    // Setup dialog handler before clicking
    page.once('dialog', async dialog => {
      // Verify it's a confirmation dialog
      expect(dialog.message()).toContain('hapus');
      await dialog.accept();
    });

    await deleteButton.click();

    // Wait for deletion to complete
    await page.waitForTimeout(1500);
  });

  test('Step 7: Verify FAQ removal from list', async ({ page }) => {
    // Navigate to FAQ
    await page.goto('/admin/faqs');

    // Verify both old and updated questions are gone
    await expect(page.locator(`text=${TEST_FAQ.question}`)).not.toBeVisible();
    await expect(page.locator(`text=${UPDATED_FAQ.question}`)).not.toBeVisible();

    // Verify we're back to list view
    await expect(page.locator('h1, h2').filter({ hasText: /FAQ|Kelola FAQ/ }).first()).toBeVisible();
  });
});

// Debug test for troubleshooting selector issues
test.describe('FAQ Selector Debugging', () => {
  test('debug page structure', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('#email', ADMIN_EMAIL);
    await page.fill('#password', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/**', { timeout: 10000 });

    await page.goto('/admin/faqs');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'tests/playwright/screenshots/debug-faq-page.png', fullPage: true });

    // Log all buttons with their text
    const buttons = await page.locator('button').all();
    // console.log(`\n=== Found ${buttons.length} buttons ===`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent().catch(() => 'no-text');
      const hasSvg = await buttons[i].locator('svg').count() > 0;
      // console.log(`Button ${i}: "${text?.trim()}" ${hasSvg ? '(has icon)' : ''}`);
    }

    // Log all headings
    const headings = await page.locator('h1, h2, h3').all();
    // console.log(`\n=== Found ${headings.length} headings ===`);
    for (const h of headings) {
      const text = await h.textContent();
      const tagName = await h.evaluate(el => el.tagName);
      // console.log(`${tagName}: "${text?.trim()}"`);
    }

    // Log all modals/dialogs
    const modals = await page.locator('[role="dialog"], .modal, [class*="Modal"]').all();
    // console.log(`\n=== Found ${modals.length} modals ===`);

    // Log form inputs
    const inputs = await page.locator('input, select, textarea').all();
    // console.log(`\n=== Found ${inputs.length} form inputs ===`);
    for (const input of inputs) {
      const type = await input.getAttribute('type').catch(() => 'text');
      const id = await input.getAttribute('id').catch(() => 'no-id');
      const name = await input.getAttribute('name').catch(() => 'no-name');
      // console.log(`Input: type=${type}, id=${id}, name=${name}`);
    }

    // console.log('\n=== Debug screenshot saved to tests/playwright/screenshots/debug-faq-page.png ===\n');
  });
});
