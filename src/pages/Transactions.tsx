
import React from 'react';
import TransactionHeader from '@/components/transactions/TransactionHeader';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import TransactionTable from '@/components/transactions/TransactionTable';
import TransactionForm from '@/components/TransactionForm';
import ImportTransactionDialog from '@/components/ImportTransactionDialog';
import { useTransactionPage } from '@/hooks/useTransactionPage';

const Transactions = () => {
  const {
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
  } = useTransactionPage();
  
  return (
    <div className="space-y-4">
      <TransactionHeader 
        onAddClick={handleAddClick} 
        onImportClick={handleImportClick} 
      />
      
      <TransactionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        transactionType={transactionType}
        onTransactionTypeChange={handleTransactionTypeChange}
        accounts={accounts}
        selectedAccountIds={selectedAccountIds}
        onAccountSelectionChange={handleAccountSelectionChange}
        onClearAccountFilters={clearAccountSelection}
      />

      <TransactionTable
        transactions={sortedTransactions}
        categories={categories}
        onEdit={handleEditClick}
        onDelete={handleDelete}
      />
      
      <TransactionForm 
        isOpen={isTransactionFormOpen} 
        onOpenChange={setIsTransactionFormOpen} 
        editTransaction={editingTransaction} 
      />
      
      <ImportTransactionDialog
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
    </div>
  );
};

export default Transactions;
