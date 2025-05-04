
import React from "react";
import { Package, BarChart, AlertTriangle, ArrowUpDown } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LowStockAlert } from "@/components/dashboard/LowStockAlert";
import { RecentMovements } from "@/components/dashboard/RecentMovements";
import { AppLayout } from "@/components/layout/AppLayout";
import { formatCurrency } from "@/lib/utils";
import { useDashboard } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardPage: React.FC = () => {
  const { stats, lowStockProducts, recentMovements, isLoading } = useDashboard();

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
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-6 bg-white rounded-lg shadow">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-8 w-20 mb-3" />
                  <Skeleton className="h-5 w-28" />
                </div>
              ))}
            </>
          ) : (
            <>
              <StatsCard
                title="Total de Produtos"
                value={stats?.totalProducts || 0}
                icon={<Package size={24} />}
                trend={{ value: 12, isPositive: true }}
              />
              <StatsCard
                title="Produtos com Baixo Estoque"
                value={stats?.lowStockProducts || 0}
                icon={<AlertTriangle size={24} />}
                trend={{ value: 5, isPositive: false }}
              />
              <StatsCard
                title="Valor Total em Estoque"
                value={formatCurrency(stats?.totalValue || 0)}
                icon={<BarChart size={24} />}
              />
              <StatsCard
                title="Movimentações Recentes"
                value={stats?.recentMovementsCount || 0}
                icon={<ArrowUpDown size={24} />}
                trend={{ value: 8, isPositive: true }}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            <>
              <div className="p-6 bg-white rounded-lg shadow space-y-4">
                <Skeleton className="h-6 w-44 mb-4" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between border-b pb-3">
                      <div>
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow space-y-4">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between border-b pb-3">
                      <div className="flex items-center">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="ml-3">
                          <Skeleton className="h-5 w-32 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <div>
                        <Skeleton className="h-5 w-16 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <LowStockAlert products={lowStockProducts || []} />
              <RecentMovements movements={recentMovements || []} />
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
