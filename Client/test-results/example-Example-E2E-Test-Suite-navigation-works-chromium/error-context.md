# Test info

- Name: Example E2E Test Suite >> navigation works
- Location: /Users/witoldmetel/Projects/10x-cards/Client/src/e2e/example.spec.ts:17:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: getByRole('button', { name: /login/i })
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for getByRole('button', { name: /login/i })

    at /Users/witoldmetel/Projects/10x-cards/Client/src/e2e/example.spec.ts:18:40
```

# Page snapshot

```yaml
- region "Notifications (F8)":
  - list
- banner:
  - link "Sign in":
    - /url: /login
    - button "Sign in"
  - link "Sign up":
    - /url: /register
    - button "Sign up"
- main:
  - heading "Learn 10x Faster with AI-Powered Flashcards" [level=1]
  - paragraph: Generate high-quality flashcards from any text and learn efficiently with our advanced spaced repetition system.
  - link "Get Started":
    - /url: /register
    - button "Get Started"
  - link "Learn More":
    - /url: "#features"
    - button "Learn More"
  - heading "Source Text" [level=3]
  - paragraph: The krebs cycle is a series of chemical reactions used by all aerobic organisms to release stored energy...
  - img
  - heading "Generated Flashcards" [level=3]
  - paragraph: What is the Krebs cycle?
  - paragraph: A series of chemical reactions used by all aerobic organisms to release stored energy
  - paragraph: Which organisms use the Krebs cycle?
  - paragraph: All aerobic organisms
  - heading "Key Features" [level=2]
  - img
  - heading "SM-2 Spaced Repetition" [level=3]
  - paragraph: Optimize your learning with scientifically proven spaced repetition algorithms that schedule reviews at the perfect time.
  - img
  - heading "AI Flashcard Generation" [level=3]
  - paragraph: Instantly create high-quality flashcards from any text with our advanced AI that identifies key concepts and questions.
  - img
  - heading "Custom Collections" [level=3]
  - paragraph: Organize your flashcards into custom collections with tags and categories for better organization and focused study sessions.
  - heading "Ready to Learn 10x Faster?" [level=2]
  - paragraph: Join thousands of students and professionals who are accelerating their learning with our AI-powered flashcard system.
  - link "Start Free":
    - /url: /register
    - button "Start Free"
- contentinfo:
  - paragraph: © 2025 10x Cards. All rights reserved.
  - link "Privacy Policy":
    - /url: "#"
  - link "Terms of Service":
    - /url: "#"
  - link "Contact":
    - /url: "#"
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import { HomePage } from './pages/HomePage';
   3 |
   4 | test.describe('Example E2E Test Suite', () => {
   5 |   let homePage: HomePage;
   6 |
   7 |   test.beforeEach(async ({ page }) => {
   8 |     homePage = new HomePage(page);
   9 |     await homePage.goto();
  10 |   });
  11 |
  12 |   test('homepage has correct title', async ({ page }) => {
  13 |     await expect(page).toHaveTitle(/10x Cards/);
  14 |     await homePage.expectLoaded();
  15 |   });
  16 |
  17 |   test('navigation works', async ({ page }) => {
> 18 |     await expect(homePage.loginButton).toBeVisible();
     |                                        ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  19 |     await homePage.clickLogin();
  20 |     
  21 |     // Example of taking screenshot
  22 |     await page.screenshot({ path: 'screenshots/after-login.png' });
  23 |   });
  24 | }); 
```