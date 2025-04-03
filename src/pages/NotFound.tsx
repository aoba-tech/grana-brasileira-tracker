
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/10 px-4">
      <h1 className="text-9xl font-bold text-finance-green">404</h1>
      <h2 className="text-2xl font-medium mt-4 mb-6">Página não encontrada</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Button asChild>
        <Link to="/">Voltar para o Dashboard</Link>
      </Button>
    </div>
  );
};

export default NotFound;
