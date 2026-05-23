import { test, expect, Page } from '@playwright/test';

test.describe('Authentication Flow', () => {
  let page: Page;
  const testUser = {
    email: `testuser_${Date.now()}@mountainconnect.id`,
    password: 'TestPassword123!',
    name: 'Test User',
  };

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should register a new user', async () => {
    await page.goto('/');

    // Click register link
    await page.click('text=Create account');
    await expect(page).toHaveURL(/\/register/);

    // Fill registration form
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);

    // Accept terms
    await page.click('input[type="checkbox"]');

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to email verification
    await expect(page).toHaveURL(/\/verify-email/);
    await expect(page.locator('text=verification')).toBeVisible();
  });

  test('should verify email with OTP', async () => {
    // This test requires a real email or mock
    // In production, use a test email service like Mailtrap
    test.skip(true, 'Requires real email service');
  });

  test('should login with valid credentials', async () => {
    await page.goto('/');

    // Fill login form
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
  });

  test('should persist user session', async () => {
    // Navigate away and come back
    await page.goto('/');
    await page.goto('https://example.com');
    await page.goto('/dashboard');

    // Should still be logged in
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
  });

  test('should update user profile', async () => {
    await page.goto('/dashboard');

    // Navigate to settings
    await page.click('text=Settings');
    await expect(page).toHaveURL(/\/settings/);

    // Update profile
    await page.fill('input[name="phone"]', '+6281234567890');
    await page.fill('textarea[name="bio"]', 'Passionate mountain enthusiast');

    // Save
    await page.click('button:has-text("Save Changes")');

    // Verify success toast
    await expect(page.locator('text=Profile updated')).toBeVisible();
  });

  test('should logout successfully', async () => {
    await page.goto('/dashboard');

    // Click user menu
    await page.click('[data-testid="user-menu"]');

    // Click logout
    await page.click('text=Logout');

    // Should redirect to login
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Sign in')).toBeVisible();
  });

  test('should login again after logout', async () => {
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should reject invalid credentials', async () => {
    await page.goto('/');

    // Enter wrong password
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', 'WrongPassword123!');

    await page.click('button[type="submit"]');

    // Should show error
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });

  test('should show validation errors on registration', async () => {
    await page.goto('/register');

    // Submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should login with Google OAuth', async ({ browser }) => {
    // This test requires OAuth credentials
    test.skip(process.env.GOOGLE_CLIENT_ID === undefined, 'Requires Google OAuth credentials');
  });

  test('should handle forgot password flow', async () => {
    await page.goto('/');

    // Click forgot password
    await page.click('text=Forgot password');

    await expect(page).toHaveURL(/\/forgot-password/);

    // Enter email
    await page.fill('input[type="email"]', testUser.email);
    await page.click('button[type="submit"]');

    // Should show success message
    await expect(page.locator('text=Check your email')).toBeVisible();
  });
});
