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
    // Add request logging
    this.page.on('request', request => {
      console.log(`>> ${request.method()} ${request.url()}`);
      if (request.url().includes('/api/users/login')) {
        console.log('Request headers:', request.headers());
        console.log('Request body:', request.postData());
      }
    });

    this.page.on('response', response => {
      console.log(`<< ${response.status()} ${response.url()}`);
      if (response.url().includes('/api/users/login')) {
        response.json().then(data => console.log('Response data:', data));
      }
    });

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
    
    // Wait for the response with a more specific matcher and longer timeout
    const responsePromise = this.page.waitForResponse(
      response => {
        return response.url().includes('/api/users/login') && response.request().method() === 'POST';
      },
      { timeout: 60000 }
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
      await this.page.waitForURL('**/dashboard', { timeout: 10000 });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
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