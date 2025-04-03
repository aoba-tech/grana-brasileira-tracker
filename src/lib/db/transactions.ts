
import { getDB } from './core';
import { Transaction } from './schema';

export async function getTransactions() {
  const db = await getDB();
  return db.getAll('transactions');
}

export async function addTransaction(transaction: Omit<Transaction, 'id'>) {
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

export async function updateTransaction(transaction: Transaction) {
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
