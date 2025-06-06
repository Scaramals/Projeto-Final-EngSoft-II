
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
    metrics, 
    stockMovements, 
    categoryDistribution, 
    lowStockProducts,
    isLoading 
  } = useOptimizedDashboard();
  
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Sample data for additional charts - you can replace with real data
  const monthlyTrends = [
    { month: 'Jan', entrada: 1200, saida: 800, valor: 45000 },
    { month: 'Fev', entrada: 1100, saida: 900, valor: 52000 },
    { month: 'Mar', entrada: 1300, saida: 750, valor: 48000 },
    { month: 'Abr', entrada: 1400, saida: 850, valor: 61000 },
    { month: 'Mai', entrada: 1250, saida: 920, valor: 55000 },
    { month: 'Jun', entrada: 1350, saida: 780, valor: 58000 },
  ];

  const stockLevels = [
    { status: 'Adequado', count: metrics?.adequateStock || 0, color: COLORS.secondary },
    { status: 'Baixo', count: metrics?.lowStock || 0, color: COLORS.warning },
    { status: 'Crítico', count: metrics?.criticalStock || 0, color: COLORS.danger },
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
          value={metrics?.totalProducts || 0}
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
          value={formatCurrency(metrics?.totalStockValue || 0)}
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
          value={metrics?.lowStock || 0}
          description="Necessitam reposição"
          icon={AlertTriangle}
          badge={{
            text: "Atenção",
            variant: "destructive"
          }}
        />
        
        <MetricsCard
          title="Movimentações Hoje"
          value={metrics?.todayMovements || 0}
          description="Entradas e saídas"
          icon={TrendingUp}
          trend={{
            value: 15,
            isPositive: true,
            label: "vs ontem"
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
              Tendências Mensais
            </CardTitle>
            <CardDescription>
              Comparativo de entradas vs saídas por mês
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

        {/* Value Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Evolução do Valor do Estoque
            </CardTitle>
            <CardDescription>
              Valor total do estoque ao longo dos meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Valor do Estoque']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="valor" 
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
            Últimas {stockMovements?.length || 0} movimentações de estoque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stockMovements?.slice(0, 5).map((movement, index) => (
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
