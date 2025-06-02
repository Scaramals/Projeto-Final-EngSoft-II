
import { useQuery } from "@tanstack/react-query";
import { OptimizedApiService } from "@/services/optimizedApi";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardStats, MovementSummary, CategoryAnalysis } from "@/types";

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
  
  // Função para forçar refresh de todos os dados
  const refreshAll = () => {
    refetchStats();
    refetchMovements();
    refetchCategory();
  };

  return {
    stats,
    movementsSummary,
    categoryAnalysis,
    isLoading: isStatsLoading || isMovementsLoading || isCategoryLoading,
    refreshAll,
  };
}
