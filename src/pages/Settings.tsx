
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, Database, FileJson } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();

  const handleExportData = () => {
    // This would be implemented to export all data
    toast({
      title: "Exportação de dados",
      description: "Esta funcionalidade será implementada em breve."
    });
  };

  const handleImportData = () => {
    // This would be implemented to import all data
    toast({
      title: "Importação de dados",
      description: "Esta funcionalidade será implementada em breve."
    });
  };

  const handleResetData = () => {
    // This would be implemented to reset the database
    toast({
      title: "Redefinir dados",
      description: "Esta funcionalidade será implementada em breve.",
      variant: "destructive"
    });
  };

  return (
    <div className="container max-w-5xl py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do seu aplicativo financeiro.
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Dados</CardTitle>
          <CardDescription>
            Gerencie seus dados financeiros, incluindo backup e restauração.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Button 
              variant="outline" 
              onClick={handleExportData}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar todos os dados
            </Button>
            <Button 
              variant="outline" 
              onClick={handleImportData}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Importar dados
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Base de dados</CardTitle>
          <CardDescription>
            Opções avançadas para gerenciar a base de dados local.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Button 
              variant="outline" 
              onClick={handleImportData}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Verificar base de dados
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleResetData}
              className="flex items-center gap-2"
            >
              <FileJson className="h-4 w-4" />
              Redefinir base de dados
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
