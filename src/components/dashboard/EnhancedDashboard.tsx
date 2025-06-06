
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useOptimizedDashboard } from "@/hooks/useOptimizedDashboard";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { TrendingUp, TrendingDown, Package, AlertTriangle } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const EnhancedDashboard: React.FC = () => {
  const { 
    stats, 
    movementsSummary, 
    categoryAnalysis, 
    monthlyTrends,
    monthlyComparison,
    isLoading 
  } = useOptimizedDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  // Transform data for charts
  const movementsChartData = movementsSummary?.slice(0, 7).reverse().map(item => ({
    date: new Date(item.movement_date).toLocaleDateString('pt-BR'),
    entradas: item.total_in,
    saidas: item.total_out,
    liquido: item.net_movement
  })) || [];

  const categoryChartData = categoryAnalysis?.map(item => ({
    name: item.category_name,
    value: Number(item.total_value),
    products: Number(item.product_count)
  })) || [];

  const monthlyTrendsData = monthlyTrends?.slice(-6).map(item => ({
    month: new Date(item.month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
    entradas: item.totalIn,
    saidas: item.totalOut,
    liquido: item.net
  })) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Movimentações Recentes */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Movimentações dos Últimos 7 Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={movementsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="entradas" 
                  stroke="#00C49F" 
                  strokeWidth={2}
                  name="Entradas"
                />
                <Line 
                  type="monotone" 
                  dataKey="saidas" 
                  stroke="#FF8042" 
                  strokeWidth={2}
                  name="Saídas"
                />
                <Line 
                  type="monotone" 
                  dataKey="liquido" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                  name="Líquido"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Análise por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Valor']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tendência Mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="entradas" fill="#00C49F" name="Entradas" />
                <Bar dataKey="saidas" fill="#FF8042" name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Resumo de Performance */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Resumo de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Entradas este mês</span>
                <div className="flex items-center gap-1">
                  {monthlyComparison?.entriesGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ${
                    monthlyComparison?.entriesGrowth >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {Math.abs(monthlyComparison?.entriesGrowth || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
              <Progress value={Math.min(Math.abs(monthlyComparison?.entriesGrowth || 0), 100)} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Saídas este mês</span>
                <div className="flex items-center gap-1">
                  {monthlyComparison?.exitsGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  )}
                  <span className={`text-sm ${
                    monthlyComparison?.exitsGrowth >= 0 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {Math.abs(monthlyComparison?.exitsGrowth || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
              <Progress value={Math.min(Math.abs(monthlyComparison?.exitsGrowth || 0), 100)} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Movimentações totais</span>
                <div className="flex items-center gap-1">
                  {monthlyComparison?.movementsGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="text-sm text-blue-500">
                    {Math.abs(monthlyComparison?.movementsGrowth || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
              <Progress value={Math.min(Math.abs(monthlyComparison?.movementsGrowth || 0), 100)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas de Categoria */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Análise de Categorias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryAnalysis?.slice(0, 5).map((category, index) => (
              <div key={category.category_name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="font-medium">{category.category_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.product_count} produtos • {category.total_quantity} unidades
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  R$ {Number(category.total_value).toLocaleString('pt-BR')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
