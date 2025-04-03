
import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, formatDate } from '@/lib/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Progress } from '@/components/ui/progress';
import {
  Trash2,
  Edit,
  Plus,
  Goal,
  AlertCircle
} from 'lucide-react';
import BudgetProgress from '@/components/BudgetProgress';

const Budgets = () => {
  const { 
    categories, 
    budgets, 
    budgetStatus,
    addBudget, 
    updateBudget, 
    deleteBudget 
  } = useFinance();
  
  // Get expense categories only
  const expenseCategories = categories.filter(c => c.type === 'expense');
  
  // State for the new/edit budget form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    categoryId: 0,
    amount: 0,
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  
  // Reset form to default values
  const resetForm = () => {
    setFormData({
      id: 0,
      categoryId: 0,
      amount: 0,
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    });
    setIsEditMode(false);
  };
  
  // Open dialog in add mode
  const handleAddClick = () => {
    resetForm();
    setIsDialogOpen(true);
  };
  
  // Open dialog in edit mode
  const handleEditClick = (budget: any) => {
    setFormData({
      id: budget.id,
      categoryId: budget.categoryId,
      amount: budget.amount,
      period: budget.period,
      startDate: new Date(budget.startDate).toISOString().split('T')[0],
      endDate: new Date(budget.endDate).toISOString().split('T')[0],
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditMode) {
        await updateBudget({ 
          ...formData, 
          spent: budgetStatus.find(b => b.id === formData.id)?.spent || 0,
          createdAt: new Date() 
        });
      } else {
        await addBudget({ 
          ...formData, 
          spent: 0,
          createdAt: new Date() 
        });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };
  
  // Handle budget deletion
  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      try {
        await deleteBudget(id);
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orçamentos</h1>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>
      
      {budgetStatus.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgetStatus.map(budget => {
            const category = categories.find(c => c.id === budget.categoryId);
            const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
            
            return (
              <Card key={budget.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-md font-medium">
                    {category?.name || 'Orçamento sem categoria'}
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditClick(budget)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(budget.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <BudgetProgress
                    category=""
                    spent={budget.spent}
                    total={budget.amount}
                    color={category?.color || '#00A86B'}
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Período: {budget.period === 'monthly' ? 'Mensal' : 'Anual'}</span>
                    <span>{formatDate(budget.startDate)} - {formatDate(budget.endDate)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-10 pb-10">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Goal className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2 text-center">
                <h3 className="text-lg font-medium">Nenhum orçamento encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  Você ainda não possui nenhum orçamento cadastrado. Adicione um orçamento para começar a controlar seus gastos.
                </p>
              </div>
              <Button onClick={handleAddClick}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Orçamento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Add/Edit Budget Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Editar Orçamento' : 'Novo Orçamento'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.categoryId.toString()}
                  onValueChange={(value) => handleSelectChange('categoryId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="amount">Valor Limite</Label>
                <CurrencyInput
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onValueChange={handleAmountChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="period">Período</Label>
                <Select
                  value={formData.period}
                  onValueChange={(value) => handleSelectChange('period', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
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
    </div>
  );
};

export default Budgets;
