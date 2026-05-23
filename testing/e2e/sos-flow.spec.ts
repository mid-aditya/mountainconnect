import { test, expect, Page } from '@playwright/test';

test.describe('SOS Emergency Flow', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    // Login as test user
    await page.goto('/');
    await page.fill('input[type="email"]', 'test@mountainconnect.id');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should trigger SOS with countdown', async () => {
    // This test should be done on mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // Navigate to active trip
    await page.goto('/trip/active');

    // Find and long-press SOS button (3 seconds)
    const sosButton = page.locator('[data-testid="sos-button"]');
    await expect(sosButton).toBeVisible();

    // Long press
    await sosButton.dispatchEvent('mousedown');
    await page.waitForTimeout(3000);
    await sosButton.dispatchEvent('mouseup');

    // Should show countdown modal
    const countdownModal = page.locator('[data-testid="sos-countdown-modal"]');
    await expect(countdownModal).toBeVisible();

    // Countdown should show 10 seconds
    await expect(countdownModal.locator('text=10')).toBeVisible();
  });

  test('should allow SOS cancel during countdown', async () => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/trip/active');

    // Trigger SOS
    const sosButton = page.locator('[data-testid="sos-button"]');
    await sosButton.dispatchEvent('mousedown');
    await page.waitForTimeout(3000);
    await sosButton.dispatchEvent('mouseup');

    // Click cancel during countdown
    const cancelButton = page.locator('[data-testid="sos-cancel-button"]');
    await cancelButton.click();

    // Modal should close
    await expect(page.locator('[data-testid="sos-countdown-modal"]')).not.toBeVisible();
  });

  test('should confirm SOS and create alert', async () => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/trip/active');

    // Trigger SOS and wait for countdown to complete
    const sosButton = page.locator('[data-testid="sos-button"]');
    await sosButton.dispatchEvent('mousedown');
    await page.waitForTimeout(3000);
    await sosButton.dispatchEvent('mouseup');

    // Wait for countdown to finish (10 seconds + buffer)
    await page.waitForTimeout(11000);

    // Should show SOS confirmation
    await expect(page.locator('text=SOS Confirmed')).toBeVisible();

    // Should show GPS coordinates
    await expect(page.locator('text=Location captured')).toBeVisible();
  });

  test('should notify emergency contacts', async () => {
    // This test requires SMS service mocking
    test.skip(true, 'Requires SMS service mock');

    // After SOS confirmation, verify:
    // 1. Emergency contacts received SMS
    // 2. Dashboard shows new SOS marker
  });

  test('should show SOS on admin dashboard', async ({ browser: adminBrowser }) => {
    // Open admin dashboard in new context
    const adminContext = await adminBrowser.newContext();
    const adminPage = await adminContext.newPage();

    // Login as admin
    await adminPage.goto('/');
    await adminPage.fill('input[type="email"]', 'admin@mountainconnect.id');
    await adminPage.fill('input[type="password"]', 'AdminPassword123!');
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL(/\/dashboard/);

    // Navigate to emergency page
    await adminPage.click('text=Emergency');
    await expect(adminPage).toHaveURL(/\/dashboard\/emergency/);

    // Should show active SOS indicator
    await expect(adminPage.locator('[data-testid="active-sos-badge"]')).toBeVisible();
    await expect(adminPage.locator('text=1 Active SOS')).toBeVisible();
  });

  test('should display SOS marker on map', async ({ browser: adminBrowser }) => {
    const adminContext = await adminBrowser.newContext();
    const adminPage = await adminContext.newPage();

    // Login as admin
    await adminPage.goto('/dashboard/emergency');

    // Map should be visible
    const map = adminPage.locator('[data-testid="emergency-map"]');
    await expect(map).toBeVisible();

    // Should show pulsing red marker for active SOS
    const sosMarker = adminPage.locator('[data-testid="sos-marker"]');
    await expect(sosMarker).toBeVisible();
  });

  test('should resolve SOS from dashboard', async ({ browser: adminBrowser }) => {
    const adminContext = await adminBrowser.newContext();
    const adminPage = await adminContext.newPage();

    await adminPage.goto('/dashboard/emergency');

    // Find active SOS in list
    const sosItem = adminPage.locator('[data-testid="sos-list-item"]').first();

    // Click resolve button
    await sosItem.locator('button:has-text("Resolve")').click();

    // Should show confirmation dialog
    await expect(adminPage.locator('text=Confirm Resolution')).toBeVisible();

    // Confirm
    await adminPage.click('button:has-text("Confirm")');

    // Should show success
    await expect(adminPage.locator('text=SOS Resolved')).toBeVisible();

    // SOS count should decrease
    await expect(adminPage.locator('[data-testid="active-sos-badge"]')).toHaveText('0 Active SOS');

    await await adminContext.close();
  });

  test('should log SOS to incident history', async () => {
    await page.goto('/trip/history');

    // Should show resolved SOS in history
    await expect(page.locator('text=SOS Alert')).toBeVisible();
    await expect(page.locator('text=Resolved')).toBeVisible();
  });

  test('should handle offline SOS trigger', async () => {
    // Enable offline mode
    await page.context().setOffline(true);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/trip/active');

    // Trigger SOS
    const sosButton = page.locator('[data-testid="sos-button"]');
    await sosButton.dispatchEvent('mousedown');
    await page.waitForTimeout(3000);
    await sosButton.dispatchEvent('mouseup');

    // Wait for countdown
    await page.waitForTimeout(11000);

    // Should show offline mode notification
    await expect(page.locator('text=SOS saved offline')).toBeVisible();
    await expect(page.locator('text=Will sync when online')).toBeVisible();

    // Disable offline mode
    await page.context().setOffline(false);

    // Should sync and show success
    await expect(page.locator('text=SOS synced successfully')).toBeVisible();
  });
});
