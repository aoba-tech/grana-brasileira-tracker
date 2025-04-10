
import React from 'react';
import { formatCurrency, formatDate } from '@/lib/locale';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import CategoryBadge from '@/components/CategoryBadge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight, Trash2, Edit } from 'lucide-react';

interface TransactionTableProps {
  transactions: any[];
  categories: any[];
  onEdit: (transaction: any) => void;
  onDelete: (id: number) => void;
}

const TransactionTable = ({ 
  transactions, 
  categories, 
  onEdit, 
  onDelete 
}: TransactionTableProps) => {
  return (
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
          {transactions.length > 0 ? (
            transactions.map((transaction) => {
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
                        onClick={() => onEdit(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDelete(transaction.id)}
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
  );
};

export default TransactionTable;
