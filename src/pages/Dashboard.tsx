import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatCard from '@/components/StatCard';
import BudgetProgress from '@/components/BudgetProgress';
import { formatCurrency, formatMonth } from '@/lib/locale';
import { useFinance } from '@/context/FinanceContext';
import { Wallet, TrendingUp, TrendingDown, Plus, DollarSign, BanknoteIcon, ArrowLeft, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { addMonths, subMonths } from 'date-fns';
import TransactionForm from '@/components/TransactionForm';
import { useNavigate } from 'react-router-dom';

const tooltipStyle = {
  backgroundColor: 'hsl(var(--background))',
  borderRadius: '8px',
  border: '1px solid hsl(var(--border))',
  color: 'hsl(var(--foreground))',
};

const Dashboard = () => {
  const {
    totalBalance,
    monthlyExpenses,
    monthlyIncome,
    currentMonth,
    setCurrentMonth,
    expensesByCategory,
    budgetStatus,
    categories
  } = useFinance();

  const navigate = useNavigate();

  // Add state for transaction dialog
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  
  // Calculate total income and expenses for the month
  const totalMonthlyExpenses = monthlyExpenses.reduce((sum, t) => sum + t.amount, 0);
  const totalMonthlyIncome = monthlyIncome.reduce((sum, t) => sum + t.amount, 0);
  
  // Prepare data for pie chart
  const pieChartData = Object.entries(expensesByCategory)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => {
      const category = categories.find(c => c.name === name);
      return {
        name,
        value,
        color: category?.color || '#1A73E8'
      };
    });

  // Function to move to previous/next month
  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Prepare recent transactions data (last 5)
  const recentTransactions = [...monthlyExpenses, ...monthlyIncome]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  // Prepare data for bar chart (last 3 months of expenses by category)
  const barChartData = Object.entries(expensesByCategory)
    .filter(([_, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button className="hidden sm:flex" onClick={() => setIsTransactionFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </div>
      
      {/* Month selector */}
      <div className="flex items-center justify-center space-x-4 my-4">
        <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-medium capitalize">{formatMonth(currentMonth)}</h2>
        <Button variant="outline" size="icon" onClick={goToNextMonth}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Key Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Saldo Total"
          value={formatCurrency(totalBalance)}
          icon={Wallet}
          variant={totalBalance >= 0 ? 'success' : 'error'}
        />
        <StatCard
          title="Receitas do Mês"
          value={formatCurrency(totalMonthlyIncome)}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Despesas do Mês"
          value={formatCurrency(totalMonthlyExpenses)}
          icon={TrendingDown}
          variant="error"
        />
      </div>
      
      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="budgets">Orçamentos</TabsTrigger>
          <TabsTrigger value="analysis">Análise</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {pieChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)} 
                          contentStyle={tooltipStyle}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">Sem dados para exibir</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((transaction) => {
                      const category = categories.find(c => c.id === transaction.categoryId);
                      return (
                        <div key={transaction.id} className="flex items-center">
                          <div className={`mr-4 rounded-full p-2 ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {transaction.type === 'income' ? (
                              <BanknoteIcon className="h-4 w-4 text-finance-green" />
                            ) : (
                              <DollarSign className="h-4 w-4 text-finance-red" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">{category?.name || 'Sem categoria'}</p>
                          </div>
                          <div className={`ml-auto font-medium ${transaction.type === 'income' ? 'text-finance-green' : 'text-finance-red'}`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">Sem transações recentes</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Budgets Tab */}
        <TabsContent value="budgets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {budgetStatus.map((budget) => (
              <Card key={budget.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {budget.category?.name || 'Orçamento'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BudgetProgress
                    category=""
                    spent={budget.spent}
                    total={budget.amount}
                    color={budget.category?.color || '#00A86B'}
                  />
                </CardContent>
              </Card>
            ))}
            
            {budgetStatus.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium">Nenhum orçamento definido</h3>
                    <p className="text-muted-foreground mt-2">
                      Crie orçamentos para categorias de despesas para acompanhar seus gastos.
                    </p>
                    <Button className="mt-4" onClick={() => navigate('/budgets')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Orçamento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Principais Categorias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {barChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis
                        tickFormatter={(value) => formatCurrency(value).replace('R$', '')}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={tooltipStyle}
                      />
                      <Bar dataKey="value" fill="#00A86B" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">Sem dados para exibir</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Balanço Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Receitas</span>
                    <span className="text-finance-green font-medium">{formatCurrency(totalMonthlyIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Despesas</span>
                    <span className="text-finance-red font-medium">{formatCurrency(totalMonthlyExpenses)}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="font-bold">Saldo</span>
                    <span 
                      className={`font-bold ${(totalMonthlyIncome - totalMonthlyExpenses) >= 0 ? 'text-finance-green' : 'text-finance-red'}`}
                    >
                      {formatCurrency(totalMonthlyIncome - totalMonthlyExpenses)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total de Transações</span>
                    <span className="font-medium">{monthlyExpenses.length + monthlyIncome.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Média de Despesas</span>
                    <span className="font-medium">
                      {monthlyExpenses.length > 0 
                        ? formatCurrency(totalMonthlyExpenses / monthlyExpenses.length) 
                        : formatCurrency(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Maior Despesa</span>
                    <span className="font-medium">
                      {monthlyExpenses.length > 0 
                        ? formatCurrency(Math.max(...monthlyExpenses.map(t => t.amount))) 
                        : formatCurrency(0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Transaction Form */}
      <TransactionForm 
        isOpen={isTransactionFormOpen} 
        onOpenChange={setIsTransactionFormOpen} 
      />
    </div>
  );
};

export default Dashboard;
