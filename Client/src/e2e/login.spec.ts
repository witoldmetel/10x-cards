import { test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from './test-data';

test.describe('Login', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('should show login button on landing page when not authenticated', async ({ browser }) => {
    // Create a new context with no stored state
    const context = await browser.newContext();
    const page = await context.newPage();
    loginPage = new LoginPage(page);
    
    await loginPage.goto();
    await loginPage.expectLoggedOut();
    
    await context.close();
  });

  test('should be able to navigate to login page', async ({ browser }) => {
    // Create a new context with no stored state
    const context = await browser.newContext();
    const page = await context.newPage();
    loginPage = new LoginPage(page);
    
    await loginPage.goto();
    await loginPage.initiateLogin();
    await loginPage.expectLoginFormVisible();
    
    await context.close();
  });

  test('should be able to login and access protected routes', async () => {
    await loginPage.gotoLogin();
    await loginPage.expectLoginFormVisible();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    await loginPage.expectLoggedIn();
    
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();
  });

  test('should be able to logout from desktop view', async () => {
    // Start from dashboard since we're logged in
    await dashboardPage.goto();
    await dashboardPage.logout('desktop');
    await loginPage.expectLoggedOut();
  });

  test('should be able to logout from mobile view', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Start from dashboard since we're logged in
    await dashboardPage.goto();
    await dashboardPage.logout('mobile');
    await loginPage.expectLoggedOut();
  });
}); 