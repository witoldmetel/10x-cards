import { test } from '@playwright/test';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';

test.describe('Authentication', () => {
  let authPage: AuthPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('should show login button when not authenticated', async () => {
    // Reset storage state for this specific test
    test.use({ storageState: { cookies: [], origins: [] } });
    
    await authPage.goto();
    await authPage.expectLoggedOut();
  });

  test('should be able to login and access protected routes', async () => {
    await authPage.goto();
    await authPage.expectLoggedIn();
    
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();
  });

  test('should be able to logout', async () => {
    await authPage.goto();
    await authPage.logout();
    await authPage.expectLoggedOut();
  });
}); 