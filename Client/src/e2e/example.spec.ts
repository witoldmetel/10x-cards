import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test.describe('Example E2E Test Suite', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('homepage has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/10xCards/);
    await homePage.expectLoaded();
  });

  test('homepage loads', async ({ page }) => {
    await expect(page).toHaveURL('/');
    await page.screenshot({ path: 'screenshots/homepage.png' });
  });
});
