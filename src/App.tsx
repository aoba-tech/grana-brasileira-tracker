
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinanceProvider } from "@/context/FinanceContext";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Accounts from "@/pages/Accounts";
import Budgets from "@/pages/Budgets";
import Reports from "@/pages/Reports";
import Categories from "@/pages/Categories";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FinanceProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              }
            />
            <Route
              path="/transactions"
              element={
                <AppLayout>
                  <Transactions />
                </AppLayout>
              }
            />
            <Route
              path="/accounts"
              element={
                <AppLayout>
                  <Accounts />
                </AppLayout>
              }
            />
            <Route
              path="/categories"
              element={
                <AppLayout>
                  <Categories />
                </AppLayout>
              }
            />
            <Route
              path="/budgets"
              element={
                <AppLayout>
                  <Budgets />
                </AppLayout>
              }
            />
            <Route
              path="/reports"
              element={
                <AppLayout>
                  <Reports />
                </AppLayout>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </FinanceProvider>
  </QueryClientProvider>
);

export default App;
