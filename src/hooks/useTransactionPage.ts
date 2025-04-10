
import { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';

export const useTransactionPage = () => {
  const { 
    transactions, 
    categories, 
    deleteTransaction
  } = useFinance();
  
  // State for UI controls
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
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
    sortedTransactions,
    isTransactionFormOpen,
    setIsTransactionFormOpen,
    isImportDialogOpen,
    setIsImportDialogOpen,
    editingTransaction,
    searchTerm,
    setSearchTerm,
    handleAddClick,
    handleEditClick,
    handleDelete,
    handleImportClick
  };
};
