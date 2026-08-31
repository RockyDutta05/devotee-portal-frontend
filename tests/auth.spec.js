import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

  test('should allow a new user to sign up', async ({ page }) => {
    // Generate a unique email to avoid unique constraint errors in the backend
    const randomNum = Math.floor(Math.random() * 100000);
    const testEmail = `testuser${randomNum}@example.com`;

    await page.goto('/signup');

    // Step 1: Personal Information
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', '1234567890');
    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.locator('h3:has-text("Spiritual")')).toBeVisible();

    // Step 2: Spiritual & Community Connection
    await page.fill('input[name="chantingRounds"]', '16');
    await page.fill('input[name="connectedToName"]', 'Test Counselor');
    await page.fill('input[name="connectedToContact"]', 'test@counselor.com');
    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.locator('h3:has-text("Account Details")')).toBeVisible();

    // Step 3: Account Details
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.locator('h3:has-text("Review & Submit")')).toBeVisible();

    // Step 4: Review & Submit
    await page.locator('button[type="submit"]').click({ force: true });

    // Wait for redirect to pending-approval or success state
    await expect(page.locator('text=Registration Submitted Successfully!')).toBeVisible({ timeout: 10000 });
    await page.waitForURL('**/pending-approval', { timeout: 10000 });
  });

  test('should allow an existing user to login', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.getByRole('button', { name: 'Login' }).click();

    // Verify error message
    await expect(page.locator('.text-red-800')).toBeVisible();
  });
});

