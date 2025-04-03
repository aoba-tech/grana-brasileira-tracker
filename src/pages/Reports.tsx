
import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatMonth } from '@/lib/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { addMonths, subMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ArrowLeft, 
  ArrowRight, 
  Download, 
  ChevronDown,
  TrendingUp,
  TrendingDown 
} from 'lucide-react';

const Reports = () => {
  const { 
    transactions, 
    categories, 
    expensesByCategory, 
    currentMonth, 
    setCurrentMonth,
    monthlyExpenses,
    monthlyIncome
  } = useFinance();
  
  const [reportType, setReportType] = useState('expenses');
  
  // Calculate total income and expenses for the month
  const totalMonthlyExpenses = monthlyExpenses.reduce((sum, t) => sum + t.amount, 0);
  const totalMonthlyIncome = monthlyIncome.reduce((sum, t) => sum + t.amount, 0);
  
  // Function to move to previous/next month
  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  
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
  
  // Prepare data for bar chart (expenses by category)
  const barChartData = Object.entries(expensesByCategory)
    .filter(([_, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));
  
  // Generate months for line chart (6 months)
  const generateMonthsData = () => {
    const data = [];
    const endMonth = currentMonth;
    
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(endMonth, i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthName = format(month, 'MMM', { locale: ptBR });
      
      const monthExpenses = transactions.filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && 
               date >= monthStart && 
               date <= monthEnd;
      }).reduce((sum, t) => sum + t.amount, 0);
      
      const monthIncome = transactions.filter(t => {
        const date = new Date(t.date);
        return t.type === 'income' && 
               date >= monthStart && 
               date <= monthEnd;
      }).reduce((sum, t) => sum + t.amount, 0);
      
      data.push({
        month: monthName,
        expenses: monthExpenses,
        income: monthIncome,
        balance: monthIncome - monthExpenses
      });
    }
    
    return data;
  };
  
  // Line chart data (6 months)
  const lineChartData = generateMonthsData();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
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
      
      {/* Report Type Selector */}
      <div className="flex justify-center mb-6">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tipo de Relatório" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expenses">Despesas</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="balance">Balanço</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Report Tabs */}
      <Tabs defaultValue="chart" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chart">Gráficos</TabsTrigger>
          <TabsTrigger value="summary">Resumo</TabsTrigger>
        </TabsList>
        
        {/* Charts Tab */}
        <TabsContent value="chart" className="space-y-4">
          {reportType === 'expenses' && (
            <>
              <Card>
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
                            labelLine={true}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => formatCurrency(value)} 
                            contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
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
                  <CardTitle>Ranking de Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {barChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={barChartData}
                          layout="vertical"
                          margin={{
                            top: 20,
                            right: 30,
                            left: 70,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" tickFormatter={(value) => formatCurrency(value).replace('R$', '')} />
                          <YAxis dataKey="name" type="category" width={80} />
                          <Tooltip 
                            formatter={(value: number) => formatCurrency(value)} 
                            contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                          />
                          <Bar dataKey="value" fill="#E53935" />
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
            </>
          )}
          
          {reportType === 'income' && (
            <Card>
              <CardHeader>
                <CardTitle>Receitas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {/* Similar to expenses pie chart but for income categories */}
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categories
                        .filter(c => c.type === 'income')
                        .map(category => {
                          const incomeAmount = monthlyIncome
                            .filter(t => t.categoryId === category.id)
                            .reduce((sum, t) => sum + t.amount, 0);
                          return {
                            name: category.name,
                            value: incomeAmount,
                            color: category.color
                          };
                        })
                        .filter(cat => cat.value > 0)
                      }
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
                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                      <Bar dataKey="value" fill="#00A86B">
                        {categories
                          .filter(c => c.type === 'income')
                          .map((_, index) => (
                            <Cell key={`cell-${index}`} fill={categories.filter(c => c.type === 'income')[index]?.color || '#00A86B'} />
                          ))
                        }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
          
          {reportType === 'balance' && (
            <Card>
              <CardHeader>
                <CardTitle>Evolução Financeira</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={lineChartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value).replace('R$', '')} 
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)} 
                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#00A86B" 
                        activeDot={{ r: 8 }} 
                        name="Receitas"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke="#E53935" 
                        name="Despesas"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="balance" 
                        stroke="#1A73E8" 
                        strokeDasharray="5 5" 
                        name="Balanço"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-finance-green" />
                      <span className="font-medium">Receitas</span>
                    </div>
                    <span className="text-finance-green font-medium">{formatCurrency(totalMonthlyIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="h-4 w-4 text-finance-red" />
                      <span className="font-medium">Despesas</span>
                    </div>
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
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total de Transações</span>
                    <span className="font-medium">{monthlyExpenses.length + monthlyIncome.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Maior Despesa</span>
                    <span className="font-medium">
                      {monthlyExpenses.length > 0 
                        ? formatCurrency(Math.max(...monthlyExpenses.map(t => t.amount))) 
                        : formatCurrency(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Maior Receita</span>
                    <span className="font-medium">
                      {monthlyIncome.length > 0 
                        ? formatCurrency(Math.max(...monthlyIncome.map(t => t.amount))) 
                        : formatCurrency(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Taxa de Economia</span>
                    <span className="font-medium">
                      {totalMonthlyIncome > 0 
                        ? `${Math.round((1 - totalMonthlyExpenses / totalMonthlyIncome) * 100)}%` 
                        : '0%'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>
                {reportType === 'expenses' 
                  ? 'Categorias de Despesas' 
                  : reportType === 'income' 
                    ? 'Categorias de Receitas' 
                    : 'Todas as Categorias'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportType === 'expenses' || reportType === 'balance' ? (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Despesas por Categoria</h3>
                    <div className="space-y-2">
                      {Object.entries(expensesByCategory)
                        .filter(([_, value]) => value > 0)
                        .sort((a, b) => b[1] - a[1])
                        .map(([name, value]) => {
                          const category = categories.find(c => c.name === name);
                          return (
                            <div key={name} className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: category?.color || '#1A73E8' }} 
                                />
                                <span>{name}</span>
                              </div>
                              <span>{formatCurrency(value)}</span>
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>
                ) : null}
                
                {reportType === 'income' || reportType === 'balance' ? (
                  <div className={reportType === 'balance' ? 'mt-6' : ''}>
                    <h3 className="text-sm font-medium mb-2">Receitas por Categoria</h3>
                    <div className="space-y-2">
                      {categories
                        .filter(c => c.type === 'income')
                        .map(category => {
                          const incomeAmount = monthlyIncome
                            .filter(t => t.categoryId === category.id)
                            .reduce((sum, t) => sum + t.amount, 0);
                          return { category, amount: incomeAmount };
                        })
                        .filter(item => item.amount > 0)
                        .sort((a, b) => b.amount - a.amount)
                        .map(({ category, amount }) => (
                          <div key={category.id} className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: category.color }} 
                              />
                              <span>{category.name}</span>
                            </div>
                            <span>{formatCurrency(amount)}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
