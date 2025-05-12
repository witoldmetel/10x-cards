import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Extend matchers
expect.extend({});

// Global mocks
vi.stubGlobal('fetch', vi.fn());

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.resetModules();
}); 