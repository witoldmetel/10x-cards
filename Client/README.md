# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Testing

### Unit and Integration Tests
We use React Testing Library with Vitest for unit and integration testing. Run tests with:

```bash
npm run test        # Run all tests
npm run test:watch  # Run tests in watch mode
```

Key test areas:
- React components and hooks
- Helper functions
- Form validation
- State management
- API integration

### End-to-End Tests
We use Playwright for E2E testing across different browsers:

```bash
npm run e2e        # Run all E2E tests
npm run e2e:ui     # Open Playwright Test Runner UI
```

### Performance and Accessibility Tests
- Lighthouse for performance metrics
- WebPageTest for detailed performance analysis
- Axe and WAVE for WCAG 2.1 Level AA compliance

```bash
npm run perf       # Run Lighthouse tests
npm run a11y       # Run accessibility tests
```

### Test Coverage Requirements
- Minimum 80% coverage for business logic
- All critical user paths must be covered by E2E tests
- Performance requirements:
  - Page load time < 2s
  - API response time < 200ms (95th percentile)

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
