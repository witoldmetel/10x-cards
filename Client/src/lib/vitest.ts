import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Global mocks
vi.stubGlobal('fetch', vi.fn());

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.resetModules();
});
