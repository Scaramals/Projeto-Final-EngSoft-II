
import React from "react";
import { Package, BarChart, AlertTriangle, ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { DashboardStats } from "@/types";

interface DashboardMetricsProps {
  isLoading: boolean;
  dashboardStats: DashboardStats | null;
  monthlyComparison: any;
  lowStockCount: number;
  productsLength: number;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  isLoading,
  dashboardStats,
  monthlyComparison,
  lowStockCount,
  productsLength
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      <MetricsCard
        title="Total de Produtos"
        value={Number(dashboardStats?.totalProducts) || productsLength}
        description="Produtos cadastrados"
        icon={Package}
        trend={{
          value: monthlyComparison?.movementsGrowth || 0,
          isPositive: (monthlyComparison?.movementsGrowth || 0) >= 0,
          label: "vs mês anterior"
        }}
      />
      
      <MetricsCard
        title="Estoque Baixo"
        value={lowStockCount || 0}
        description="Necessitam reposição"
        icon={AlertTriangle}
        badge={{
          text: "Atenção",
          variant: "destructive"
        }}
      />
      
      <MetricsCard
        title="Valor Total"
        value={formatCurrency(Number(dashboardStats?.totalValue) || 0)}
        description="Valor em estoque"
        icon={BarChart}
        trend={{
          value: Math.abs(monthlyComparison?.entriesGrowth || 0),
          isPositive: (monthlyComparison?.entriesGrowth || 0) >= 0,
          label: "vs mês anterior"
        }}
      />
      
      <MetricsCard
        title="Movimentações"
        value={Number(dashboardStats?.recentMovementsCount) || 0}
        description="Últimos 30 dias"
        icon={ArrowUpDown}
        trend={{
          value: Math.abs(monthlyComparison?.movementsGrowth || 0),
          isPositive: (monthlyComparison?.movementsGrowth || 0) >= 0,
          label: "vs mês anterior"
        }}
      />
    </div>
  );
};
