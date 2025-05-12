import { type Page, type Locator, expect } from '@playwright/test';

export class AuthPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly loginButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.submitButton = page.getByRole('button', { name: /continue|log in/i });
    this.loginButton = page.getByRole('button', { name: /login/i });
    this.logoutButton = page.getByRole('button', { name: /logout/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  async initiateLogin() {
    await this.loginButton.click();
    await this.page.waitForURL(/auth0/);
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.page.waitForURL('/');
  }

  async logout() {
    await this.logoutButton.click();
  }

  async expectLoggedIn() {
    await expect(this.logoutButton).toBeVisible();
  }

  async expectLoggedOut() {
    await expect(this.loginButton).toBeVisible();
  }
} 