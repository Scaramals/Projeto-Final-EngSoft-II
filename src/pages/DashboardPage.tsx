
import React from "react";
import { Package, BarChart, AlertTriangle, ArrowUpDown, RefreshCw } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { useOptimizedDashboard } from "@/hooks/useOptimizedDashboard";
import { useDashboard } from "@/hooks/useDashboard";
import { OptimizedApiService } from "@/services/optimizedApi";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats } from "@/types";
import { SecureLogger } from "@/services/secureLogger";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { EnhancedDashboard } from "@/components/dashboard/EnhancedDashboard";

const DashboardPage: React.FC = () => {
  const { toast } = useToast();
  const { refreshAll: refreshOptimized } = useOptimizedDashboard();

  // Buscar estatísticas reais da API com comparação mensal
  const { data: dashboardStats, isLoading: isStatsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      SecureLogger.info('Buscando estatísticas do dashboard');
      
      const { data, error } = await supabase.rpc('get_dashboard_stats');

      if (error) {
        SecureLogger.error('Erro ao buscar estatísticas do dashboard', error);
        throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
      }

      SecureLogger.success('Estatísticas do dashboard obtidas com sucesso');
      return data as unknown as DashboardStats;
    },
  });

  // Buscar dados de comparação mensal
  const { data: monthlyComparison, isLoading: isComparisonLoading } = useQuery({
    queryKey: ['monthly-comparison'],
    queryFn: async () => {
      SecureLogger.info('Buscando dados de comparação mensal');
      
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      // Buscar movimentações do mês atual
      const { data: currentData, error: currentError } = await supabase
        .from('stock_movements')
        .select('quantity, type')
        .gte('created_at', currentMonth.toISOString());

      // Buscar movimentações do mês passado
      const { data: lastData, error: lastError } = await supabase
        .from('stock_movements')
        .select('quantity, type')
        .gte('created_at', lastMonth.toISOString())
        .lt('created_at', currentMonth.toISOString());

      if (currentError || lastError) {
        throw new Error('Erro ao buscar dados de comparação');
      }

      const currentIn = currentData?.filter(m => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0) || 0;
      const currentOut = currentData?.filter(m => m.type === 'out').reduce((sum, m) => sum + m.quantity, 0) || 0;
      const lastIn = lastData?.filter(m => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0) || 0;
      const lastOut = lastData?.filter(m => m.type === 'out').reduce((sum, m) => sum + m.quantity, 0) || 0;

      return {
        entriesGrowth: lastIn === 0 ? 100 : ((currentIn - lastIn) / lastIn) * 100,
        exitsGrowth: lastOut === 0 ? 100 : ((currentOut - lastOut) / lastOut) * 100,
        movementsGrowth: (currentIn + currentOut) === 0 || (lastIn + lastOut) === 0 ? 0 : 
          (((currentIn + currentOut) - (lastIn + lastOut)) / (lastIn + lastOut)) * 100
      };
    },
  });

  // Buscar contagem de produtos com estoque baixo
  const { data: lowStockCount, refetch: refetchLowStock } = useQuery({
    queryKey: ['low-stock-count'],
    queryFn: async () => {
      SecureLogger.info('Buscando contagem de produtos com estoque baixo');
      
      const { data, error } = await supabase
        .from('products')
        .select('id, quantity, minimum_stock')
        .not('minimum_stock', 'is', null);

      if (error) {
        SecureLogger.error('Erro ao buscar produtos', error);
        return 0;
      }

      const lowStockItems = (data || []).filter(product => 
        product.minimum_stock && product.quantity < product.minimum_stock
      );

      return lowStockItems.length;
    },
  });

  const { recentMovements, refreshAll: refreshDashboard } = useDashboard();

  const isLoading = isStatsLoading || isComparisonLoading;

  const handleRefresh = async () => {
    try {
      SecureLogger.info('Iniciando atualização do dashboard');
      OptimizedApiService.clearCache();
      await Promise.all([refetchStats(), refetchLowStock(), refreshDashboard(), refreshOptimized()]);
      toast({
        title: "Dashboard atualizado",
        description: "Os dados foram atualizados com sucesso!",
      });
      SecureLogger.success('Dashboard atualizado com sucesso');
    } catch (error) {
      SecureLogger.error('Erro ao atualizar dashboard', error);
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

        {/* Cards de métricas modernos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </>
          ) : (
            <>
              <MetricsCard
                title="Total de Produtos"
                value={Number(dashboardStats?.totalProducts) || 0}
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
            </>
          )}
        </div>

        {/* Dashboard aprimorado */}
        <EnhancedDashboard />
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
