
import { useState, useEffect } from 'react';
import { formatDateForInput } from '@/lib/locale';

interface TransactionFormData {
  id: number;
  description: string;
  amount: number;
  type: string;
  date: string;
  categoryId: number;
  accountId: number;
  notes: string;
}

interface UseTransactionFormProps {
  isOpen: boolean;
  editTransaction: any | null;
  onSubmit: (formData: TransactionFormData) => Promise<void>;
}

export const useTransactionForm = ({
  isOpen,
  editTransaction,
  onSubmit
}: UseTransactionFormProps) => {
  const [formData, setFormData] = useState<TransactionFormData>({
    id: 0,
    description: '',
    amount: 0,
    type: 'expense',
    date: formatDateForInput(new Date()),
    categoryId: 0,
    accountId: 0,
    notes: ''
  });

  // Reset form when dialog opens/closes or edit transaction changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        id: editTransaction?.id || 0,
        description: editTransaction?.description || '',
        amount: editTransaction?.amount || 0,
        type: editTransaction?.type || 'expense',
        date: editTransaction 
          ? formatDateForInput(new Date(editTransaction.date)) 
          : formatDateForInput(new Date()),
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

  // Handle date change from calendar
  const handleDateChange = (date: Date) => {
    setFormData(prev => ({ ...prev, date: formatDateForInput(date) }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  return {
    formData,
    handleInputChange,
    handleSelectChange,
    handleAmountChange,
    handleDateChange,
    handleSubmit
  };
};
