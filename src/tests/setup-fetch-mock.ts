
import fetchMock from 'vitest-fetch-mock';
import { vi } from 'vitest';

fetchMock.enableMocks();

vi.mock('@/lib/db', async () => {
  const actual = await vi.importActual('@/lib/db');
  return {
    ...actual,
    addTransaction: vi.fn().mockResolvedValue(1),
    updateTransaction: vi.fn().mockResolvedValue(1),
    deleteTransaction: vi.fn().mockResolvedValue(true),
  };
});
