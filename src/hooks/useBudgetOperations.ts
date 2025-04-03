
import { 
  addBudget, updateBudget, deleteBudget
} from '@/lib/db';
import { toast } from '@/lib/toast';

export const useBudgetOperations = (refreshData: () => Promise<void>) => {
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

  return {
    addBudget: addBudgetWithUpdate,
    updateBudget: updateBudgetWithUpdate,
    deleteBudget: deleteBudgetWithUpdate
  };
};
