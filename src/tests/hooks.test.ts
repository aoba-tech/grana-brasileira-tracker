
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { setupTestDB, createTestData } from '@/utils/testUtils';
import { useAccountOperations } from '@/hooks/useAccountOperations';
import { useBudgetOperations } from '@/hooks/useBudgetOperations';
import { useCategoryOperations } from '@/hooks/useCategoryOperations';
import { useTransactionOperations } from '@/hooks/useTransactionOperations';
import { toast } from '@/lib/toast';

// Mock the toast functions
vi.mock('@/lib/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('Hook Operations', () => {
  let teardown: () => void;
  
  beforeEach(async () => {
    const testSetup = await setupTestDB();
    teardown = testSetup.teardown;
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    teardown();
  });
  
  it('should handle account operations correctly', async () => {
    const refreshData = vi.fn(() => Promise.resolve());
    
    const { result } = renderHook(() => useAccountOperations(refreshData));
    
    // Test adding an account
    await act(async () => {
      await result.current.addAccount({
        name: 'Test Hook Account',
        type: 'savings',
        balance: 500,
        color: '#FF5500',
        icon: 'piggy-bank',
        createdAt: new Date()
      });
    });
    
    expect(refreshData).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Conta adicionada com sucesso');
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Test updating an account
    await act(async () => {
      await result.current.updateAccount({
        id: 1,
        name: 'Updated Hook Account',
        type: 'savings',
        balance: 600,
        color: '#FF5500',
        icon: 'piggy-bank',
        createdAt: new Date()
      });
    });
    
    expect(refreshData).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Conta atualizada com sucesso');
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Test deleting an account
    await act(async () => {
      await result.current.deleteAccount(1);
    });
    
    expect(refreshData).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Conta excluída com sucesso');
  });
  
  it('should handle budget operations correctly', async () => {
    const refreshData = vi.fn(() => Promise.resolve());
    const { categoryIds } = await createTestData();
    
    const { result } = renderHook(() => useBudgetOperations(refreshData));
    
    // Test adding a budget
    await act(async () => {
      await result.current.addBudget({
        categoryId: categoryIds[0],
        amount: 300,
        spent: 0,
        period: 'monthly',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      });
    });
    
    expect(refreshData).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Orçamento adicionado com sucesso');
  });
  
  it('should handle transaction operations correctly', async () => {
    const refreshData = vi.fn(() => Promise.resolve());
    const { categoryIds, accountId } = await createTestData();
    
    const { result } = renderHook(() => useTransactionOperations(refreshData));
    
    // Test adding a transaction
    let transactionId: number;
    await act(async () => {
      transactionId = await result.current.addTransaction({
        description: 'Hook Test Transaction',
        amount: 250,
        type: 'expense',
        date: new Date(),
        categoryId: categoryIds[0],
        accountId,
        createdAt: new Date()
      });
    });
    
    expect(refreshData).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Transação adicionada com sucesso');
  });
});
