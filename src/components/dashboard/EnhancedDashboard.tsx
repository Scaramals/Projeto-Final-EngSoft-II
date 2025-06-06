
import React, { useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsCard } from "./MetricsCard";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { TrendingUp, Package, DollarSign, AlertTriangle, Users, Boxes } from "lucide-react";
import { useOptimizedDashboard } from "@/hooks/useOptimizedDashboard";
import { useDashboard } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  indigo: '#6366f1'
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.warning, COLORS.danger, COLORS.purple, COLORS.indigo];

export const EnhancedDashboard: React.FC = () => {
  const { 
    stats, 
    movementsSummary, 
    categoryAnalysis, 
    isLoading 
  } = useOptimizedDashboard();
  
  const { recentMovements } = useDashboard();
  
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Transform data for charts
  const monthlyTrends = movementsSummary?.slice(0, 6).reverse().map(item => ({
    month: new Date(item.movement_date).toLocaleDateString('pt-BR', { month: 'short' }),
    entrada: item.total_in,
    saida: item.total_out,
    valor: Math.random() * 60000 + 40000 // Sample data - replace with real value calculation
  })) || [];

  const categoryDistribution = categoryAnalysis?.map(item => ({
    category: item.category_name,
    count: item.product_count,
    value: item.total_value
  })) || [];

  const stockLevels = [
    { status: 'Adequado', count: Math.max(0, (stats?.totalProducts || 0) - (stats?.lowStockProducts || 0)), color: COLORS.secondary },
    { status: 'Baixo', count: stats?.lowStockProducts || 0, color: COLORS.warning },
    { status: 'Crítico', count: Math.floor((stats?.lowStockProducts || 0) * 0.3), color: COLORS.danger },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={dashboardRef} className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Total de Produtos"
          value={stats?.totalProducts || 0}
          description="Produtos cadastrados"
          icon={Package}
          trend={{
            value: 12,
            isPositive: true,
            label: "último mês"
          }}
        />
        
        <MetricsCard
          title="Valor Total do Estoque"
          value={formatCurrency(stats?.totalValue || 0)}
          description="Valor total em produtos"
          icon={DollarSign}
          trend={{
            value: 8.5,
            isPositive: true,
            label: "último mês"
          }}
        />
        
        <MetricsCard
          title="Produtos com Estoque Baixo"
          value={stats?.lowStockProducts || 0}
          description="Necessitam reposição"
          icon={AlertTriangle}
          badge={{
            text: "Atenção",
            variant: "destructive"
          }}
        />
        
        <MetricsCard
          title="Movimentações Recentes"
          value={stats?.recentMovementsCount || 0}
          description="Últimos 30 dias"
          icon={TrendingUp}
          trend={{
            value: 15,
            isPositive: true,
            label: "vs mês anterior"
          }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendências de Movimentação
            </CardTitle>
            <CardDescription>
              Entradas vs saídas nos últimos dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="entrada" 
                    stackId="1"
                    stroke={COLORS.secondary} 
                    fill={COLORS.secondary}
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="saida" 
                    stackId="1"
                    stroke={COLORS.danger} 
                    fill={COLORS.danger}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Stock Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5" />
              Distribuição do Estoque
            </CardTitle>
            <CardDescription>
              Status atual dos produtos em estoque
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockLevels}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count, percent }) => 
                      `${status}: ${count} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stockLevels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produtos por Categoria
            </CardTitle>
            <CardDescription>
              Distribuição de produtos nas diferentes categorias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryDistribution} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Value by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Valor por Categoria
            </CardTitle>
            <CardDescription>
              Valor total do estoque por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={categoryDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Valor Total']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={COLORS.purple} 
                    strokeWidth={3}
                    dot={{ fill: COLORS.purple, strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Movements */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentações Recentes</CardTitle>
          <CardDescription>
            Últimas {recentMovements?.length || 0} movimentações de estoque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMovements?.slice(0, 5).map((movement, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    movement.type === 'in' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium">{movement.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {movement.type === 'in' ? 'Entrada' : 'Saída'} de {movement.quantity} unidades
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {new Date(movement.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
