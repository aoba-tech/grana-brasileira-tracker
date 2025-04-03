
import { getDB } from './core';
import { Budget } from './schema';

export async function getBudgets() {
  const db = await getDB();
  return db.getAll('budgets');
}

export async function addBudget(budget: Omit<Budget, 'id'>) {
  const db = await getDB();
  return db.add('budgets', budget);
}

export async function updateBudget(budget: Budget) {
  const db = await getDB();
  return db.put('budgets', budget);
}

export async function deleteBudget(id: number) {
  const db = await getDB();
  return db.delete('budgets', id);
}
