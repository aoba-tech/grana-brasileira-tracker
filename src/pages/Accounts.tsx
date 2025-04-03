
import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/currency-input';
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
import {
  Trash2,
  Edit,
  Plus,
  CreditCard,
  Wallet,
  LineChart,
  PiggyBank,
  ClipboardList
} from 'lucide-react';

const Accounts = () => {
  const { accounts, addAccount, updateAccount, deleteAccount } = useFinance();
  
  // State for the new/edit account form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    type: 'checking',
    balance: 0,
    color: '#00A86B',
    icon: 'credit-card',
  });
  
  // Account type options with icons
  const accountTypes = [
    { value: 'checking', label: 'Conta Corrente', icon: CreditCard },
    { value: 'savings', label: 'Poupança', icon: PiggyBank },
    { value: 'credit', label: 'Cartão de Crédito', icon: CreditCard },
    { value: 'investment', label: 'Investimentos', icon: LineChart },
    { value: 'other', label: 'Outros', icon: ClipboardList },
  ];
  
  // Color options
  const colorOptions = [
    { value: '#00A86B', label: 'Verde' },
    { value: '#1A73E8', label: 'Azul' },
    { value: '#E53935', label: 'Vermelho' },
    { value: '#FFC107', label: 'Amarelo' },
    { value: '#6200EA', label: 'Roxo' },
    { value: '#FF6D00', label: 'Laranja' },
    { value: '#607D8B', label: 'Cinza' },
  ];
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle balance change from currency input
  const handleBalanceChange = (value: number) => {
    setFormData(prev => ({ ...prev, balance: value }));
  };
  
  // Reset form to default values
  const resetForm = () => {
    setFormData({
      id: 0,
      name: '',
      type: 'checking',
      balance: 0,
      color: '#00A86B',
      icon: 'credit-card',
    });
    setIsEditMode(false);
  };
  
  // Open dialog in add mode
  const handleAddClick = () => {
    resetForm();
    setIsDialogOpen(true);
  };
  
  // Open dialog in edit mode
  const handleEditClick = (account: any) => {
    setFormData({
      id: account.id,
      name: account.name,
      type: account.type,
      balance: account.balance,
      color: account.color,
      icon: account.icon,
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditMode) {
        await updateAccount({ ...formData, createdAt: new Date() });
      } else {
        await addAccount({ ...formData, createdAt: new Date() });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };
  
  // Handle account deletion
  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        await deleteAccount(id);
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };
  
  // Get icon component for account type
  const getAccountIcon = (type: string) => {
    const accountType = accountTypes.find(t => t.value === type);
    const IconComponent = accountType?.icon || CreditCard;
    return <IconComponent className="h-6 w-6" />;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contas</h1>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Conta
        </Button>
      </div>
      
      {accounts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map(account => (
            <Card key={account.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className="flex h-8 w-8 items-center justify-center rounded-full" 
                    style={{ backgroundColor: account.color + '20', color: account.color }}
                  >
                    {getAccountIcon(account.type)}
                  </div>
                  <CardTitle className="text-md font-medium">{account.name}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEditClick(account)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(account.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(account.balance)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {accountTypes.find(t => t.value === account.type)?.label || 'Conta'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-10 pb-10">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Wallet className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2 text-center">
                <h3 className="text-lg font-medium">Nenhuma conta encontrada</h3>
                <p className="text-sm text-muted-foreground">
                  Você ainda não possui nenhuma conta cadastrada. Adicione uma conta para começar a gerenciar suas finanças.
                </p>
              </div>
              <Button onClick={handleAddClick}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Add/Edit Account Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Editar Conta' : 'Nova Conta'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Conta</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo de Conta</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="balance">Saldo Inicial</Label>
                <CurrencyInput
                  id="balance"
                  name="balance"
                  value={formData.balance}
                  onValueChange={handleBalanceChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="color">Cor</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => handleSelectChange('color', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma cor" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center space-x-2">
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: color.value }}
                          />
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
    </div>
  );
};

export default Accounts;
