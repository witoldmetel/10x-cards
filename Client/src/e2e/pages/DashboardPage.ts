import { type Page, type Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly mobileLogoutButton: Locator;
  readonly desktopLogoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /dashboard/i });
    this.mobileLogoutButton = page.getByTestId('mobile-logout-button');
    this.desktopLogoutButton = page.getByTestId('desktop-logout-button');
  }

  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL('/dashboard');
    await expect(this.heading).toBeVisible();
  }

  async logout(device: 'mobile' | 'desktop' = 'desktop') {
    // For mobile view, ensure the menu is open
    if (device === 'mobile') {
      const menuButton = this.page.getByRole('button', { name: 'Toggle menu' });
      await menuButton.click();
      await this.page.waitForTimeout(500); // Wait for menu animation
    }

    // Get the appropriate logout button
    const logoutButton = device === 'mobile' ? this.mobileLogoutButton : this.desktopLogoutButton;

    // Wait for the button to be visible
    await expect(logoutButton).toBeVisible({ timeout: 10000 });

    // Click the button and wait for navigation
    await Promise.all([this.page.waitForLoadState('networkidle'), logoutButton.click()]);

    // Verify we're logged out by checking URL (we get redirected to /login)
    await expect(this.page).toHaveURL('/login', { timeout: 10000 });
  }
}
