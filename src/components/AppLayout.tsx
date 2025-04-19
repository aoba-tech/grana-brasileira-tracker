
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/10">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <nav className="sticky top-0 z-10 bg-background border-b h-14 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">Pila</h1>
            </div>
          </nav>
          <main className="flex-1 overflow-y-auto py-6 px-4 md:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
