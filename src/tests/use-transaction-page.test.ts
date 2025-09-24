import { describe, expect, it, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useTransactionPage } from '@/hooks/useTransactionPage';
import { useFinance } from '@/context/FinanceContext';

vi.mock('@/context/FinanceContext', () => ({
  useFinance: vi.fn()
}));

type MockTransaction = {
  id: number;
  description: string;
  amount: number;
  date: string;
  accountId: number;
  type: 'expense' | 'income';
  notes?: string;
};

describe('useTransactionPage', () => {
  const deleteTransaction = vi.fn();
  const categories: any[] = [];
  const accounts = [
    { id: 1, name: 'Conta Corrente' },
    { id: 2, name: 'Cartão de Crédito' },
    { id: 3, name: 'Poupança' }
  ];

  const transactions: MockTransaction[] = [
    {
      id: 1,
      description: 'Supermercado',
      amount: 150,
      date: '2024-05-10',
      accountId: 1,
      type: 'expense'
    },
    {
      id: 2,
      description: 'Salário',
      amount: 5000,
      date: '2024-05-01',
      accountId: 2,
      type: 'income'
    },
    {
      id: 3,
      description: 'Investimento',
      amount: 300,
      date: '2024-05-15',
      accountId: 3,
      type: 'income'
    }
  ];

  beforeEach(() => {
    deleteTransaction.mockReset();
    vi.mocked(useFinance).mockReturnValue({
      transactions,
      categories,
      accounts,
      deleteTransaction
    } as any);
  });

  it('returns all transactions when no filters are selected', () => {
    const { result } = renderHook(() => useTransactionPage());

    expect(result.current.sortedTransactions).toHaveLength(transactions.length);
    expect(result.current.selectedAccountIds).toEqual([]);
    expect(result.current.transactionType).toBe('all');
  });

  it('filters transactions by selected accounts', () => {
    const { result } = renderHook(() => useTransactionPage());

    act(() => {
      result.current.handleAccountSelectionChange(1, true);
    });

    expect(result.current.selectedAccountIds).toEqual([1]);
    expect(result.current.sortedTransactions.every(transaction => transaction.accountId === 1)).toBe(true);

    act(() => {
      result.current.handleAccountSelectionChange(2, true);
    });

    expect([...result.current.selectedAccountIds].sort()).toEqual([1, 2]);
    expect(
      result.current.sortedTransactions.every(transaction =>
        [1, 2].includes(transaction.accountId)
      )
    ).toBe(true);

    act(() => {
      result.current.handleAccountSelectionChange(1, false);
    });

    expect(result.current.selectedAccountIds).toEqual([2]);
    expect(result.current.sortedTransactions.every(transaction => transaction.accountId === 2)).toBe(true);

    act(() => {
      result.current.clearAccountSelection();
    });

    expect(result.current.selectedAccountIds).toEqual([]);
    expect(result.current.sortedTransactions).toHaveLength(transactions.length);
  });

  it('filters transactions by type while combining account filters', () => {
    const { result } = renderHook(() => useTransactionPage());

    act(() => {
      result.current.handleTransactionTypeChange('expense');
    });

    expect(result.current.sortedTransactions).toHaveLength(1);
    expect(result.current.sortedTransactions[0].description).toBe('Supermercado');

    act(() => {
      result.current.handleAccountSelectionChange(2, true);
    });

    expect(result.current.sortedTransactions).toHaveLength(0);

    act(() => {
      result.current.handleTransactionTypeChange('income');
    });

    expect(result.current.sortedTransactions).toHaveLength(1);
    expect(result.current.sortedTransactions[0].description).toBe('Salário');

    act(() => {
      result.current.clearAccountSelection();
    });

    expect(result.current.sortedTransactions).toHaveLength(2);
    expect(
      result.current.sortedTransactions.every(
        transaction => transaction.type === 'income'
      )
    ).toBe(true);
  });
});
