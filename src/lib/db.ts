
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { getCurrentMigrationVersion, runMigrations } from './migrations';

interface FinanceDB extends DBSchema {
  categories: {
    key: number;
    value: {
      id?: number;
      name: string;
      color: string;
      icon: string;
      type: 'expense' | 'income';
      createdAt: Date;
    };
    indexes: { 'by-name': string };
  };
  transactions: {
    key: number;
    value: {
      id?: number;
      description: string;
      amount: number;
      type: 'expense' | 'income';
      date: Date;
      categoryId: number;
      accountId: number;
      notes?: string;
      createdAt: Date;
    };
    indexes: { 'by-date': Date; 'by-category': number; 'by-account': number };
  };
  accounts: {
    key: number;
    value: {
      id?: number;
      name: string;
      type: 'checking' | 'savings' | 'credit' | 'investment' | 'other';
      balance: number;
      color: string;
      icon: string;
      createdAt: Date;
    };
    indexes: { 'by-name': string };
  };
  budgets: {
    key: number;
    value: {
      id?: number;
      categoryId: number;
      amount: number;
      spent: number;
      period: 'monthly' | 'yearly';
      startDate: Date;
      endDate: Date;
      createdAt: Date;
    };
    indexes: { 'by-category': number; 'by-period': string };
  };
}

let db: IDBPDatabase<FinanceDB> | null = null;

export async function initDB() {
  if (db) return db;

  const dbName = 'finance-app-db';
  const currentVersion = getCurrentMigrationVersion();

  db = await openDB<FinanceDB>(dbName, currentVersion, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);
      
      // Initial setup for version 1
      if (oldVersion < 1) {
        // Create object stores
        const categoryStore = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
        categoryStore.createIndex('by-name', 'name');

        const transactionStore = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
        transactionStore.createIndex('by-date', 'date');
        transactionStore.createIndex('by-category', 'categoryId');
        transactionStore.createIndex('by-account', 'accountId');

        const accountStore = db.createObjectStore('accounts', { keyPath: 'id', autoIncrement: true });
        accountStore.createIndex('by-name', 'name');

        const budgetStore = db.createObjectStore('budgets', { keyPath: 'id', autoIncrement: true });
        budgetStore.createIndex('by-category', 'categoryId');
        budgetStore.createIndex('by-period', 'period');

        // Pre-populate with default categories
        const defaultCategories = [
          { name: 'Alimentação', color: '#00A86B', icon: 'utensils', type: 'expense' as const, createdAt: new Date() },
          { name: 'Transporte', color: '#1A73E8', icon: 'car', type: 'expense' as const, createdAt: new Date() },
          { name: 'Moradia', color: '#FFC107', icon: 'home', type: 'expense' as const, createdAt: new Date() },
          { name: 'Lazer', color: '#6200EA', icon: 'film', type: 'expense' as const, createdAt: new Date() },
          { name: 'Saúde', color: '#E53935', icon: 'heart', type: 'expense' as const, createdAt: new Date() },
          { name: 'Salário', color: '#00A86B', icon: 'wallet', type: 'income' as const, createdAt: new Date() },
          { name: 'Investimentos', color: '#1A73E8', icon: 'trending-up', type: 'income' as const, createdAt: new Date() },
        ];

        for (const category of defaultCategories) {
          categoryStore.add(category);
        }

        // Add default account
        accountStore.add({
          name: 'Conta Principal',
          type: 'checking',
          balance: 0,
          color: '#00A86B',
          icon: 'credit-card',
          createdAt: new Date()
        });
      }
      
      // Additional upgrade logic for future versions would go here
    },
  });

  // Run any pending migrations
  await runMigrations(dbName, db.version);

  return db;
}

export async function getDB() {
  if (!db) {
    return await initDB();
  }
  return db;
}

// Category CRUD
export async function getCategories() {
  const db = await getDB();
  return db.getAll('categories');
}

export async function addCategory(category: Omit<FinanceDB['categories']['value'], 'id'>) {
  const db = await getDB();
  return db.add('categories', category);
}

export async function updateCategory(category: FinanceDB['categories']['value']) {
  const db = await getDB();
  return db.put('categories', category);
}

export async function deleteCategory(id: number) {
  const db = await getDB();
  return db.delete('categories', id);
}

// Transaction CRUD
export async function getTransactions() {
  const db = await getDB();
  return db.getAll('transactions');
}

export async function addTransaction(transaction: Omit<FinanceDB['transactions']['value'], 'id'>) {
  const db = await getDB();
  const id = await db.add('transactions', transaction);
  
  // Update account balance
  const account = await db.get('accounts', transaction.accountId);
  if (account) {
    account.balance += transaction.type === 'income' ? transaction.amount : -transaction.amount;
    await db.put('accounts', account);
  }
  
  // Update budget spent amount
  const budgets = await db.getAllFromIndex('budgets', 'by-category', transaction.categoryId);
  for (const budget of budgets) {
    const transactionDate = new Date(transaction.date);
    const startDate = new Date(budget.startDate);
    const endDate = new Date(budget.endDate);
    
    if (transactionDate >= startDate && transactionDate <= endDate && transaction.type === 'expense') {
      budget.spent += transaction.amount;
      await db.put('budgets', budget);
    }
  }
  
  return id;
}

export async function updateTransaction(transaction: FinanceDB['transactions']['value']) {
  const db = await getDB();
  
  // Get the old transaction to calculate balance diff
  const oldTransaction = await db.get('transactions', transaction.id!);
  
  if (oldTransaction) {
    // Update account balance
    const account = await db.get('accounts', transaction.accountId);
    if (account) {
      // Revert old transaction effect
      account.balance -= oldTransaction.type === 'income' ? oldTransaction.amount : -oldTransaction.amount;
      // Apply new transaction effect
      account.balance += transaction.type === 'income' ? transaction.amount : -transaction.amount;
      await db.put('accounts', account);
    }
    
    // Update budget spent amount if it's an expense
    if (transaction.type === 'expense') {
      const budgets = await db.getAllFromIndex('budgets', 'by-category', transaction.categoryId);
      for (const budget of budgets) {
        const transactionDate = new Date(transaction.date);
        const startDate = new Date(budget.startDate);
        const endDate = new Date(budget.endDate);
        
        if (transactionDate >= startDate && transactionDate <= endDate) {
          // Revert old spend if it was for the same category
          if (oldTransaction.categoryId === transaction.categoryId) {
            budget.spent -= oldTransaction.amount;
          }
          // Apply new spend
          budget.spent += transaction.amount;
          await db.put('budgets', budget);
        }
      }
    }
  }
  
  return db.put('transactions', transaction);
}

export async function deleteTransaction(id: number) {
  const db = await getDB();
  const transaction = await db.get('transactions', id);
  
  if (transaction) {
    // Update account balance
    const account = await db.get('accounts', transaction.accountId);
    if (account) {
      account.balance -= transaction.type === 'income' ? transaction.amount : -transaction.amount;
      await db.put('accounts', account);
    }
    
    // Update budget spent amount if it's an expense
    if (transaction.type === 'expense') {
      const budgets = await db.getAllFromIndex('budgets', 'by-category', transaction.categoryId);
      for (const budget of budgets) {
        const transactionDate = new Date(transaction.date);
        const startDate = new Date(budget.startDate);
        const endDate = new Date(budget.endDate);
        
        if (transactionDate >= startDate && transactionDate <= endDate) {
          budget.spent -= transaction.amount;
          await db.put('budgets', budget);
        }
      }
    }
  }
  
  return db.delete('transactions', id);
}

// Account CRUD
export async function getAccounts() {
  const db = await getDB();
  return db.getAll('accounts');
}

export async function addAccount(account: Omit<FinanceDB['accounts']['value'], 'id'>) {
  const db = await getDB();
  return db.add('accounts', account);
}

export async function updateAccount(account: FinanceDB['accounts']['value']) {
  const db = await getDB();
  return db.put('accounts', account);
}

export async function deleteAccount(id: number) {
  const db = await getDB();
  return db.delete('accounts', id);
}

// Budget CRUD
export async function getBudgets() {
  const db = await getDB();
  return db.getAll('budgets');
}

export async function addBudget(budget: Omit<FinanceDB['budgets']['value'], 'id'>) {
  const db = await getDB();
  return db.add('budgets', budget);
}

export async function updateBudget(budget: FinanceDB['budgets']['value']) {
  const db = await getDB();
  return db.put('budgets', budget);
}

export async function deleteBudget(id: number) {
  const db = await getDB();
  return db.delete('budgets', id);
}

// Analysis functions
export async function getMonthlyExpenses(year: number, month: number) {
  const db = await getDB();
  const transactions = await db.getAll('transactions');
  
  return transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() === year && 
           date.getMonth() === month && 
           t.type === 'expense';
  });
}

export async function getMonthlyIncome(year: number, month: number) {
  const db = await getDB();
  const transactions = await db.getAll('transactions');
  
  return transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() === year && 
           date.getMonth() === month && 
           t.type === 'income';
  });
}

export async function getExpensesByCategory(year: number, month: number) {
  const db = await getDB();
  const transactions = await getMonthlyExpenses(year, month);
  const categories = await getCategories();
  
  const result: { [key: string]: number } = {};
  
  for (const category of categories) {
    if (category.type === 'expense') {
      const amount = transactions
        .filter(t => t.categoryId === category.id)
        .reduce((sum, t) => sum + t.amount, 0);
      
      result[category.name] = amount;
    }
  }
  
  return result;
}

export async function getTotalBalance() {
  const db = await getDB();
  const accounts = await getAccounts();
  
  return accounts.reduce((sum, account) => sum + account.balance, 0);
}

export async function getBudgetStatus() {
  const db = await getDB();
  const budgets = await getBudgets();
  const categories = await getCategories();
  
  return budgets.map(budget => {
    const category = categories.find(c => c.id === budget.categoryId);
    return {
      ...budget,
      category,
      percentage: budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0
    };
  });
}
