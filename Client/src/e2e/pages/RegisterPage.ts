import { type Page, type Locator, expect } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly registerForm: Locator;
  readonly errorMessage: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByTestId('name-input');
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.confirmPasswordInput = page.getByTestId('confirm-password-input');
    this.submitButton = page.getByTestId('register-submit');
    this.registerForm = page.getByTestId('register-form');
    this.errorMessage = page.getByTestId('register-error');
    this.loginLink = page.getByTestId('login-link');
  }

  async goto() {
    await this.page.goto('/register');
    await this.page.waitForLoadState('networkidle');

    // Get current URL to check where we are
    const currentUrl = this.page.url();

    if (currentUrl === 'http://localhost:5173/') {
      // If we're on the landing page, navigate to register
      await this.page.getByTestId('signup-button').click();
      await this.page.waitForLoadState('networkidle');
    }

    // Now we should be on register page
    await expect(this.page).toHaveURL(/.*\/register/, { timeout: 30000 });
    await expect(this.registerForm).toBeVisible({ timeout: 30000 });
  }

  async register(name: string, email: string, password: string, confirmPassword: string) {
    // Wait for all inputs to be visible
    await expect(this.nameInput).toBeVisible({ timeout: 30000 });
    await expect(this.emailInput).toBeVisible({ timeout: 30000 });
    await expect(this.passwordInput).toBeVisible({ timeout: 30000 });
    await expect(this.confirmPasswordInput).toBeVisible({ timeout: 30000 });

    // Fill the form
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);

    // Wait for response with a more specific matcher and longer timeout
    const responsePromise = this.page.waitForResponse(
      response => response.url().includes('/api/users/register') && response.request().method() === 'POST',
      { timeout: 60000 },
    );

    await this.submitButton.click();

    try {
      const response = await responsePromise;

      if (!response.ok()) {
        if (response.status() === 400 || response.status() === 409) {
          await expect(this.errorMessage).toBeVisible({ timeout: 30000 });
          return;
        }
        throw new Error(`Registration failed with status: ${response.status()}`);
      }

      await this.page.waitForURL(/.*\/dashboard/, { timeout: 60000 });
      await this.page.waitForLoadState('networkidle', { timeout: 60000 });

      const currentUrl = this.page.url();
      if (!currentUrl.includes('/dashboard')) {
        throw new Error(`Failed to redirect to dashboard. Current URL: ${currentUrl}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async submitRegistration(name: string, email: string, password: string, confirmPassword: string) {
    await this.register(name, email, password, confirmPassword);
  }

  async expectErrorMessage(message?: string) {
    await expect(this.errorMessage).toBeVisible({ timeout: 30000 });
    if (message) {
      await expect(this.errorMessage).toContainText(message, { timeout: 30000 });
    }
  }

  async expectFieldValidationError(field: 'name' | 'email' | 'password' | 'confirmPassword', message: string) {
    const errorMessage = this.page.getByTestId(`${field}-error`);
    await expect(errorMessage).toBeVisible({ timeout: 30000 });
    await expect(errorMessage).toContainText(message, { timeout: 30000 });
  }

  async navigateToLogin() {
    await expect(this.loginLink).toBeVisible({ timeout: 30000 });
    await this.loginLink.click();
    await this.page.waitForURL('/login');
    await this.page.waitForLoadState('networkidle');
  }
}
