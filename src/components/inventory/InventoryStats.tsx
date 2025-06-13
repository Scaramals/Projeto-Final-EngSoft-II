
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useStockMovements } from "@/hooks/useStockMovements";
import { Skeleton } from "@/components/ui/skeleton";

export const InventoryStats: React.FC = () => {
  const { products, loadingProducts } = useData();
  const { useRealtimeMovements } = useStockMovements();
  const { movements, isLoading: loadingMovements } = useRealtimeMovements(undefined, 100);

  // Calcular estatísticas
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.quantity <= (p.minimumStock || 5)).length;
  
  const recentMovements = movements.slice(0, 30); // Últimas 30 movimentações
  const inMovements = recentMovements.filter(m => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0);
  const outMovements = recentMovements.filter(m => m.type === 'out').reduce((sum, m) => sum + m.quantity, 0);

  const isLoading = loadingProducts || loadingMovements;

  const stats = [
    {
      title: "Total de Produtos",
      value: totalProducts,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Estoque Baixo",
      value: lowStockProducts,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Entradas (30 dias)",
      value: inMovements,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Saídas (30 dias)",
      value: outMovements,
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-md ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stat.value}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
