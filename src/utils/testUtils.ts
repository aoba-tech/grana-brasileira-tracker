
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';
import { initDB, getDB } from '@/lib/db';
import type { FinanceDB } from '@/lib/db';

/**
 * Sets up an in-memory test database
 */
export async function setupTestDB() {
  // Save the original IndexedDB implementation
  const originalIndexedDB = global.indexedDB;
  
  // Create new fake IndexedDB
  const mockIndexedDB = new FDBFactory();
  
  // Replace the global indexedDB with the mock
  global.indexedDB = mockIndexedDB as unknown as IDBFactory;
  
  // Clear any existing connections
  await initDB();
  
  return {
    teardown: () => {
      // Restore the original IndexedDB
      global.indexedDB = originalIndexedDB;
    }
  };
}

/**
 * Creates test data for use in tests
 */
export async function createTestData() {
  const db = await getDB();
  
  // Add test categories
  const testCategories = [
    { name: 'Test Expense', color: '#FF0000', icon: 'test', type: 'expense' as const, createdAt: new Date() },
    { name: 'Test Income', color: '#00FF00', icon: 'test', type: 'income' as const, createdAt: new Date() }
  ];
  
  const categoryIds = [];
  for (const category of testCategories) {
    const id = await db.add('categories', category);
    categoryIds.push(id);
  }
  
  // Add test account
  const testAccount = {
    name: 'Test Account',
    type: 'checking' as const,
    balance: 1000,
    color: '#0000FF',
    icon: 'test',
    createdAt: new Date()
  };
  
  const accountId = await db.add('accounts', testAccount);
  
  // Add test transactions
  const testTransactions = [
    {
      description: 'Test Expense',
      amount: 100,
      type: 'expense' as const,
      date: new Date(),
      categoryId: categoryIds[0],
      accountId,
      createdAt: new Date()
    },
    {
      description: 'Test Income',
      amount: 500,
      type: 'income' as const,
      date: new Date(),
      categoryId: categoryIds[1],
      accountId,
      createdAt: new Date()
    }
  ];
  
  const transactionIds = [];
  for (const transaction of testTransactions) {
    const id = await db.add('transactions', transaction);
    transactionIds.push(id);
  }
  
  // Add test budget
  const testBudget = {
    categoryId: categoryIds[0],
    amount: 200,
    spent: 100,
    period: 'monthly' as const,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    createdAt: new Date()
  };
  
  const budgetId = await db.add('budgets', testBudget);
  
  return {
    categoryIds,
    accountId,
    transactionIds,
    budgetId
  };
}
