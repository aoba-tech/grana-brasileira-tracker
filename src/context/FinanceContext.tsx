import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  initDB, getCategories, getTransactions, getAccounts, getBudgets,
  addTransaction, updateTransaction, deleteTransaction,
  addCategory, updateCategory, deleteCategory,
  addAccount, updateAccount, deleteAccount,
  addBudget, updateBudget, deleteBudget,
  getExpensesByCategory, getTotalBalance, getBudgetStatus,
  getMonthlyExpenses, getMonthlyIncome
} from '@/lib/db';
import { formatISO } from 'date-fns';
import { toast } from '@/lib/toast';

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
  const [categories, setCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expensesByCategory, setExpensesByCategory] = useState<Record<string, number>>({});
  const [totalBalance, setTotalBalance] = useState(0);
  const [budgetStatus, setBudgetStatus] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthlyExpenses, setMonthlyExpenses] = useState<any[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<any[]>([]);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDB();
        await refreshData();
      } catch (error) {
        console.error('Failed to initialize database:', error);
        toast.error('Erro ao inicializar o banco de dados');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!loading) {
      updateMonthlyData();
    }
  }, [currentMonth, loading, transactions]);

  const refreshData = async () => {
    try {
      const categoriesData = await getCategories();
      const transactionsData = await getTransactions();
      const accountsData = await getAccounts();
      const budgetsData = await getBudgets();
      const balance = await getTotalBalance();
      const budgetStatusData = await getBudgetStatus();

      setCategories(categoriesData);
      setTransactions(transactionsData);
      setAccounts(accountsData);
      setBudgets(budgetsData);
      setTotalBalance(balance);
      setBudgetStatus(budgetStatusData);

      await updateMonthlyData();
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast.error('Erro ao atualizar os dados');
    }
  };

  const updateMonthlyData = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      const expenses = await getMonthlyExpenses(year, month);
      const income = await getMonthlyIncome(year, month);
      const expensesByCat = await getExpensesByCategory(year, month);
      
      setMonthlyExpenses(expenses);
      setMonthlyIncome(income);
      setExpensesByCategory(expensesByCat);
    } catch (error) {
      console.error('Failed to update monthly data:', error);
    }
  };

  const addTransactionWithUpdate = async (transaction: any) => {
    try {
      const formattedTransaction = {
        ...transaction,
        date: transaction.date instanceof Date 
          ? formatISO(transaction.date) 
          : transaction.date
      };
      
      const id = await addTransaction(formattedTransaction);
      await refreshData();
      toast.success('Transação adicionada com sucesso');
      return id;
    } catch (error) {
      console.error('Failed to add transaction:', error);
      toast.error('Erro ao adicionar transação');
      throw error;
    }
  };

  const updateTransactionWithUpdate = async (transaction: any) => {
    try {
      const formattedTransaction = {
        ...transaction,
        date: transaction.date instanceof Date 
          ? formatISO(transaction.date) 
          : transaction.date
      };
      
      const id = await updateTransaction(formattedTransaction);
      await refreshData();
      toast.success('Transação atualizada com sucesso');
      return id;
    } catch (error) {
      console.error('Failed to update transaction:', error);
      toast.error('Erro ao atualizar transação');
      throw error;
    }
  };

  const deleteTransactionWithUpdate = async (id: number) => {
    try {
      await deleteTransaction(id);
      await refreshData();
      toast.success('Transação excluída com sucesso');
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      toast.error('Erro ao excluir transação');
      throw error;
    }
  };

  const addCategoryWithUpdate = async (category: any) => {
    try {
      const id = await addCategory(category);
      await refreshData();
      toast.success('Categoria adicionada com sucesso');
      return id;
    } catch (error) {
      console.error('Failed to add category:', error);
      toast.error('Erro ao adicionar categoria');
      throw error;
    }
  };

  const updateCategoryWithUpdate = async (category: any) => {
    try {
      const id = await updateCategory(category);
      await refreshData();
      toast.success('Categoria atualizada com sucesso');
      return id;
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error('Erro ao atualizar categoria');
      throw error;
    }
  };

  const deleteCategoryWithUpdate = async (id: number) => {
    try {
      await deleteCategory(id);
      await refreshData();
      toast.success('Categoria excluída com sucesso');
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Erro ao excluir categoria');
      throw error;
    }
  };

  const addAccountWithUpdate = async (account: any) => {
    try {
      const id = await addAccount(account);
      await refreshData();
      toast.success('Conta adicionada com sucesso');
      return id;
    } catch (error) {
      console.error('Failed to add account:', error);
      toast.error('Erro ao adicionar conta');
      throw error;
    }
  };

  const updateAccountWithUpdate = async (account: any) => {
    try {
      const id = await updateAccount(account);
      await refreshData();
      toast.success('Conta atualizada com sucesso');
      return id;
    } catch (error) {
      console.error('Failed to update account:', error);
      toast.error('Erro ao atualizar conta');
      throw error;
    }
  };

  const deleteAccountWithUpdate = async (id: number) => {
    try {
      await deleteAccount(id);
      await refreshData();
      toast.success('Conta excluída com sucesso');
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Erro ao excluir conta');
      throw error;
    }
  };

  const addBudgetWithUpdate = async (budget: any) => {
    try {
      const id = await addBudget(budget);
      await refreshData();
      toast.success('Orçamento adicionado com sucesso');
      return id;
    } catch (error) {
      console.error('Failed to add budget:', error);
      toast.error('Erro ao adicionar orçamento');
      throw error;
    }
  };

  const updateBudgetWithUpdate = async (budget: any) => {
    try {
      const id = await updateBudget(budget);
      await refreshData();
      toast.success('Orçamento atualizado com sucesso');
      return id;
    } catch (error) {
      console.error('Failed to update budget:', error);
      toast.error('Erro ao atualizar orçamento');
      throw error;
    }
  };

  const deleteBudgetWithUpdate = async (id: number) => {
    try {
      await deleteBudget(id);
      await refreshData();
      toast.success('Orçamento excluído com sucesso');
    } catch (error) {
      console.error('Failed to delete budget:', error);
      toast.error('Erro ao excluir orçamento');
      throw error;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        categories,
        transactions,
        accounts,
        budgets,
        loading,
        expensesByCategory,
        totalBalance,
        budgetStatus,
        currentMonth,
        
        addTransaction: addTransactionWithUpdate,
        updateTransaction: updateTransactionWithUpdate,
        deleteTransaction: deleteTransactionWithUpdate,
        
        addCategory: addCategoryWithUpdate,
        updateCategory: updateCategoryWithUpdate,
        deleteCategory: deleteCategoryWithUpdate,
        
        addAccount: addAccountWithUpdate,
        updateAccount: updateAccountWithUpdate,
        deleteAccount: deleteAccountWithUpdate,
        
        addBudget: addBudgetWithUpdate,
        updateBudget: updateBudgetWithUpdate,
        deleteBudget: deleteBudgetWithUpdate,
        
        setCurrentMonth,
        refreshData,
        monthlyExpenses,
        monthlyIncome,
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
