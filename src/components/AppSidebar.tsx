
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarTrigger,
} from '@/components/ui/sidebar';

import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  PieChart,
  Goal,
  Settings,
  HelpCircle,
  Info,
  Tag,
} from 'lucide-react';

const AppSidebar = () => {
  const location = useLocation();
  
  // Main navigation items
  const mainNavItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Transações',
      path: '/transactions',
      icon: Receipt,
    },
    {
      name: 'Contas',
      path: '/accounts',
      icon: CreditCard,
    },
    {
      name: 'Categorias',
      path: '/categories',
      icon: Tag,
    },
    {
      name: 'Orçamentos',
      path: '/budgets',
      icon: Goal,
    },
    {
      name: 'Relatórios',
      path: '/reports',
      icon: PieChart,
    },
  ];
  
  // Settings and help items
  const utilityNavItems = [
    {
      name: 'Configurações',
      path: '/settings',
      icon: Settings,
    },
    {
      name: 'Ajuda',
      path: '/help',
      icon: HelpCircle,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-6 w-6 text-finance-green" />
          <span className="text-xl font-bold">FinançasBR</span>
        </div>
        <SidebarTrigger className="md:hidden" />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild>
                  <Link
                    to={item.path}
                    className={location.pathname === item.path ? 'active' : ''}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Utilitários</SidebarGroupLabel>
          <SidebarMenu>
            {utilityNavItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild>
                  <Link
                    to={item.path}
                    className={location.pathname === item.path ? 'active' : ''}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">v1.0.0</span>
          </div>
          <span className="text-xs text-muted-foreground">FinançasBR</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
