
import {
  addAccount, updateAccount, deleteAccount
} from '@/lib/db';
import { toast } from '@/lib/toast';
import { Account } from '@/lib/db/schema';

export const useAccountOperations = (refreshData: () => Promise<void>) => {
  const addAccountWithUpdate = async (account: Omit<Account, 'id'>) => {
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

  const updateAccountWithUpdate = async (account: Account) => {
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

  return {
    addAccount: addAccountWithUpdate,
    updateAccount: updateAccountWithUpdate,
    deleteAccount: deleteAccountWithUpdate
  };
};
