import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly loginButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.submitButton = page.getByTestId('login-submit');
    this.loginButton = page.getByRole('button', { name: /login/i });
    this.logoutButton = page.getByRole('button', { name: /logout/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  async gotoLogin() {
    await this.page.goto('/login');
  }

  async initiateLogin() {
    // If we're not on login page, go there
    if (!this.page.url().includes('/login')) {
      await this.loginButton.click();
      await this.page.waitForURL('/login');
    }
  }

  async login(email: string, password: string) {
    // Wait for inputs to be ready
    await this.emailInput.waitFor({ state: 'visible' });
    await this.passwordInput.waitFor({ state: 'visible' });
    
    // Clear inputs before filling
    await this.emailInput.clear();
    await this.passwordInput.clear();
    
    // Fill inputs
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
    // Ensure inputs have correct values
    await expect(this.emailInput).toHaveValue(email);
    await expect(this.passwordInput).toHaveValue(password);
    
    // Wait for both the click and the login request
    await Promise.all([
      this.page.waitForResponse('**/api/users/login'),
      this.submitButton.click()
    ]);
    
    // After successful login, we should be redirected to dashboard
    await this.page.waitForURL('**/dashboard');
  }

  async logout() {
    await this.logoutButton.click();
    // After logout, we should be redirected to landing page
    await this.page.waitForURL('/');
  }

  async expectLoggedIn() {
    await expect(this.logoutButton).toBeVisible();
  }

  async expectLoggedOut() {
    await expect(this.loginButton).toBeVisible();
  }

  async expectLoginFormVisible() {
    await expect(this.page.getByTestId('login-form')).toBeVisible();
  }
} 