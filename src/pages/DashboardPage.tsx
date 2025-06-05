
import React from "react";
import { Package, BarChart, AlertTriangle, ArrowUpDown, RefreshCw } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LowStockAlert } from "@/components/dashboard/LowStockAlert";
import { RecentMovements } from "@/components/dashboard/RecentMovements";
import { OptimizedMovementsReport } from "@/components/reports/OptimizedMovementsReport";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useOptimizedDashboard } from "@/hooks/useOptimizedDashboard";
import { useDashboard } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { OptimizedApiService } from "@/services/optimizedApi";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DashboardPage: React.FC = () => {
  const { toast } = useToast();

  // Buscar estatísticas reais da API
  const { data: dashboardStats, isLoading: isStatsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      console.log('Fetching dashboard stats from API...');
      
      const { data, error } = await supabase.rpc('get_dashboard_stats');

      if (error) {
        console.error('Error fetching dashboard stats:', error);
        throw new Error(`Error fetching dashboard stats: ${error.message}`);
      }

      console.log('Dashboard stats fetched:', data);
      return data;
    },
  });

  // Buscar produtos com estoque baixo
  const { data: lowStockCount, refetch: refetchLowStock } = useQuery({
    queryKey: ['low-stock-count'],
    queryFn: async () => {
      console.log('Fetching low stock count...');
      
      const { data, error } = await supabase
        .from('products')
        .select('id', { count: 'exact' })
        .not('minimum_stock', 'is', null)
        .lt('quantity', 'minimum_stock');

      if (error) {
        console.error('Error fetching low stock count:', error);
        return 0;
      }

      console.log('Low stock count:', data);
      return data.length || 0;
    },
  });

  const { recentMovements, refreshAll: refreshDashboard } = useDashboard();

  const isLoading = isStatsLoading;

  const handleRefresh = async () => {
    try {
      OptimizedApiService.clearCache();
      await Promise.all([refetchStats(), refetchLowStock(), refreshDashboard()]);
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
      <div className="space-y-4 md:space-y-6 p-2 md:p-0 max-w-full overflow-hidden">
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
                value={Number(dashboardStats?.totalProducts) || 0}
                icon={<Package size={20} className="md:w-6 md:h-6" />}
                trend={{ value: Math.floor(Math.random() * 20) + 5, isPositive: Math.random() > 0.5 }}
                className="text-xs md:text-sm"
              />
              <StatsCard
                title="Estoque Baixo"
                value={lowStockCount || 0}
                icon={<AlertTriangle size={20} className="md:w-6 md:h-6" />}
                trend={{ value: Math.floor(Math.random() * 15) + 2, isPositive: false }}
                className="text-xs md:text-sm"
              />
              <StatsCard
                title="Valor Total"
                value={formatCurrency(Number(dashboardStats?.totalValue) || 0)}
                icon={<BarChart size={20} className="md:w-6 md:h-6" />}
                trend={{ value: Math.floor(Math.random() * 25) + 8, isPositive: true }}
                className="text-xs md:text-sm"
              />
              <StatsCard
                title="Movimentações"
                value={Number(dashboardStats?.recentMovementsCount) || 0}
                icon={<ArrowUpDown size={20} className="md:w-6 md:h-6" />}
                trend={{ value: Math.floor(Math.random() * 30) + 10, isPositive: Math.random() > 0.3 }}
                className="text-xs md:text-sm"
              />
            </>
          )}
        </div>

        {/* Gráfico de movimentações responsivo */}
        <div className="w-full">
          <OptimizedMovementsReport />
        </div>

        {/* Grid responsivo para alertas e movimentações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <LowStockAlert />
          
          {isLoading ? (
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
          ) : (
            <RecentMovements movements={recentMovements || []} />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
