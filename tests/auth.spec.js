/**
 * Auth Spec — tests that don't need a pre-approved account.
 *
 * Step 1 of the real Signup form asks for an email then sends an OTP.
 * We can't handle a real OTP in CI, so:
 *   - We test *validation* (email required) by attempting to submit without an email.
 *   - We test the login error path with wrong credentials.
 *   - We test the login form renders correctly.
 */
import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────
// 1. Login page renders & shows error on bad creds
// ─────────────────────────────────────────────
test.describe('Login page', () => {
  test('renders the login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText(/Welcome Back/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Login")')).toBeVisible();
  });

  test('shows an error message with wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button:has-text("Login")');
    // Either a red-800 error div or any visible error text
    await expect(page.locator('.text-red-800, [class*="text-red"]').first()).toBeVisible({ timeout: 10000 });
  });
});

// ─────────────────────────────────────────────
// 2. Signup page — step-1 validation (no OTP call needed)
// ─────────────────────────────────────────────
test.describe('Signup page', () => {
  test('renders the signup form with an email field', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('h2')).toContainText(/Create Account/i);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Send OTP")')).toBeVisible();
  });

  test('shows validation error when email is missing and Send OTP is clicked', async ({ page }) => {
    await page.goto('/signup');
    // Click Send OTP without filling in the email
    await page.click('button:has-text("Send OTP")');
    // The frontend validateStep1() sets errors.email = 'Email is required'
    await expect(page.locator('text=Email is required')).toBeVisible({ timeout: 5000 });
  });

  test('shows invalid email format error', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('input[name="email"]', 'not-an-email');
    await page.click('button:has-text("Send OTP")');
    await expect(page.locator('text=Invalid email format')).toBeVisible({ timeout: 5000 });
  });

  test('has a link to the login page', async ({ page }) => {
    await page.goto('/signup');
    // Two /login links exist (Navbar + "Login here"). Use .first() to avoid strict-mode error.
    await expect(page.locator('a[href="/login"]').first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 3. Route protection — unauthenticated user
// ─────────────────────────────────────────────
test.describe('Route protection', () => {
  test('redirects /dashboard to /login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/, { timeout: 8000 });
  });

  test('redirects /admin to /login when not authenticated', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*\/login/, { timeout: 8000 });
  });

  test('redirects /profile to /login when not authenticated', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/.*\/login/, { timeout: 8000 });
  });

  test('redirects /resumes to /login when not authenticated', async ({ page }) => {
    await page.goto('/resumes');
    await expect(page).toHaveURL(/.*\/login/, { timeout: 8000 });
  });
});
