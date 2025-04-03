
import { getDB } from './core';
import { Category } from './schema';

export async function getCategories() {
  const db = await getDB();
  return db.getAll('categories');
}

export async function addCategory(category: Omit<Category, 'id'>) {
  const db = await getDB();
  return db.add('categories', category);
}

export async function updateCategory(category: Category) {
  const db = await getDB();
  return db.put('categories', category);
}

export async function deleteCategory(id: number) {
  const db = await getDB();
  return db.delete('categories', id);
}
