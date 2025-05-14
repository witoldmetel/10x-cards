import { test, expect } from '@playwright/test';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_USER_NAME } from './test-data';

test.describe('Register', () => {
  let registerPage: RegisterPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('should show registration form on register page', async ({ browser }) => {
    // Create a new context with no stored state
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    registerPage = new RegisterPage(page);

    // Start from the home page and click the register link
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click the register button
    const registerButton = page.getByTestId('signup-button');
    await registerButton.click();

    // Wait for navigation and form
    await page.waitForURL('/register');
    await expect(page.getByTestId('register-form')).toBeVisible({ timeout: 30000 });

    await context.close();
  });

  test('should validate form fields', async ({ browser }) => {
    // Create a new context with no stored state
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    registerPage = new RegisterPage(page);

    await registerPage.goto();
    await expect(page.getByTestId('register-form')).toBeVisible({ timeout: 30000 });

    // Try to submit empty form
    await registerPage.submitButton.click();
    await registerPage.expectFieldValidationError('name', 'Name must be at least 2 characters');
    await registerPage.expectFieldValidationError('email', 'Please enter a valid email address');
    await registerPage.expectFieldValidationError('password', 'Password must be at least 6 characters');
    await registerPage.expectFieldValidationError('confirmPassword', 'Password must be at least 6 characters');

    // Test password mismatch
    await registerPage.register('Test User', 'test@example.com', 'password123', 'password456');
    await registerPage.expectFieldValidationError('confirmPassword', "Passwords don't match");

    await context.close();
  });

  test.skip('should show error for duplicate registration', async ({ browser }) => {
    // Create a new context with no stored state
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    registerPage = new RegisterPage(page);

    await registerPage.goto();
    await expect(page.getByTestId('register-form')).toBeVisible({ timeout: 30000 });

    // Try to register with the same email used in auth.setup.ts
    await registerPage.register(TEST_USER_NAME, TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_USER_PASSWORD);
    await registerPage.expectErrorMessage('Email already exists');

    await context.close();
  });

  test('should navigate to login page', async ({ browser }) => {
    // Create a new context with no stored state
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    registerPage = new RegisterPage(page);

    await registerPage.goto();
    await expect(page.getByTestId('register-form')).toBeVisible({ timeout: 30000 });
    await registerPage.navigateToLogin();

    await context.close();
  });
});
