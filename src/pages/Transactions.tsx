
import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, formatDate } from '@/lib/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CategoryBadge from '@/components/CategoryBadge';
import { 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight,
  Trash2,
  Edit,
  Filter
} from 'lucide-react';
import TransactionForm from '@/components/TransactionForm';

const Transactions = () => {
  const { 
    transactions, 
    categories, 
    deleteTransaction
  } = useFinance();
  
  // State for the transaction form
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Open dialog in add mode
  const handleAddClick = () => {
    setEditingTransaction(null);
    setIsTransactionFormOpen(true);
  };
  
  // Open dialog in edit mode
  const handleEditClick = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsTransactionFormOpen(true);
  };
  
  // Handle transaction deletion
  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await deleteTransaction(id);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transações</h1>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </div>
      
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar transações..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Transactions table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.length > 0 ? (
              sortedTransactions.map((transaction) => {
                const category = categories.find(c => c.id === transaction.categoryId);
                
                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className={`mr-2 rounded-full p-1 ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {transaction.type === 'income' ? (
                            <ArrowUpRight className="h-3 w-3 text-finance-green" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 text-finance-red" />
                          )}
                        </div>
                        {transaction.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      {category ? (
                        <CategoryBadge category={category} />
                      ) : (
                        <span className="text-muted-foreground">Sem categoria</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell className={`font-medium ${transaction.type === 'income' ? 'text-finance-green' : 'text-finance-red'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditClick(transaction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Transaction Form */}
      <TransactionForm 
        isOpen={isTransactionFormOpen} 
        onOpenChange={setIsTransactionFormOpen} 
        editTransaction={editingTransaction} 
      />
    </div>
  );
};

export default Transactions;
