import { test as setup } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { LoginPage } from './pages/LoginPage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.join(__dirname, '.auth/user.json');

// Test credentials
const TEST_USER_EMAIL = 'testuser@test.com';
const TEST_USER_PASSWORD = 'test12345';

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.gotoLogin();
  await loginPage.expectLoginFormVisible();
  await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
  await loginPage.expectLoggedIn();

  await page.context().storageState({ path: authFile });
}); 