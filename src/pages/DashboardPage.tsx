
import React from "react";
import { Package, BarChart, AlertTriangle, ArrowUpDown } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LowStockAlert } from "@/components/dashboard/LowStockAlert";
import { RecentMovements } from "@/components/dashboard/RecentMovements";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  generateMockProducts, 
  generateMockDashboardStats, 
  formatCurrency 
} from "@/lib/utils";

const DashboardPage: React.FC = () => {
  // This would be replaced by real data fetching from Supabase
  const stats = generateMockDashboardStats();
  const lowStockProducts = generateMockProducts(3).map(p => ({
    ...p,
    quantity: Math.floor(Math.random() * 5)
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu estoque e operações
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Produtos"
            value={stats.totalProducts}
            icon={<Package size={24} />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Produtos com Baixo Estoque"
            value={stats.lowStockProducts}
            icon={<AlertTriangle size={24} />}
            trend={{ value: 5, isPositive: false }}
          />
          <StatsCard
            title="Valor Total em Estoque"
            value={formatCurrency(stats.totalValue)}
            icon={<BarChart size={24} />}
          />
          <StatsCard
            title="Movimentações Recentes"
            value={stats.recentMovements.length}
            icon={<ArrowUpDown size={24} />}
            trend={{ value: 8, isPositive: true }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LowStockAlert products={lowStockProducts} />
          <RecentMovements movements={stats.recentMovements} />
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
