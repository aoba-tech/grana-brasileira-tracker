
import {
  addCategory, updateCategory, deleteCategory
} from '@/lib/db';
import { toast } from '@/lib/toast';
import { Category } from '@/lib/db/schema';

export const useCategoryOperations = (refreshData: () => Promise<void>) => {
  const addCategoryWithUpdate = async (category: Omit<Category, 'id'>) => {
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

  const updateCategoryWithUpdate = async (category: Category) => {
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

  return {
    addCategory: addCategoryWithUpdate,
    updateCategory: updateCategoryWithUpdate,
    deleteCategory: deleteCategoryWithUpdate
  };
};
