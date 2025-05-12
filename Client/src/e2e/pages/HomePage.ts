import { type Page, type Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly loginButton: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginButton = page.getByRole('button', { name: /login/i });
    this.title = page.getByRole('heading', { name: /10x cards/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  async expectLoaded() {
    await expect(this.title).toBeVisible();
  }

  async clickLogin() {
    await this.loginButton.click();
  }
}
