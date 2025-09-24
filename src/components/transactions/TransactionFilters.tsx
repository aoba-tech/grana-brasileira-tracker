
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, ListFilter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface TransactionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  transactionType: 'all' | 'expense' | 'income';
  onTransactionTypeChange: (value: 'all' | 'expense' | 'income') => void;
  accounts: Array<{ id: number; name: string }>;
  selectedAccountIds: number[];
  onAccountSelectionChange: (accountId: number, isSelected: boolean) => void;
  onClearAccountFilters: () => void;
}

const TransactionFilters = ({
  searchTerm,
  onSearchChange,
  transactionType,
  onTransactionTypeChange,
  accounts,
  selectedAccountIds,
  onAccountSelectionChange,
  onClearAccountFilters
}: TransactionFiltersProps) => {
  const selectedAccounts = accounts.filter(account =>
    selectedAccountIds.includes(account.id)
  );

  let accountFilterLabel = 'Todas as contas';

  if (selectedAccounts.length === 1) {
    accountFilterLabel = selectedAccounts[0].name;
  } else if (selectedAccounts.length > 1) {
    accountFilterLabel = `${selectedAccounts.length} contas`;
  }

  return (
    <div className="space-y-2 md:space-y-0 md:flex md:gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar transações..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <Select
          value={transactionType}
          onValueChange={(value) =>
            onTransactionTypeChange(value as 'all' | 'expense' | 'income')
          }
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 w-full justify-between md:w-auto md:justify-start"
            >
              <ListFilter className="h-4 w-4" />
              <span>{accountFilterLabel}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filtrar por conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {accounts.length === 0 && (
              <DropdownMenuItem disabled>Nenhuma conta disponível</DropdownMenuItem>
            )}
            {accounts.map(account => (
              <DropdownMenuCheckboxItem
                key={account.id}
                checked={selectedAccountIds.includes(account.id)}
                onCheckedChange={(checked) =>
                  onAccountSelectionChange(account.id, checked === true)
                }
              >
                {account.name}
              </DropdownMenuCheckboxItem>
            ))}
            {selectedAccountIds.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    onClearAccountFilters();
                  }}
                >
                  Limpar seleção
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="icon"
          className="self-start md:self-center md:ml-2"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TransactionFilters;
