# Test info

- Name: Register >> should navigate to login page
- Location: /Users/witoldmetel/Projects/10x-cards/Client/src/e2e/register.spec.ts:67:3

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/register", waiting until "load"

    at RegisterPage.goto (/Users/witoldmetel/Projects/10x-cards/Client/src/e2e/pages/RegisterPage.ts:27:21)
    at /Users/witoldmetel/Projects/10x-cards/Client/src/e2e/register.spec.ts:68:24
```

# Test source

```ts
   1 | import { type Page, type Locator, expect } from '@playwright/test';
   2 |
   3 | export class RegisterPage {
   4 |   readonly page: Page;
   5 |   readonly nameInput: Locator;
   6 |   readonly emailInput: Locator;
   7 |   readonly passwordInput: Locator;
   8 |   readonly confirmPasswordInput: Locator;
   9 |   readonly submitButton: Locator;
   10 |   readonly registerForm: Locator;
   11 |   readonly errorMessage: Locator;
   12 |   readonly loginLink: Locator;
   13 |
   14 |   constructor(page: Page) {
   15 |     this.page = page;
   16 |     this.nameInput = page.getByTestId('name-input');
   17 |     this.emailInput = page.getByTestId('email-input');
   18 |     this.passwordInput = page.getByTestId('password-input');
   19 |     this.confirmPasswordInput = page.getByTestId('confirm-password-input');
   20 |     this.submitButton = page.getByTestId('register-submit');
   21 |     this.registerForm = page.getByTestId('register-form');
   22 |     this.errorMessage = page.getByTestId('register-error');
   23 |     this.loginLink = page.getByTestId('login-link');
   24 |   }
   25 |
   26 |   async goto() {
>  27 |     await this.page.goto('/register');
      |                     ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
   28 |     
   29 |     // Debug: Wait for network idle and log URL
   30 |     await this.page.waitForLoadState('networkidle');
   31 |     console.log('Register page URL after navigation:', await this.page.url());
   32 |     
   33 |     // Debug: Check if the page has loaded
   34 |     const content = await this.page.content();
   35 |     console.log('Register page has content:', content.length > 0);
   36 |
   37 |     // Debug: Wait for any React hydration to complete
   38 |     await this.page.waitForTimeout(1000);
   39 |   }
   40 |
   41 |   async register(name: string, email: string, password: string, confirmPassword: string) {
   42 |     await this.nameInput.fill(name);
   43 |     await this.emailInput.fill(email);
   44 |     await this.passwordInput.fill(password);
   45 |     await this.confirmPasswordInput.fill(confirmPassword);
   46 |
   47 |     // Wait for response with a more specific matcher and longer timeout
   48 |     const responsePromise = this.page.waitForResponse(
   49 |       response => response.url().includes('/api/users/register') && response.request().method() === 'POST',
   50 |       { timeout: 60000 }
   51 |     );
   52 |
   53 |     await this.submitButton.click();
   54 |
   55 |     try {
   56 |       const response = await responsePromise;
   57 |       const responseData = await response.json();
   58 |
   59 |       if (!response.ok()) {
   60 |         throw new Error(`Registration failed: ${responseData.message || 'Unknown error'}`);
   61 |       }
   62 |
   63 |       // After successful registration, we should be redirected to dashboard
   64 |       await this.page.waitForURL('/dashboard', { timeout: 10000 });
   65 |       await this.page.waitForLoadState('networkidle');
   66 |     } catch (error) {
   67 |       console.error('Registration error:', error);
   68 |       throw error;
   69 |     }
   70 |   }
   71 |
   72 |   async expectRegistrationFormVisible() {
   73 |     // Debug: Log all elements with data-testid attribute
   74 |     const elements = await this.page.evaluate(() => {
   75 |       const elements = document.querySelectorAll('[data-testid]');
   76 |       return Array.from(elements).map(el => ({
   77 |         testId: el.getAttribute('data-testid'),
   78 |         tagName: el.tagName,
   79 |         isVisible: el.getBoundingClientRect().height > 0,
   80 |         html: el.outerHTML
   81 |       }));
   82 |     });
   83 |     console.log('Elements with data-testid:', elements);
   84 |     
   85 |     // Debug: Check if form exists in DOM
   86 |     const formExists = await this.registerForm.count() > 0;
   87 |     console.log('Register form exists in DOM:', formExists);
   88 |
   89 |     // Try alternative selectors if the form is not found
   90 |     if (!formExists) {
   91 |       console.log('Form not found by test-id, trying alternative selectors');
   92 |       
   93 |       // Try finding by form element
   94 |       const formByTag = await this.page.locator('form').count();
   95 |       console.log('Forms found by tag:', formByTag);
   96 |       
   97 |       // Try finding by heading
   98 |       const heading = await this.page.getByText('Create an Account').count();
   99 |       console.log('Heading found:', heading);
  100 |       
  101 |       // Try finding by any input
  102 |       const inputs = await this.page.locator('input').count();
  103 |       console.log('Inputs found:', inputs);
  104 |     }
  105 |     
  106 |     // Original check with longer timeout
  107 |     await expect(this.registerForm).toBeVisible({ timeout: 30000 });
  108 |   }
  109 |
  110 |   async expectErrorMessage(message?: string) {
  111 |     await expect(this.errorMessage).toBeVisible({ timeout: 10000 });
  112 |     if (message) {
  113 |       await expect(this.errorMessage).toContainText(message, { timeout: 10000 });
  114 |     }
  115 |   }
  116 |
  117 |   async expectFieldValidationError(field: 'name' | 'email' | 'password' | 'confirmPassword', message: string) {
  118 |     const errorMessage = this.page.getByText(message);
  119 |     await expect(errorMessage).toBeVisible({ timeout: 10000 });
  120 |   }
  121 |
  122 |   async navigateToLogin() {
  123 |     await this.loginLink.click();
  124 |     await this.page.waitForURL('/login');
  125 |     await this.page.waitForLoadState('networkidle');
  126 |   }
  127 | } 
```