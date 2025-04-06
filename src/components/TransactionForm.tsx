
import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import TransactionFormFields from '@/components/transactions/TransactionFormFields';
import { useTransactionForm } from '@/hooks/useTransactionForm';

interface TransactionFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editTransaction?: any; // If provided, we're editing this transaction
}

const TransactionForm = ({ isOpen, onOpenChange, editTransaction }: TransactionFormProps) => {
  const { 
    categories, 
    accounts, 
    addTransaction, 
    updateTransaction 
  } = useFinance();
  
  const isEditMode = !!editTransaction;
  
  const onSubmit = async (formData: any) => {
    if (isEditMode) {
      await updateTransaction(formData);
    } else {
      await addTransaction(formData);
    }
    onOpenChange(false);
  };
  
  const {
    formData,
    handleInputChange,
    handleSelectChange,
    handleAmountChange,
    handleSubmit
  } = useTransactionForm({ isOpen, editTransaction, onSubmit });
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Transação' : 'Nova Transação'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <TransactionFormFields 
            formData={formData}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
            handleAmountChange={handleAmountChange}
            categories={categories}
            accounts={accounts}
          />
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionForm;
