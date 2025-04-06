
import React, { useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/currency-input';
import { formatDateForInput } from '@/lib/locale';

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
  
  // Form state
  const [formData, setFormData] = useState({
    id: editTransaction?.id || 0,
    description: editTransaction?.description || '',
    amount: editTransaction?.amount || 0,
    type: editTransaction?.type || 'expense',
    date: editTransaction ? formatDateForInput(new Date(editTransaction.date)) : formatDateForInput(new Date()),
    categoryId: editTransaction?.categoryId || 0,
    accountId: editTransaction?.accountId || 0,
    notes: editTransaction?.notes || ''
  });
  
  // Reset form when dialog opens/closes or edit transaction changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        id: editTransaction?.id || 0,
        description: editTransaction?.description || '',
        amount: editTransaction?.amount || 0,
        type: editTransaction?.type || 'expense',
        date: editTransaction ? formatDateForInput(new Date(editTransaction.date)) : formatDateForInput(new Date()),
        categoryId: editTransaction?.categoryId || 0,
        accountId: editTransaction?.accountId || 0,
        notes: editTransaction?.notes || ''
      });
    }
  }, [isOpen, editTransaction]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle amount change from currency input
  const handleAmountChange = (value: number) => {
    setFormData(prev => ({ ...prev, amount: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditMode) {
        await updateTransaction(formData);
      } else {
        await addTransaction(formData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Transação' : 'Nova Transação'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="amount">Valor</Label>
              <CurrencyInput
                id="amount"
                name="amount"
                value={formData.amount}
                onValueChange={handleAmountChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.categoryId.toString()}
                onValueChange={(value) => handleSelectChange('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter(category => category.type === formData.type)
                    .map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="account">Conta</Label>
              <Select
                value={formData.accountId.toString()}
                onValueChange={(value) => handleSelectChange('accountId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Input
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
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
