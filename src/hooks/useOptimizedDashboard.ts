
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
    queryFn: () => OptimizedApiService.getDashboardStats(true), // Force refresh
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!user,
  });

  // Buscar resumo de movimentações
  const { data: movementsSummary, isLoading: isMovementsLoading, refetch: refetchMovements } = useQuery<MovementSummary[]>({
    queryKey: ["movements-summary"],
    queryFn: () => OptimizedApiService.getMovementsSummary(30, true), // Force refresh
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!user,
  });

  // Buscar análise de categorias
  const { data: categoryAnalysis, isLoading: isCategoryLoading, refetch: refetchCategory } = useQuery<CategoryAnalysis[]>({
    queryKey: ["category-analysis"],
    queryFn: () => OptimizedApiService.getCategoryAnalysis(true), // Force refresh
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 20 * 60 * 1000, // 20 minutos
    enabled: !!user,
  });

  // Buscar dados de tendência mensal
  const { data: monthlyTrends, isLoading: isTrendsLoading, refetch: refetchTrends } = useQuery({
    queryKey: ["monthly-trends"],
    queryFn: async () => {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      
      const { data, error } = await supabase
        .from('stock_movements')
        .select('quantity, type, date')
        .gte('date', sixMonthsAgo.toISOString())
        .order('date', { ascending: true });

      if (error) throw error;

      // Agrupar por mês
      const monthlyData: { [key: string]: { in: number, out: number } } = {};
      
      data?.forEach(movement => {
        const monthKey = new Date(movement.date).toISOString().slice(0, 7); // YYYY-MM
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { in: 0, out: 0 };
        }
        
        if (movement.type === 'in') {
          monthlyData[monthKey].in += movement.quantity;
        } else {
          monthlyData[monthKey].out += movement.quantity;
        }
      });

      return Object.entries(monthlyData).map(([month, data]) => ({
        month,
        totalIn: data.in,
        totalOut: data.out,
        net: data.in - data.out
      }));
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!user,
  });

  // Buscar comparação mensal para métricas
  const { data: monthlyComparison, isLoading: isComparisonLoading, refetch: refetchComparison } = useQuery({
    queryKey: ["monthly-comparison"],
    queryFn: async () => {
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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!user,
  });
  
  // Função para forçar refresh de todos os dados
  const refreshAll = () => {
    console.log('Refreshing all dashboard data...');
    
    // Invalidar todas as queries relacionadas
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats-optimized"] });
    queryClient.invalidateQueries({ queryKey: ["movements-summary"] });
    queryClient.invalidateQueries({ queryKey: ["category-analysis"] });
    queryClient.invalidateQueries({ queryKey: ["monthly-trends"] });
    queryClient.invalidateQueries({ queryKey: ["monthly-comparison"] });
    
    // Também limpar cache do service
    OptimizedApiService.clearCache();
    
    // Fazer refetch manual
    refetchStats();
    refetchMovements();
    refetchCategory();
    refetchTrends();
    refetchComparison();
  };

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
