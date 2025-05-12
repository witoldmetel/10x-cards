import { test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

test.describe('Authentication', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('should show login button on landing page when not authenticated', async () => {
    // Reset storage state for this specific test
    test.use({ storageState: { cookies: [], origins: [] } });
    
    await loginPage.goto();
    await loginPage.expectLoggedOut();
  });

  test('should be able to navigate to login page', async () => {
    // Reset storage state for this specific test
    test.use({ storageState: { cookies: [], origins: [] } });
    
    await loginPage.goto();
    await loginPage.initiateLogin();
    await loginPage.expectLoginFormVisible();
  });

  test('should be able to login and access protected routes', async () => {
    await loginPage.gotoLogin();
    await loginPage.expectLoginFormVisible();
    await loginPage.login(process.env.TEST_USER_EMAIL || '', process.env.TEST_USER_PASSWORD || '');
    await loginPage.expectLoggedIn();
    
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();
  });

  test('should be able to logout', async () => {
    // Start from dashboard since we're logged in
    await dashboardPage.goto();
    await loginPage.logout();
    await loginPage.expectLoggedOut();
  });
}); 