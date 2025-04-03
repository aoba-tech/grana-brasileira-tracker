
import React, { createContext, useContext, ReactNode } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useTransactionOperations } from '@/hooks/useTransactionOperations';
import { useCategoryOperations } from '@/hooks/useCategoryOperations';
import { useAccountOperations } from '@/hooks/useAccountOperations';
import { useBudgetOperations } from '@/hooks/useBudgetOperations';

type FinanceContextType = {
  categories: any[];
  transactions: any[];
  accounts: any[];
  budgets: any[];
  loading: boolean;
  expensesByCategory: Record<string, number>;
  totalBalance: number;
  budgetStatus: any[];
  currentMonth: Date;
  
  addTransaction: (transaction: any) => Promise<number>;
  updateTransaction: (transaction: any) => Promise<number>;
  deleteTransaction: (id: number) => Promise<void>;
  
  addCategory: (category: any) => Promise<number>;
  updateCategory: (category: any) => Promise<number>;
  deleteCategory: (id: number) => Promise<void>;
  
  addAccount: (account: any) => Promise<number>;
  updateAccount: (account: any) => Promise<number>;
  deleteAccount: (id: number) => Promise<void>;
  
  addBudget: (budget: any) => Promise<number>;
  updateBudget: (budget: any) => Promise<number>;
  deleteBudget: (id: number) => Promise<void>;
  
  setCurrentMonth: (date: Date) => void;
  refreshData: () => Promise<void>;
  monthlyExpenses: any[];
  monthlyIncome: any[];
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
