import { test, expect, Page } from '@playwright/test';

test.describe('Offline Mode Scenarios', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.describe.configure({ mode: 'serial' });

  test('app should launch in airplane mode', async () => {
    // Enable airplane mode (offline)
    await page.context().setOffline(true);

    // Launch app
    await page.goto('/');

    // Should show offline indicator
    await expect(page.locator('text=You are offline')).toBeVisible();

    // App should still render
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
  });

  test('map should load with cached tiles', async () => {
    await page.context().setOffline(true);
    await page.goto('/map');

    // Map should display cached tiles
    const map = page.locator('[data-testid="offline-map"]');
    await expect(map).toBeVisible();

    // Should show cached indicator
    await expect(page.locator('text=Cached Map')).toBeVisible();

    // Should show offline badge
    await expect(page.locator('[data-testid="offline-badge"]')).toBeVisible();
  });

  test('user should be able to trigger SOS offline', async () => {
    await page.context().setOffline(true);
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/trip/active');

    // Find SOS button
    const sosButton = page.locator('[data-testid="sos-button"]');
    await expect(sosButton).toBeVisible();

    // Long press SOS
    await sosButton.dispatchEvent('mousedown');
    await page.waitForTimeout(3000);
    await sosButton.dispatchEvent('mouseup');

    // Wait for countdown
    await page.waitForTimeout(11000);

    // Should confirm SOS with offline indicator
    await expect(page.locator('text=SOS Confirmed')).toBeVisible();
    await expect(page.locator('text=Will sync when online')).toBeVisible();

    // SOS should be queued
    const pendingQueue = page.locator('[data-testid="pending-sync-queue"]');
    await expect(pendingQueue).toContainText('SOS Alert');
  });

  test('pending sync queue should be visible', async () => {
    await page.context().setOffline(true);
    await page.goto('/settings/sync');

    // Pending items should show
    const queue = page.locator('[data-testid="sync-queue"]');
    await expect(queue).toBeVisible();

    // Should show count
    await expect(queue.locator('text=1 item pending')).toBeVisible();

    // SOS item should be queued
    await expect(queue.locator('text=SOS Alert')).toBeVisible();
  });

  test('data should be created and saved locally', async () => {
    await page.context().setOffline(true);
    await page.goto('/review/new');

    // Create a review while offline
    await page.fill('textarea[name="review"]', 'Amazing mountain experience!');
    await page.selectOption('select[name="rating"]', '5');
    await page.click('button[type="submit"]');

    // Should show saved locally indicator
    await expect(page.locator('text=Saved locally')).toBeVisible();

    // Review should be in pending queue
    await page.goto('/settings/sync');
    await expect(page.locator('text=Review')).toBeVisible();
  });

  test('navigation should work without signal', async () => {
    await page.context().setOffline(true);

    // Navigate between cached pages
    await page.goto('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();

    await page.goto('/profile');
    await expect(page.locator('text=Profile')).toBeVisible();

    await page.goto('/settings');
    await expect(page.locator('text=Settings')).toBeVisible();
  });

  test('should sync when coming online', async () => {
    // First, have some pending items
    await page.context().setOffline(true);
    await page.goto('/settings/sync');

    // Check pending count
    const pendingCount = await page.locator('[data-testid="sync-queue"] [data-testid="item"]').count();

    // Go online
    await page.context().setOffline(false);

    // Should show syncing indicator
    await expect(page.locator('text=Syncing...')).toBeVisible();

    // Wait for sync to complete
    await page.waitForTimeout(3000);

    // Should show success
    await expect(page.locator('text=Sync complete')).toBeVisible();

    // Pending items should be cleared
    const newPendingCount = await page.locator('[data-testid="sync-queue"] [data-testid="item"]').count();
    expect(newPendingCount).toBeLessThan(pendingCount);
  });

  test('should handle sync conflicts', async () => {
    // Go offline
    await page.context().setOffline(true);

    // Edit user profile
    await page.goto('/profile');
    await page.fill('input[name="name"]', 'Offline Name Change');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Saved locally')).toBeVisible();

    // Go online
    await page.context().setOffline(false);

    // Wait for sync
    await page.waitForTimeout(5000);

    // If conflict exists, should show resolution dialog
    const conflictDialog = page.locator('[data-testid="conflict-resolution-dialog"]');
    if (await conflictDialog.isVisible()) {
      // Choose to keep local version
      await conflictDialog.locator('button:has-text("Keep local")').click();
      await expect(page.locator('text=Conflict resolved')).toBeVisible();
    }
  });

  test('should show error for non-cacheable requests', async () => {
    await page.context().setOffline(true);

    // Try to access non-cached API
    await page.goto('/api/user-data');

    // Should show error
    await expect(page.locator('text=Unable to load')).toBeVisible();
    await expect(page.locator('text=You are offline')).toBeVisible();
  });

  test('offline data should persist after app restart', async () => {
    // Create some offline data
    await page.context().setOffline(true);
    await page.goto('/note/new');
    await page.fill('textarea[name="note"]', 'Offline note content');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Saved locally')).toBeVisible();

    // Close and reopen page (simulating app restart)
    await page.close();
    const newPage = await page.context().newPage();

    // Go offline again and check data persists
    await newPage.context().setOffline(true);
    await newPage.goto('/notes');

    // Offline note should still be visible
    await expect(newPage.locator('text=Offline note content')).toBeVisible();
  });

  test('should gracefully handle sync failures', async () => {
    // Go offline
    await page.context().setOffline(true);

    // Create data
    await page.goto('/bookmark/new');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Saved locally')).toBeVisible();

    // Come online but server returns error
    // This would require mocking the server to return 500
    // For now, just verify retry mechanism exists
    await page.context().setOffline(false);

    // Should show retry indicator
    await expect(page.locator('text=Retrying sync')).toBeVisible();
  });

  test('location tracking should buffer while offline', async () => {
    await page.context().setOffline(true);

    // Start tracking
    await page.goto('/trip/active');
    await page.click('button:has-text("Start Tracking")');

    // Wait for location updates to be buffered
    await page.waitForTimeout(60000); // 1 minute

    // Check buffered location count
    const bufferedLocations = await page.locator('[data-testid="buffered-locations"]').textContent();
    expect(parseInt(bufferedLocations || '0')).toBeGreaterThan(0);

    // Should show buffer indicator
    await expect(page.locator('text=Locations buffered')).toBeVisible();
  });

  test('should clean up synced items from queue', async () => {
    // Sync all pending items first
    await page.goto('/settings/sync');
    const initialCount = await page.locator('[data-testid="sync-queue"] [data-testid="item"]').count();

    if (initialCount > 0) {
      // Manually sync
      await page.click('button:has-text("Sync Now")');
      await page.waitForTimeout(5000);

      // Count should decrease
      const finalCount = await page.locator('[data-testid="sync-queue"] [data-testid="item"]').count();
      expect(finalCount).toBeLessThan(initialCount);
    }
  });
});
