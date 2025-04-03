
import { DBSchema } from 'idb';

export interface FinanceDB extends DBSchema {
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

// Type aliases for convenience
export type Category = FinanceDB['categories']['value'];
export type Transaction = FinanceDB['transactions']['value'];
export type Account = FinanceDB['accounts']['value'];
export type Budget = FinanceDB['budgets']['value'];
