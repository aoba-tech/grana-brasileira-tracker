
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupTestDB, createTestData } from '@/utils/testUtils';
import { 
  getCategories, 
  getTransactions, 
  getAccounts, 
  getBudgets,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getTotalBalance
} from '@/lib/db';

describe('Database Operations', () => {
  let teardown: () => void;
  
  beforeEach(async () => {
    const testSetup = await setupTestDB();
    teardown = testSetup.teardown;
  });
  
  afterEach(() => {
    teardown();
  });
  
  it('should retrieve categories', async () => {
    await createTestData();
    const categories = await getCategories();
    
    // The default categories plus the 2 test categories
    expect(categories.length).toBeGreaterThanOrEqual(2);
    expect(categories.some(c => c.name === 'Test Expense')).toBe(true);
    expect(categories.some(c => c.name === 'Test Income')).toBe(true);
  });
  
  it('should retrieve transactions', async () => {
    await createTestData();
    const transactions = await getTransactions();
    
    expect(transactions.length).toBeGreaterThanOrEqual(2);
    expect(transactions.some(t => t.description === 'Test Expense')).toBe(true);
    expect(transactions.some(t => t.description === 'Test Income')).toBe(true);
  });
  
  it('should retrieve accounts', async () => {
    await createTestData();
    const accounts = await getAccounts();
    
    expect(accounts.length).toBeGreaterThanOrEqual(1);
    expect(accounts.some(a => a.name === 'Test Account')).toBe(true);
  });
  
  it('should retrieve budgets', async () => {
    await createTestData();
    const budgets = await getBudgets();
    
    expect(budgets.length).toBeGreaterThanOrEqual(1);
    expect(budgets[0].amount).toBe(200);
    expect(budgets[0].spent).toBe(100);
  });
  
  it('should add a transaction and update account balance', async () => {
    const { categoryIds, accountId } = await createTestData();
    
    const accountsBefore = await getAccounts();
    const balanceBefore = accountsBefore.find(a => a.id === accountId)?.balance || 0;
    
    await addTransaction({
      description: 'New Test Transaction',
      amount: 200,
      type: 'expense',
      date: new Date(),
      categoryId: categoryIds[0],
      accountId,
      createdAt: new Date()
    });
    
    const accountsAfter = await getAccounts();
    const balanceAfter = accountsAfter.find(a => a.id === accountId)?.balance || 0;
    
    expect(balanceAfter).toBe(balanceBefore - 200);
    
    const transactions = await getTransactions();
    expect(transactions.some(t => t.description === 'New Test Transaction')).toBe(true);
  });
  
  it('should update a transaction and adjust account balance', async () => {
    const { transactionIds } = await createTestData();
    const transactions = await getTransactions();
    const transaction = transactions.find(t => t.id === transactionIds[0]);
    
    if (transaction) {
      const balanceBefore = await getTotalBalance();
      
      // Update the transaction amount
      transaction.amount = 150; // was 100 before
      await updateTransaction(transaction);
      
      const balanceAfter = await getTotalBalance();
      
      // Since it's an expense, increasing it by 50 should decrease the balance by 50
      expect(balanceAfter).toBe(balanceBefore - 50);
    }
  });
  
  it('should delete a transaction and adjust account balance', async () => {
    const { transactionIds } = await createTestData();
    const transactions = await getTransactions();
    const transaction = transactions.find(t => t.id === transactionIds[0]);
    
    if (transaction) {
      const balanceBefore = await getTotalBalance();
      
      await deleteTransaction(transactionIds[0]);
      
      const balanceAfter = await getTotalBalance();
      const transactionsAfter = await getTransactions();
      
      // The balance should increase by the expense amount (since we're removing an expense)
      expect(balanceAfter).toBe(balanceBefore + (transaction.type === 'expense' ? transaction.amount : -transaction.amount));
      expect(transactionsAfter.some(t => t.id === transactionIds[0])).toBe(false);
    }
  });
});
