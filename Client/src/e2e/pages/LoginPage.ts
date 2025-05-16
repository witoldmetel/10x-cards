import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly loginLink: Locator;
  readonly loginForm: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.submitButton = page.getByTestId('login-submit');
    this.loginLink = page.getByRole('link', { name: /sign in/i });
    this.loginForm = page.getByTestId('login-form');
    this.errorMessage = page.getByTestId('login-error');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoLogin() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async initiateLogin() {
    // If we're not on login page, go there
    if (!this.page.url().includes('/login')) {
      await this.loginLink.click();
      await this.page.waitForURL('/login');
      await this.page.waitForLoadState('networkidle');
    }
  }

  async login(email: string, password: string) {
    // Wait for inputs to be ready
    await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.passwordInput.waitFor({ state: 'visible', timeout: 10000 });

    // Clear inputs before filling
    await this.emailInput.clear();
    await this.passwordInput.clear();

    // Fill inputs
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    // Ensure inputs have correct values
    await expect(this.emailInput).toHaveValue(email);
    await expect(this.passwordInput).toHaveValue(password);

    // Wait for the response with a more specific matcher and longer timeout
    const responsePromise = this.page.waitForResponse(
      response => {
        return response.url().includes('/api/users/login') && response.request().method() === 'POST';
      },
      { timeout: 60000 },
    );

    // Click the submit button
    await this.submitButton.click();

    try {
      const response = await responsePromise;
      const responseData = await response.json();

      if (!response.ok()) {
        throw new Error(`Login failed: ${responseData.message || 'Unknown error'}`);
      }

      // After successful login, we should be redirected to dashboard
      await this.page.waitForURL('/dashboard', { timeout: 10000 });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async expectLoggedIn() {
    await expect(this.page).toHaveURL('/dashboard', { timeout: 10000 });
  }

  async expectLoginFormVisible() {
    await expect(this.loginForm).toBeVisible({ timeout: 10000 });
  }

  async expectLoggedOut() {
    await expect(this.page).toHaveURL('/login', { timeout: 10000 });
  }

  async expectErrorMessage(message?: string) {
    await expect(this.errorMessage).toBeVisible({ timeout: 10000 });
    if (message) {
      await expect(this.errorMessage).toContainText(message, { timeout: 10000 });
    }
  }
}
