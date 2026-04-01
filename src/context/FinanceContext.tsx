
import React, { createContext, useContext, ReactNode } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useTransactionOperations } from '@/hooks/useTransactionOperations';
import { useCategoryOperations } from '@/hooks/useCategoryOperations';
import { useAccountOperations } from '@/hooks/useAccountOperations';
import { useBudgetOperations } from '@/hooks/useBudgetOperations';
import { Category, Transaction, Account, Budget, BudgetStatus } from '@/lib/db/schema';

type FinanceContextType = {
  categories: Category[];
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  loading: boolean;
  expensesByCategory: Record<string, number>;
  totalBalance: number;
  budgetStatus: BudgetStatus[];
  currentMonth: Date;

  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<number>;
  updateTransaction: (transaction: Transaction) => Promise<number>;
  deleteTransaction: (id: number) => Promise<void>;

  addCategory: (category: Omit<Category, 'id'>) => Promise<number>;
  updateCategory: (category: Category) => Promise<number>;
  deleteCategory: (id: number) => Promise<void>;

  addAccount: (account: Omit<Account, 'id'>) => Promise<number>;
  updateAccount: (account: Account) => Promise<number>;
  deleteAccount: (id: number) => Promise<void>;

  addBudget: (budget: Omit<Budget, 'id'>) => Promise<number>;
  updateBudget: (budget: Budget) => Promise<number>;
  deleteBudget: (id: number) => Promise<void>;

  setCurrentMonth: (date: Date) => void;
  refreshData: () => Promise<void>;
  monthlyExpenses: Transaction[];
  monthlyIncome: Transaction[];
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const financeData = useFinanceData();
  const transactionOps = useTransactionOperations(financeData.refreshData);
  const categoryOps = useCategoryOperations(financeData.refreshData);
  const accountOps = useAccountOperations(financeData.refreshData);
  const budgetOps = useBudgetOperations(financeData.refreshData);
  
  return (
    <FinanceContext.Provider
      value={{
        ...financeData,
        ...transactionOps,
        ...categoryOps,
        ...accountOps,
        ...budgetOps,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
