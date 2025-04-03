
import { useState, useEffect } from 'react';
import { 
  initDB, getCategories, getTransactions, getAccounts, getBudgets,
  getExpensesByCategory, getTotalBalance, getBudgetStatus,
  getMonthlyExpenses, getMonthlyIncome
} from '@/lib/db';
import { toast } from '@/lib/toast';

export const useFinanceData = () => {
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

  return {
    categories,
    transactions,
    accounts,
    budgets,
    loading,
    expensesByCategory,
    totalBalance,
    budgetStatus,
    currentMonth,
    setCurrentMonth,
    refreshData,
    monthlyExpenses,
    monthlyIncome,
    setCategories,
    setTransactions,
    setAccounts,
    setBudgets
  };
};
