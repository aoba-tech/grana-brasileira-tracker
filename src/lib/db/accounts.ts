
import { getDB } from './core';
import { Account } from './schema';

export async function getAccounts() {
  const db = await getDB();
  return db.getAll('accounts');
}

export async function addAccount(account: Omit<Account, 'id'>) {
  const db = await getDB();
  return db.add('accounts', account);
}

export async function updateAccount(account: Account) {
  const db = await getDB();
  return db.put('accounts', account);
}

export async function deleteAccount(id: number) {
  const db = await getDB();
  return db.delete('accounts', id);
}
