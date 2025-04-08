
// Re-export the core functions
export { initDB, getDB, DEFAULT_CATEGORY_ID } from './core';

// Re-export category operations
export { getCategories, addCategory, updateCategory, deleteCategory } from './categories';

// Re-export account operations
export { getAccounts, addAccount, updateAccount, deleteAccount } from './accounts';

// Re-export budget operations
export { getBudgets, addBudget, updateBudget, deleteBudget } from './budgets';

// Re-export transaction operations
export { getTransactions, addTransaction, updateTransaction, deleteTransaction } from './transactions';

// Re-export analytics operations
export { 
  getMonthlyExpenses, 
  getMonthlyIncome, 
  getExpensesByCategory, 
  getTotalBalance, 
  getBudgetStatus 
} from './analytics';

// Re-export types
export type { 
  FinanceDB,
  Category,
  Transaction,
  Account,
  Budget
} from './schema';
