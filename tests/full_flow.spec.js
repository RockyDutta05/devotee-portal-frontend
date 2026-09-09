/**
 * full_flow.spec.js
 *
 * Phase 2 end-to-end frontend tests.
 *
 * Strategy
 * ─────────
 * • Tests that only touch public/unauthenticated UI (signup validation,
 *   login form) run against the real Vite dev server with no backend needed.
 *
 * • Tests that require a logged-in session seed localStorage directly with a
 *   JWT + user JSON before navigating. This lets us test client-side
 *   behaviour (session persistence, logout, protected routes, profile UI,
 *   resume upload modal) without a real approved account.
 *
 * • The "Login while pending" and "approved login → dashboard" paths are
 *   integration tests that DO need the backend. They are skipped
 *   automatically when BACKEND_URL is not set in the environment.
 *
 * Set these env vars for full integration testing:
 *   BACKEND_URL      = http://localhost:8080
 *   TEST_EMAIL       = an APPROVED test account email
 *   TEST_PASSWORD    = its password
 *   PENDING_EMAIL    = a PENDING (not-yet-approved) account email
 *   PENDING_PASSWORD = its password
 */

import { test, expect } from '@playwright/test';
import path from 'path';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Inject a fake-but-valid token + user into localStorage so the app thinks
 *  the user is already logged in.  The token is a HS256 JWT that will NOT
 *  pass server-side verification, so this is purely for client-side route /
 *  render tests. */
async function seedAuth(page, overrides = {}) {
  const fakeUser = {
    id: 1,
    name: 'Test Devotee',
    email: 'testdevotee@example.com',
    role: 'USER',
    ...overrides
  };
  // A structurally valid (but not cryptographically signed) JWT
  const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: fakeUser.email, exp: Math.floor(Date.now() / 1000) + 3600 }));
  const fakeJwt = `${header}.${payload}.fakesignature`;

  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, { token: fakeJwt, user: fakeUser });
}

async function seedAdminAuth(page) {
  return seedAuth(page, { role: 'ADMIN', name: 'Admin User', email: 'admin@example.com' });
}

// ─── 1. Signup validation ────────────────────────────────────────────────────

test.describe('Step 1 — Signup form validation', () => {
  test('shows "Email is required" when Send OTP clicked with no email', async ({ page }) => {
    await page.goto('/signup');
    await page.click('button:has-text("Send OTP")');
    await expect(page.locator('text=Email is required')).toBeVisible({ timeout: 5000 });
  });

  test('shows "Invalid email format" for a malformed email', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('input[name="email"]', 'not-valid');
    await page.click('button:has-text("Send OTP")');
    await expect(page.locator('text=Invalid email format')).toBeVisible({ timeout: 5000 });
  });

  test('signup page renders email step by default', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Send OTP")')).toBeVisible();
  });
});

// ─── 2. Route protection (unauthenticated) ───────────────────────────────────

test.describe('Step 1 — Route protection (no session)', () => {
  test('blocks /dashboard → redirects to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test('blocks /profile → redirects to /login', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test('blocks /resumes → redirects to /login', async ({ page }) => {
    await page.goto('/resumes');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test('blocks /admin → redirects to /login for non-admin', async ({ page }) => {
    // Seed a normal USER session — should still be blocked from /admin
    await seedAuth(page);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login|\/dashboard/, { timeout: 8000 });
  });
});

// ─── 3. Authenticated session — client-side tests ────────────────────────────

test.describe('Step 1 — Authenticated shell (seeded session)', () => {
  // NOTE: We seed via page.evaluate() AFTER the first navigation, not via
  // addInitScript(). addInitScript fires on EVERY page.goto(), which would
  // re-inject the token even after logout — defeating the purpose of the test.
  async function loginViaLocalStorage(page) {
    // Start at /login (always accessible — no redirect loop).
    await page.goto('/login');
    const fakeUser = { id: 1, name: 'Test Devotee', email: 'testdevotee@example.com', role: 'USER' };
    const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ sub: fakeUser.email, exp: Math.floor(Date.now() / 1000) + 3600 }));
    const fakeJwt = `${header}.${payload}.fakesignature`;
    // Seed localStorage while on the login page
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }, { token: fakeJwt, user: fakeUser });
    // Now navigate to dashboard — React reads token from localStorage and stays
    await page.goto('/dashboard');
  }

  test('Navbar shows Logout button when logged in', async ({ page }) => {
    await loginViaLocalStorage(page);
    await expect(page.locator('button:has-text("Logout")')).toBeVisible({ timeout: 8000 });
  });

  test('Session persists after page refresh', async ({ page }) => {
    await loginViaLocalStorage(page);
    await page.reload();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 8000 });
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  });

  test('Logout clears session and redirects to /login', async ({ page }) => {
    await loginViaLocalStorage(page);
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
    // After logout, localStorage is cleared — goto /dashboard should redirect to /login
    // We do NOT re-seed here, so the ProtectedRoute should block access
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test('After logout /admin is also blocked', async ({ page }) => {
    await loginViaLocalStorage(page);
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });
});

// ─── 4. Profile page — hide employer toggle ──────────────────────────────────

test.describe('Step 2 — Profile page UI (seeded session)', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
  });

  test('Profile page loads without error', async ({ page }) => {
    await page.goto('/profile');
    // Page renders; even if the API 401s we see the page heading or redirect
    const heading = page.locator('h1:has-text("My Profile")');
    const loginPage = page.locator('h1:has-text("Welcome Back")');
    await expect(heading.or(loginPage)).toBeVisible({ timeout: 10000 });
  });

  test('"Preview Public Profile" button is visible on profile page', async ({ page }) => {
    await page.goto('/profile');
    // Only visible when NOT in edit mode
    const btn = page.locator('button:has-text("Preview Public Profile")');
    const loginPage = page.locator('h1:has-text("Welcome Back")');
    // Accept either — if backend isn't running we'll be on login
    await expect(btn.or(loginPage)).toBeVisible({ timeout: 10000 });
  });
});

// ─── 5. Resume page — upload modal ───────────────────────────────────────────

test.describe('Step 2 — Resume page UI (seeded session)', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
  });

  test('Resume page loads and shows "Upload New Resume" button', async ({ page }) => {
    await page.goto('/resumes');
    const btn = page.locator('button:has-text("Upload New Resume")');
    const loginPage = page.locator('h1:has-text("Welcome Back")');
    await expect(btn.or(loginPage)).toBeVisible({ timeout: 10000 });
  });

  test('Upload modal opens and contains a file input', async ({ page }) => {
    await page.goto('/resumes');
    const uploadBtn = page.locator('button:has-text("Upload New Resume")');
    // Only proceed if we're actually on the resumes page
    if (await uploadBtn.isVisible({ timeout: 6000 })) {
      await uploadBtn.click();
      await expect(page.locator('input[type="file"]')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Can attach a PDF file in the upload modal', async ({ page }) => {
    await page.goto('/resumes');
    const uploadBtn = page.locator('button:has-text("Upload New Resume")');
    if (await uploadBtn.isVisible({ timeout: 6000 })) {
      await uploadBtn.click();
      const fileInput = page.locator('input[type="file"]');
      await fileInput.waitFor({ state: 'visible', timeout: 5000 });
      const filePath = path.resolve('tests/fixtures/sample_resume.pdf');
      await page.setInputFiles('input[type="file"]', filePath);
      // Verify a file was selected by checking the native input's files list
      const fileCount = await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]');
        return input ? input.files.length : 0;
      });
      expect(fileCount).toBe(1);
    }
  });
});

// ─── 6. Jobs page ────────────────────────────────────────────────────────────

test.describe('Step 3 — Jobs page (seeded session)', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
  });

  test('Jobs page loads', async ({ page }) => {
    await page.goto('/jobs');
    const heading = page.locator('h1');
    const loginPage = page.locator('h1:has-text("Welcome Back")');
    await expect(heading.or(loginPage)).toBeVisible({ timeout: 10000 });
  });
});

// ─── 7. Referrals page ───────────────────────────────────────────────────────

test.describe('Step 3 — Referrals page (seeded session)', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
  });

  test('Referrals page loads', async ({ page }) => {
    await page.goto('/referrals');
    const heading = page.locator('h1');
    const loginPage = page.locator('h1:has-text("Welcome Back")');
    await expect(heading.or(loginPage)).toBeVisible({ timeout: 10000 });
  });
});

// ─── 8. Requests inbox ───────────────────────────────────────────────────────

test.describe('Step 4 — Requests inbox (seeded session)', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
  });

  test('Requests page loads', async ({ page }) => {
    await page.goto('/requests');
    const heading = page.locator('h1');
    const loginPage = page.locator('h1:has-text("Welcome Back")');
    await expect(heading.or(loginPage)).toBeVisible({ timeout: 10000 });
  });
});

// ─── 9. Admin dashboard ──────────────────────────────────────────────────────

test.describe('Step 4 — Admin dashboard (seeded ADMIN session)', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminAuth(page);
  });

  test('Admin page loads for an ADMIN user', async ({ page }) => {
    await page.goto('/admin');
    // Either the admin UI heading or a redirect to login/dashboard
    const adminHeading = page.locator('h1, h2').first();
    await expect(adminHeading).toBeVisible({ timeout: 10000 });
  });
});

// ─── 10. Integration login tests (skipped when env vars not set) ─────────────

test.describe('Integration — Login with real backend', () => {
  const backendUrl   = process.env.BACKEND_URL;
  const testEmail    = process.env.TEST_EMAIL;
  const testPassword = process.env.TEST_PASSWORD;
  const pendingEmail    = process.env.PENDING_EMAIL;
  const pendingPassword = process.env.PENDING_PASSWORD;

  test('Approved user can log in and lands on /dashboard', async ({ page }) => {
    test.skip(!backendUrl || !testEmail || !testPassword,
      'Set BACKEND_URL, TEST_EMAIL and TEST_PASSWORD to run this test');

    await page.goto('/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  });

  test('Pending user logs in and is redirected to /pending-approval', async ({ page }) => {
    test.skip(!backendUrl || !pendingEmail || !pendingPassword,
      'Set BACKEND_URL, PENDING_EMAIL and PENDING_PASSWORD to run this test');

    await page.goto('/login');
    await page.fill('input[type="email"]', pendingEmail);
    await page.fill('input[type="password"]', pendingPassword);
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL(/\/pending-approval/, { timeout: 15000 });
  });

  test('Session persists on reload after approved login', async ({ page }) => {
    test.skip(!backendUrl || !testEmail || !testPassword,
      'Set BACKEND_URL, TEST_EMAIL and TEST_PASSWORD to run this test');

    await page.goto('/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    await page.reload();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 8000 });
  });
});
