
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileInput } from 'lucide-react';

interface TransactionHeaderProps {
  onAddClick: () => void;
  onImportClick: () => void;
}

const TransactionHeader = ({ onAddClick, onImportClick }: TransactionHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Transações</h1>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onImportClick}>
          <FileInput className="mr-2 h-4 w-4" />
          Importar OFX
        </Button>
        <Button onClick={onAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </div>
    </div>
  );
};

export default TransactionHeader;
