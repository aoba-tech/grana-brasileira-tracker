
import { formatISO } from 'date-fns';
import { 
  addTransaction, updateTransaction, deleteTransaction
} from '@/lib/db';
import { toast } from '@/lib/toast';

export const useTransactionOperations = (refreshData: () => Promise<void>) => {
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

  return {
    addTransaction: addTransactionWithUpdate,
    updateTransaction: updateTransactionWithUpdate,
    deleteTransaction: deleteTransactionWithUpdate
  };
};
