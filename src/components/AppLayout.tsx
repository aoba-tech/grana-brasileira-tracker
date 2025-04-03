
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
        <main className="flex-1 overflow-y-auto py-6 px-4 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
