
import { expect, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

// Cleanup after each test
afterEach(() => {
  // Cleanup logic
});

// Configure global timeout for tests
vi.setConfig({ testTimeout: 10000 });
