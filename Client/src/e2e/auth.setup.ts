import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_USER_NAME } from './test-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.join(__dirname, '.auth/user.json');

setup('setup test user', async ({ page }) => {

  const registerPage = new RegisterPage(page);
  await registerPage.goto();
  await registerPage.submitRegistration(TEST_USER_NAME, TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_USER_PASSWORD);


  // After successful registration, we should be on the dashboard
  await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 30000 });

  // Click logout button using DashboardPage
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.logout('desktop');

  const loginPage = new LoginPage(page);
  await loginPage.gotoLogin();
  await loginPage.expectLoginFormVisible();
  await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
  await loginPage.expectLoggedIn();

  // Save the authentication state
  await page.context().storageState({ path: authFile });
});
