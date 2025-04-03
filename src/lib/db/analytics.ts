
import { getDB } from './core';
import { getCategories, getAccounts, getBudgets } from './index';

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
  const accounts = await getAccounts();
  return accounts.reduce((sum, account) => sum + account.balance, 0);
}

export async function getBudgetStatus() {
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
