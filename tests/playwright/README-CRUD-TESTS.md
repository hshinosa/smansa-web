# Admin CRUD Tests - Quick Reference

## Files Created

1. **Plan**: `docs/plans/2026-03-14-admin-crud-playwright-tests.md`
2. **FAQ Test**: `tests/playwright/admin-faq-crud.spec.js`

## Exact Sequence: FAQ CRUD Test

### Step 1: Login
```javascript
await page.goto('/admin/login');
await page.fill('#email', 'admin@example.com');
await page.fill('#password', 'password');
await page.click('button[type="submit"]');
await page.waitForURL('**/admin/**');
```
**Checkpoint**: URL contains `/admin/`

### Step 2: Navigate to FAQ
```javascript
await page.goto('/admin/faqs');
await expect(page.locator('h1, h2').filter({ hasText: /FAQ/ })).toBeVisible();
```
**Checkpoint**: Page shows "Kelola FAQ" or FAQ list

### Step 3: Create Entry
```javascript
await page.click('button:has-text("Tambah")');
await page.selectOption('#category', 'Umum');
await page.fill('#question', 'Test Question');
await page.fill('#answer', 'Test Answer');
await page.click('button[type="submit"]');
await expect(modal).not.toBeVisible();
```
**Checkpoint**: Modal closes, success toast appears

### Step 4: Verify List
```javascript
await page.goto('/admin/faqs');
await expect(page.locator('text=Test Question')).toBeVisible();
```
**Checkpoint**: Created FAQ visible in list

### Step 5: Edit
```javascript
await page.click('button').nth(0); // Edit button
await page.fill('#question', 'Updated Question');
await page.click('button[type="submit"]');
```
**Checkpoint**: Modal closes

### Step 6: Verify Change
```javascript
await expect(page.locator('text=Test Question')).not.toBeVisible();
await expect(page.locator('text=Updated Question')).toBeVisible();
```
**Checkpoint**: Old text gone, new text present

### Step 7: Delete
```javascript
page.once('dialog', async d => await d.accept());
await page.click('button').nth(1); // Delete button
await page.waitForTimeout(1500);
```
**Checkpoint**: Dialog accepted

### Step 8: Verify Removal
```javascript
await expect(page.locator('text=Updated Question')).not.toBeVisible();
```
**Checkpoint**: FAQ removed from list

---

## Run Commands

```bash
# Install Playwright (if not installed)
npm install -D @playwright/test
npx playwright install

# Run FAQ CRUD tests (headless)
npx playwright test tests/playwright/admin-faq-crud.spec.js

# Run with browser visible (debug)
npx playwright test tests/playwright/admin-faq-crud.spec.js --headed

# Run specific step
npx playwright test tests/playwright/admin-faq-crud.spec.js --grep "Step 2"

# Debug mode (step through)
npx playwright test tests/playwright/admin-faq-crud.spec.js --debug

# Generate HTML report
npx playwright test --reporter=html
npx playwright show-report
```

---

## Selector Fallback Strategy

If selectors fail, use the debug test:

```bash
npx playwright test tests/playwright/admin-faq-crud.spec.js --grep "debug" --headed
```

This will:
1. Take a screenshot
2. Log all buttons with text
3. Log all headings
4. Log all form inputs

Use the output to identify correct selectors.

---

## Common Selector Patterns

| Element | Primary Selector | Fallback |
|---------|-----------------|----------|
| Add Button | `button:has-text("Tambah")` | `[class*="PrimaryButton"]` |
| Modal | `[role="dialog"]` | `[class*="Modal"]` |
| Form Input | `#question` | `[name="question"]` |
| Edit Button | `button:has(svg)` | `button` index 0 |
| Delete Button | `button:has(svg)` | `button` index 1 |
| FAQ Item | `text=Question` | `[class*="faq"]` |

---

## Test Data Strategy

Tests use `Date.now()` to create unique data:

```javascript
const TEST_TIMESTAMP = Date.now();
const TEST_FAQ = {
  question: `Test FAQ Question ${TEST_TIMESTAMP}`,
  // ...
};
```

This prevents conflicts when running tests multiple times.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Login fails | Update ADMIN_EMAIL/PASSWORD in test file |
| Modal not found | Add `await page.waitForTimeout(500)` |
| Element not visible | Check if FAQ list is empty vs populated |
| Dialog not handled | Ensure `page.once('dialog')` before click |
| Timeout | Increase timeout: `{ timeout: 10000 }` |

---

## Next Steps

1. **Update credentials** in `tests/playwright/admin-faq-crud.spec.js` (lines 21-22)
2. **Run debug test** to verify selectors: `npx playwright test --grep "debug" --headed`
3. **Run full FAQ CRUD**: `npx playwright test tests/playwright/admin-faq-crud.spec.js`
4. **Create Posts test** (optional): Copy pattern from FAQ test
