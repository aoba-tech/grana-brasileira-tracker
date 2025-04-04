
import { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { FileImportService } from '@/lib/importers/file-import.service';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ImportTransactionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImportTransactionDialog: React.FC<ImportTransactionDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const { accounts, categories, refreshData } = useFinance();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  
  // Filter categories to only show expense categories as defaults for imports
  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };
  
  const handleImport = async () => {
    if (!selectedFile || !selectedAccountId || !selectedCategoryId) {
      toast.error('Por favor, selecione um arquivo, uma conta e uma categoria padrão.');
      return;
    }
    
    try {
      setIsImporting(true);
      
      const result = await FileImportService.importOfxFile(
        selectedFile,
        parseInt(selectedAccountId),
        parseInt(selectedCategoryId)
      );
      
      if (result.success) {
        toast.success(`${result.count} transações importadas com sucesso!`);
        await refreshData();
        onOpenChange(false);
        resetForm();
      } else {
        toast.error(`Falha na importação: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Erro ao importar o arquivo.');
    } finally {
      setIsImporting(false);
    }
  };
  
  const resetForm = () => {
    setSelectedFile(null);
    setSelectedAccountId('');
    setSelectedCategoryId('');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Importar Transações</DialogTitle>
          <DialogDescription>
            Selecione um arquivo OFX/OFC para importar transações.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="file-upload" className="text-sm font-medium">
              Arquivo OFX/OFC
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".ofx,.ofc"
              onChange={handleFileChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {selectedFile && (
              <p className="text-xs text-muted-foreground">
                Arquivo selecionado: {selectedFile.name}
              </p>
            )}
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="account" className="text-sm font-medium">
              Conta
            </label>
            <Select
              value={selectedAccountId}
              onValueChange={setSelectedAccountId}
            >
              <SelectTrigger id="account">
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id?.toString() || ''}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="category" className="text-sm font-medium">
              Categoria Padrão
            </label>
            <Select
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione uma categoria padrão" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id?.toString() || ''}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              A categoria padrão será aplicada a todas as transações importadas.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={isImporting}>
            {isImporting ? 'Importando...' : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportTransactionDialog;
