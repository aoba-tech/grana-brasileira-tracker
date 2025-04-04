
import { vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

const fetchMock = createFetchMock(vi);
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
