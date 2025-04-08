
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initDB, getDB, DB_NAME } from '@/lib/db/core';
import { setupTestDB } from '@/utils/testUtils';
import { FinanceDB } from '@/lib/db/schema';

describe('DB Core Functions', () => {
  let teardown: () => void;
  
  beforeEach(async () => {
    const testSetup = await setupTestDB();
    teardown = testSetup.teardown;
  });
  
  afterEach(() => {
    teardown();
  });
  
  it('should initialize the database successfully', async () => {
    const db = await initDB();
    expect(db).toBeDefined();
    expect(db.name).toBe(DB_NAME);
    expect(db.version).toBeGreaterThan(0);
    
    // Verify default data is created
    const categories = await db.getAll('categories');
    expect(categories.length).toBeGreaterThan(0);
    
    const accounts = await db.getAll('accounts');
    expect(accounts.length).toBeGreaterThan(0);
  });
  
  it('should return the same instance on multiple getDB calls', async () => {
    const db1 = await getDB();
    const db2 = await getDB();
    
    expect(db1).toBe(db2);
  });
  
  it('should have the required object stores', async () => {
    const db = await getDB();
    const storeNames = Array.from(db.objectStoreNames);
    
    expect(storeNames).toContain('categories');
    expect(storeNames).toContain('transactions');
    expect(storeNames).toContain('accounts');
    expect(storeNames).toContain('budgets');
  });
  
  it('should handle database versioning', async () => {
    // Create a mock db opener function to simulate version change
    const mockOpenDB = vi.fn();
    
    // Just verify the current version is retrieved correctly
    const currentVersion = db?.version;
    expect(currentVersion).toBeGreaterThan(0);
  });
});
