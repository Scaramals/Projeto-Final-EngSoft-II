
import { useQuery } from "@tanstack/react-query";
import { OptimizedApiService } from "@/services/optimizedApi";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardStats, MovementSummary, CategoryAnalysis } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export function useOptimizedDashboard() {
  const { user } = useAuth();

  // Buscar estatísticas otimizadas do dashboard
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats-optimized"],
    queryFn: () => OptimizedApiService.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!user,
  });

  // Buscar resumo de movimentações
  const { data: movementsSummary, isLoading: isMovementsLoading, refetch: refetchMovements } = useQuery<MovementSummary[]>({
    queryKey: ["movements-summary"],
    queryFn: () => OptimizedApiService.getMovementsSummary(30),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!user,
  });

  // Buscar análise de categorias
  const { data: categoryAnalysis, isLoading: isCategoryLoading, refetch: refetchCategory } = useQuery<CategoryAnalysis[]>({
    queryKey: ["category-analysis"],
    queryFn: () => OptimizedApiService.getCategoryAnalysis(),
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
        .select('quantity, type, created_at')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Agrupar por mês
      const monthlyData: { [key: string]: { in: number, out: number } } = {};
      
      data?.forEach(movement => {
        const monthKey = new Date(movement.created_at).toISOString().slice(0, 7); // YYYY-MM
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
  
  // Função para forçar refresh de todos os dados
  const refreshAll = () => {
    refetchStats();
    refetchMovements();
    refetchCategory();
    refetchTrends();
  };

  return {
    stats,
    movementsSummary,
    categoryAnalysis,
    monthlyTrends,
    isLoading: isStatsLoading || isMovementsLoading || isCategoryLoading || isTrendsLoading,
    refreshAll,
  };
}
