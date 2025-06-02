
import React from "react";
import { Package, BarChart, AlertTriangle, ArrowUpDown, RefreshCw } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LowStockAlert } from "@/components/dashboard/LowStockAlert";
import { RecentMovements } from "@/components/dashboard/RecentMovements";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useOptimizedDashboard } from "@/hooks/useOptimizedDashboard";
import { useDashboard } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { OptimizedApiService } from "@/services/optimizedApi";
import { useToast } from "@/components/ui/use-toast";

const DashboardPage: React.FC = () => {
  const { stats, isLoading, refreshAll } = useOptimizedDashboard();
  const { lowStockProducts, recentMovements } = useDashboard();
  const { toast } = useToast();

  const handleRefresh = async () => {
    try {
      OptimizedApiService.clearCache();
      await refreshAll();
      toast({
        title: "Dashboard atualizado",
        description: "Os dados foram atualizados com sucesso!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados. Tente novamente.",
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 md:space-y-6 p-2 md:p-0">
        {/* Header responsivo */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Visão geral do seu estoque e operações
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={isLoading}
            size="sm"
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Cards de estatísticas responsivos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 md:p-6 bg-white rounded-lg shadow">
                  <Skeleton className="h-4 md:h-6 w-24 md:w-32 mb-2" />
                  <Skeleton className="h-6 md:h-8 w-16 md:w-20 mb-3" />
                  <Skeleton className="h-3 md:h-5 w-20 md:w-28" />
                </div>
              ))}
            </>
          ) : (
            <>
              <StatsCard
                title="Total de Produtos"
                value={Number(stats?.totalProducts) || 0}
                icon={<Package size={20} className="md:w-6 md:h-6" />}
                trend={{ value: 12, isPositive: true }}
                className="text-xs md:text-sm"
              />
              <StatsCard
                title="Estoque Baixo"
                value={Number(stats?.lowStockProducts) || 0}
                icon={<AlertTriangle size={20} className="md:w-6 md:h-6" />}
                trend={{ value: 5, isPositive: false }}
                className="text-xs md:text-sm"
              />
              <StatsCard
                title="Valor Total"
                value={formatCurrency(Number(stats?.totalValue) || 0)}
                icon={<BarChart size={20} className="md:w-6 md:h-6" />}
                className="text-xs md:text-sm"
              />
              <StatsCard
                title="Movimentações"
                value={Number(stats?.recentMovementsCount) || 0}
                icon={<ArrowUpDown size={20} className="md:w-6 md:h-6" />}
                trend={{ value: 8, isPositive: true }}
                className="text-xs md:text-sm"
              />
            </>
          )}
        </div>

        {/* Grid responsivo para alertas e movimentações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {isLoading ? (
            <>
              <div className="p-4 md:p-6 bg-white rounded-lg shadow space-y-4">
                <Skeleton className="h-5 md:h-6 w-36 md:w-44 mb-4" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between border-b pb-3">
                      <div>
                        <Skeleton className="h-4 md:h-5 w-24 md:w-32 mb-2" />
                        <Skeleton className="h-3 md:h-4 w-20 md:w-24" />
                      </div>
                      <Skeleton className="h-6 md:h-8 w-16 md:w-24" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 md:p-6 bg-white rounded-lg shadow space-y-4">
                <Skeleton className="h-5 md:h-6 w-40 md:w-48 mb-4" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between border-b pb-3">
                      <div className="flex items-center">
                        <Skeleton className="h-6 md:h-8 w-6 md:w-8 rounded-full" />
                        <div className="ml-3">
                          <Skeleton className="h-4 md:h-5 w-24 md:w-32 mb-1" />
                          <Skeleton className="h-3 md:h-4 w-20 md:w-24" />
                        </div>
                      </div>
                      <div>
                        <Skeleton className="h-4 md:h-5 w-12 md:w-16 mb-1" />
                        <Skeleton className="h-3 md:h-4 w-16 md:w-24" />
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
