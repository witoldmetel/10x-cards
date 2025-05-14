# Test info

- Name: Register >> should show registration form on register page
- Location: /Users/witoldmetel/Projects/10x-cards/Client/src/e2e/register.spec.ts:15:3

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/", waiting until "load"

    at /Users/witoldmetel/Projects/10x-cards/Client/src/e2e/register.spec.ts:22:16
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import { RegisterPage } from './pages/RegisterPage';
   3 | import { DashboardPage } from './pages/DashboardPage';
   4 | import { TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_USER_NAME } from './test-data';
   5 |
   6 | test.describe('Register', () => {
   7 |   let registerPage: RegisterPage;
   8 |   let dashboardPage: DashboardPage;
   9 |
  10 |   test.beforeEach(async ({ page }) => {
  11 |     registerPage = new RegisterPage(page);
  12 |     dashboardPage = new DashboardPage(page);
  13 |   });
  14 |
  15 |   test('should show registration form on register page', async ({ browser }) => {
  16 |     // Create a new context with no stored state
  17 |     const context = await browser.newContext();
  18 |     const page = await context.newPage();
  19 |     registerPage = new RegisterPage(page);
  20 |     
  21 |     // Start from the home page and click the register link
> 22 |     await page.goto('/');
     |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  23 |     
  24 |     // Wait for the page to be fully loaded
  25 |     await page.waitForLoadState('networkidle');
  26 |     
  27 |     // Click the register button
  28 |     const registerButton = page.getByRole('link', { name: /sign up/i });
  29 |
  30 |     await registerButton.click();
  31 |     
  32 |     // Wait for navigation
  33 |     await page.waitForURL('/register');
  34 |     
  35 |     const formByTestId = await page.getByTestId('register-form');
  36 |
  37 |     // Check form visibility with longer timeout
  38 |     await expect(formByTestId).toBeVisible({ timeout: 30000 });
  39 |     
  40 |     // Clean up
  41 |     await context.close();
  42 |   });
  43 |
  44 |   test('should validate form fields', async () => {
  45 |     await registerPage.goto();
  46 |     
  47 |     // Try to submit empty form
  48 |     await registerPage.submitButton.click();
  49 |     await registerPage.expectFieldValidationError('name', 'Name must be at least 2 characters');
  50 |     await registerPage.expectFieldValidationError('email', 'Please enter a valid email address');
  51 |     await registerPage.expectFieldValidationError('password', 'Password must be at least 6 characters');
  52 |     await registerPage.expectFieldValidationError('confirmPassword', 'Password must be at least 6 characters');
  53 |
  54 |     // Test password mismatch
  55 |     await registerPage.register('Test User', 'test@example.com', 'password123', 'password456');
  56 |     await registerPage.expectFieldValidationError('confirmPassword', "Passwords don't match");
  57 |   });
  58 |
  59 |   test('should show error for duplicate registration', async () => {
  60 |     await registerPage.goto();
  61 |     
  62 |     // Try to register with the same email used in auth.setup.ts
  63 |     await registerPage.register(TEST_USER_NAME, TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_USER_PASSWORD);
  64 |     await registerPage.expectErrorMessage('Email already exists');
  65 |   });
  66 |
  67 |   test('should navigate to login page', async () => {
  68 |     await registerPage.goto();
  69 |     await registerPage.navigateToLogin();
  70 |   });
  71 | }); 
```