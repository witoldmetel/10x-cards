import { test as setup } from '@playwright/test';
import path from 'path';
import { AuthPage } from './pages/AuthPage';

const authFile = path.join(__dirname, '../../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  const authPage = new AuthPage(page);
  
  await authPage.goto();
  await authPage.initiateLogin();
  await authPage.login(process.env.TEST_USER_EMAIL || '', process.env.TEST_USER_PASSWORD || '');
  await authPage.expectLoggedIn();

  await page.context().storageState({ path: authFile });
}); 