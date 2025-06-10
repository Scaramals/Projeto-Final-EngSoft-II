
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { OptimizedApiService } from "@/services/optimizedApi";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardStats, MovementSummary, CategoryAnalysis } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export function useOptimizedDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar estatísticas otimizadas do dashboard
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats-optimized"],
    queryFn: () => {
      console.log('useOptimizedDashboard - Fetching dashboard stats...');
      return OptimizedApiService.getDashboardStats(true); // Force refresh
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!user,
  });

  // Buscar resumo de movimentações
  const { data: movementsSummary, isLoading: isMovementsLoading, refetch: refetchMovements } = useQuery<MovementSummary[]>({
    queryKey: ["movements-summary"],
    queryFn: () => {
      console.log('useOptimizedDashboard - Fetching movements summary...');
      return OptimizedApiService.getMovementsSummary(30, true); // Force refresh
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!user,
  });

  // Buscar análise de categorias - VERSÃO ATUALIZADA COM FUNÇÃO CORRIGIDA
  const { data: categoryAnalysis, isLoading: isCategoryLoading, refetch: refetchCategory } = useQuery<CategoryAnalysis[]>({
    queryKey: ["category-analysis-v3"], // Nova query key para forçar refresh
    queryFn: () => {
      console.log('useOptimizedDashboard - Fetching category analysis with CORRECTED database function...');
      return OptimizedApiService.getCategoryAnalysis(true); // SEMPRE force refresh
    },
    staleTime: 0, // SEM cache local para testar
    gcTime: 0, // SEM cache local para testar  
    enabled: !!user,
    retry: 1,
  });

  // Buscar dados de tendência mensal - corrigir para usar dados reais
  const { data: monthlyTrends, isLoading: isTrendsLoading, refetch: refetchTrends } = useQuery({
    queryKey: ["monthly-trends"],
    queryFn: async () => {
      console.log('useOptimizedDashboard - Fetching monthly trends data...');
      const { data, error } = await supabase.rpc('get_movements_summary', { days_back: 180 });

      if (error) {
        console.error('useOptimizedDashboard - Error fetching monthly trends:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('useOptimizedDashboard - No monthly trends data found');
        return [];
      }

      // Agrupar por mês
      const monthlyData: { [key: string]: { in: number, out: number } } = {};
      
      data.forEach((movement: any) => {
        const monthKey = new Date(movement.movement_date).toISOString().slice(0, 7); // YYYY-MM
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { in: 0, out: 0 };
        }
        
        monthlyData[monthKey].in += movement.total_in || 0;
        monthlyData[monthKey].out += movement.total_out || 0;
      });

      const trends = Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          totalIn: data.in,
          totalOut: data.out,
          net: data.in - data.out
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6); // Últimos 6 meses

      console.log('useOptimizedDashboard - Monthly trends processed:', trends);
      return trends;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!user,
  });

  // Buscar comparação mensal para métricas
  const { data: monthlyComparison, isLoading: isComparisonLoading, refetch: refetchComparison } = useQuery({
    queryKey: ["monthly-comparison"],
    queryFn: async () => {
      console.log('useOptimizedDashboard - Fetching monthly comparison...');
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      // Buscar movimentações do mês atual
      const { data: currentData, error: currentError } = await supabase
        .from('stock_movements')
        .select('quantity, type')
        .gte('date', currentMonth.toISOString());

      // Buscar movimentações do mês passado
      const { data: lastData, error: lastError } = await supabase
        .from('stock_movements')
        .select('quantity, type')
        .gte('date', lastMonth.toISOString())
        .lt('date', currentMonth.toISOString());

      if (currentError || lastError) {
        console.error('useOptimizedDashboard - Error fetching comparison data:', currentError || lastError);
        throw new Error('Erro ao buscar dados de comparação');
      }

      const currentIn = currentData?.filter(m => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0) || 0;
      const currentOut = currentData?.filter(m => m.type === 'out').reduce((sum, m) => sum + m.quantity, 0) || 0;
      const lastIn = lastData?.filter(m => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0) || 0;
      const lastOut = lastData?.filter(m => m.type === 'out').reduce((sum, m) => sum + m.quantity, 0) || 0;

      const comparison = {
        entriesGrowth: lastIn === 0 ? 100 : ((currentIn - lastIn) / lastIn) * 100,
        exitsGrowth: lastOut === 0 ? 100 : ((currentOut - lastOut) / lastOut) * 100,
        movementsGrowth: (currentIn + currentOut) === 0 || (lastIn + lastOut) === 0 ? 0 : 
          (((currentIn + currentOut) - (lastIn + lastOut)) / (lastIn + lastOut)) * 100
      };

      console.log('useOptimizedDashboard - Monthly comparison:', comparison);
      return comparison;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!user,
  });
  
  // Função para forçar refresh de todos os dados
  const refreshAll = () => {
    console.log('useOptimizedDashboard - FORCE REFRESHING all dashboard data...');
    
    // Invalidar todas as queries relacionadas
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats-optimized"] });
    queryClient.invalidateQueries({ queryKey: ["movements-summary"] });
    queryClient.invalidateQueries({ queryKey: ["category-analysis-corrected"] });
    queryClient.invalidateQueries({ queryKey: ["category-analysis-v3"] });
    queryClient.invalidateQueries({ queryKey: ["monthly-trends"] });
    queryClient.invalidateQueries({ queryKey: ["monthly-comparison"] });
    queryClient.invalidateQueries({ queryKey: ["recent-movements"] });
    
    // Também limpar cache do service
    OptimizedApiService.clearCache();
    
    // Fazer refetch manual
    refetchStats();
    refetchMovements();
    refetchCategory();
    refetchTrends();
    refetchComparison();
  };

  // Debug logging detalhado para category analysis
  React.useEffect(() => {
    console.log('useOptimizedDashboard - Stats:', stats);
    console.log('useOptimizedDashboard - Movements Summary:', movementsSummary?.length, 'records');
    console.log('useOptimizedDashboard - Category Analysis with CORRECTED function:', categoryAnalysis?.length, 'categories');
    
    // Log detalhado de cada categoria
    if (categoryAnalysis && categoryAnalysis.length > 0) {
      console.log('useOptimizedDashboard - DETAILED Category Analysis:');
      categoryAnalysis.forEach((category, index) => {
        const isUUID = category.category_name && category.category_name.length === 36 && category.category_name.includes('-');
        console.log(`  Category ${index}:`, {
          name: category.category_name,
          products: category.product_count,
          value: category.total_value,
          isUUID: isUUID
        });
        
        if (isUUID) {
          console.error(`  ❌ Category ${index} STILL has UUID:`, category.category_name);
        } else {
          console.log(`  ✅ Category ${index} has proper name:`, category.category_name);
        }
      });
    } else {
      console.log('useOptimizedDashboard - No category analysis data available');
    }
    
    console.log('useOptimizedDashboard - Monthly Trends:', monthlyTrends?.length, 'months');
  }, [stats, movementsSummary, categoryAnalysis, monthlyTrends]);

  return {
    stats,
    movementsSummary,
    categoryAnalysis,
    monthlyTrends,
    monthlyComparison,
    isLoading: isStatsLoading || isMovementsLoading || isCategoryLoading || isTrendsLoading || isComparisonLoading,
    refreshAll,
  };
}
