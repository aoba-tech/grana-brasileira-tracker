
import { expect, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

// jsdom does not implement Blob/File.arrayBuffer — polyfill via FileReader
if (typeof Blob !== 'undefined' && !Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function () {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(this);
    });
  };
}

// Cleanup after each test
afterEach(() => {
  // Cleanup logic
});

// Configure global timeout for tests
vi.setConfig({ testTimeout: 10000 });
