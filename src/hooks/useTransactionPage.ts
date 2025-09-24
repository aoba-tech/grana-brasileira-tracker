
import { useMemo, useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Transaction } from '@/lib/db/schema';

type TransactionTypeFilter = 'all' | 'income' | 'expense';

export const useTransactionPage = () => {
  const {
    transactions,
    categories,
    accounts,
    deleteTransaction
  } = useFinance();
  
  // State for UI controls
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([]);
  const [transactionType, setTransactionType] =
    useState<TransactionTypeFilter>('all');

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return transactions
      .filter(transaction => {
        if (!normalizedSearch) return true;
        const haystack = `${transaction.description} ${transaction.notes ?? ''}`
          .toLowerCase()
          .trim();
        return haystack.includes(normalizedSearch);
      })
      .filter(transaction => {
        if (selectedAccountIds.length === 0) return true;
        return selectedAccountIds.includes(transaction.accountId);
      })
      .filter(transaction => {
        if (transactionType === 'all') return true;
        return transaction.type === transactionType;
      });
  }, [transactions, searchTerm, selectedAccountIds, transactionType]);

  const sortedTransactions = useMemo(
    () =>
      [...filteredTransactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [filteredTransactions]
  );

  const handleAccountSelectionChange = (accountId: number, isSelected: boolean) => {
    setSelectedAccountIds(prevSelected => {
      if (isSelected) {
        if (prevSelected.includes(accountId)) {
          return prevSelected;
        }

        return [...prevSelected, accountId];
      }

      return prevSelected.filter(id => id !== accountId);
    });
  };

  const clearAccountSelection = () => {
    setSelectedAccountIds([]);
  };

  const handleTransactionTypeChange = (type: TransactionTypeFilter) => {
    setTransactionType(type);
  };

  // Open dialog in add mode
  const handleAddClick = () => {
    setEditingTransaction(null);
    setIsTransactionFormOpen(true);
  };
  
  // Open dialog in edit mode
  const handleEditClick = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsTransactionFormOpen(true);
  };
  
  // Handle transaction deletion
  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await deleteTransaction(id);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };
  
  // Open import dialog
  const handleImportClick = () => {
    setIsImportDialogOpen(true);
  };

  return {
    categories,
    accounts,
    sortedTransactions,
    isTransactionFormOpen,
    setIsTransactionFormOpen,
    isImportDialogOpen,
    setIsImportDialogOpen,
    editingTransaction,
    searchTerm,
    setSearchTerm,
    transactionType,
    handleTransactionTypeChange,
    selectedAccountIds,
    handleAccountSelectionChange,
    clearAccountSelection,
    handleAddClick,
    handleEditClick,
    handleDelete,
    handleImportClick
  };
};
