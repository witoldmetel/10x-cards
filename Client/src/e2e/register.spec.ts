import { test, expect } from '@playwright/test';
import { RegisterPage } from './pages/RegisterPage';
import { TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_USER_NAME } from './test-data';

test.describe('Register', () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
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
    await registerPage.nameInput.fill('Test User');
    await registerPage.emailInput.fill('test@example.com');
    await registerPage.passwordInput.fill('password123');
    await registerPage.confirmPasswordInput.fill('password456');
    await registerPage.submitButton.click();
    await registerPage.expectFieldValidationError('confirmPassword', "Passwords don't match");

    await context.close();
  });

  test('should show error for duplicate registration', async ({ browser }) => {
    // Create a new context with no stored state
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    registerPage = new RegisterPage(page);

    // First register a user
    await registerPage.goto();
    await registerPage.submitRegistration(TEST_USER_NAME, TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_USER_PASSWORD);

    // Now try to register again with the same email in a new context
    const newContext = await browser.newContext({ storageState: undefined });
    const newPage = await newContext.newPage();
    const newRegisterPage = new RegisterPage(newPage);

    await newRegisterPage.goto();
    await newRegisterPage.register(TEST_USER_NAME, TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_USER_PASSWORD);

    // Verify we're still on the register page and see the error
    await expect(newPage.url()).toContain('/register');
    await newRegisterPage.expectErrorMessage('Email already exists');

    await context.close();
    await newContext.close();
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
