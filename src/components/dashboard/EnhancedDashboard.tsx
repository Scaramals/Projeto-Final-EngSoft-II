
import React, { useRef, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOptimizedDashboard } from "@/hooks/useOptimizedDashboard";
import { formatCurrency } from "@/lib/utils";
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle, 
  DollarSign,
  BarChart3,
  Activity,
  ShoppingCart
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export const EnhancedDashboard: React.FC = () => {
  const { stats, movementsSummary, categoryAnalysis, isLoading } = useOptimizedDashboard();
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Memoize chart data for performance
  const chartData = useMemo(() => {
    if (!movementsSummary) return [];
    return movementsSummary.slice(0, 7).reverse().map((item) => ({
      date: new Date(item.movement_date).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      }),
      entradas: Number(item.total_in) || 0,
      saidas: Number(item.total_out) || 0,
      saldo: (Number(item.total_in) || 0) - (Number(item.total_out) || 0),
    }));
  }, [movementsSummary]);

  const categoryChartData = useMemo(() => {
    if (!categoryAnalysis) return [];
    return categoryAnalysis.map((item, index) => ({
      name: item.category_name || 'Sem categoria',
      value: Number(item.total_value) || 0,
      products: item.product_count || 0,
      fill: `hsl(${(index * 137) % 360}, 70%, 60%)`,
    }));
  }, [categoryAnalysis]);

  const totalMovements = useMemo(() => {
    if (!movementsSummary) return { in: 0, out: 0 };
    return movementsSummary.reduce((acc, item) => ({
      in: acc.in + (Number(item.total_in) || 0),
      out: acc.out + (Number(item.total_out) || 0),
    }), { in: 0, out: 0 });
  }, [movementsSummary]);

  if (isLoading) {
    return (
      <div ref={dashboardRef} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={dashboardRef} className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(stats?.totalProducts) || 0}</div>
            <Badge variant="secondary" className="mt-1">
              Cadastrados
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor do Estoque</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(Number(stats?.totalValue) || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              Total investido
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {Number(stats?.lowStockProducts) || 0}
            </div>
            <Progress 
              value={((Number(stats?.lowStockProducts) || 0) / (Number(stats?.totalProducts) || 1)) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimentações</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMovements.in + totalMovements.out}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              {totalMovements.in} entradas
              <TrendingDown className="h-3 w-3 ml-2 mr-1 text-red-500" />
              {totalMovements.out} saídas
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="movements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>
        
        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Movimentações dos Últimos 7 Dias</CardTitle>
              <CardDescription>
                Acompanhe as entradas e saídas de estoque diariamente
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [value, name === 'entradas' ? 'Entradas' : name === 'saidas' ? 'Saídas' : 'Saldo']}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Bar dataKey="entradas" fill="#22c55e" name="entradas" />
                  <Bar dataKey="saidas" fill="#ef4444" name="saidas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
                <CardDescription>
                  Valor total por categoria de produto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhes das Categorias</CardTitle>
                <CardDescription>
                  Produtos e valores por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryChartData.slice(0, 5).map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: category.fill }}
                        />
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {category.products} produtos
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {formatCurrency(category.value)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Saldo</CardTitle>
              <CardDescription>
                Evolução do saldo de movimentações (entradas - saídas)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [value, 'Saldo']}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="saldo" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
