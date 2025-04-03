
import { openDB, IDBPDatabase } from 'idb';
import { FinanceDB } from './schema';
import { getCurrentMigrationVersion, runMigrations } from '../migrations';

let db: IDBPDatabase<FinanceDB> | null = null;

export const DB_NAME = 'finance-app-db';

export async function initDB() {
  if (db) return db;

  const currentVersion = getCurrentMigrationVersion();

  db = await openDB<FinanceDB>(DB_NAME, currentVersion, {
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
  await runMigrations(DB_NAME, db.version);

  return db;
}

export async function getDB() {
  if (!db) {
    return await initDB();
  }
  return db;
}
