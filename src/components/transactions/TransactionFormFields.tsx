
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/currency-input';

interface TransactionFormFieldsProps {
  formData: {
    description: string;
    amount: number;
    type: string;
    date: string;
    categoryId: number;
    accountId: number;
    notes: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleAmountChange: (value: number) => void;
  categories: any[];
  accounts: any[];
}

const TransactionFormFields: React.FC<TransactionFormFieldsProps> = ({
  formData,
  handleInputChange,
  handleSelectChange,
  handleAmountChange,
  categories,
  accounts
}) => {
  return (
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
  );
};

export default TransactionFormFields;
