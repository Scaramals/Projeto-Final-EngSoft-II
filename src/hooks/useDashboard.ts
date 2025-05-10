
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services/api";
import { DashboardStats, Product, StockMovement } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export function useDashboard() {
  const { user } = useAuth();

  // Buscar estatísticas do dashboard com cache
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => ApiService.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos (substituiu cacheTime)
    enabled: !!user, // Só executa quando o usuário está autenticado
  });

  // Buscar produtos com estoque baixo com cache
  const { data: lowStockProducts, isLoading: isProductsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ["low-stock-products"],
    queryFn: () => ApiService.getLowStockProducts(5),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!user,
  });

  // Buscar movimentações recentes com cache
  const { data: recentMovements, isLoading: isMovementsLoading, refetch: refetchMovements } = useQuery({
    queryKey: ["recent-movements"],
    queryFn: () => ApiService.getRecentMovements(10),
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 3 * 60 * 1000, // 3 minutos
    enabled: !!user,
  });
  
  // Função para forçar refresh de todos os dados
  const refreshAll = () => {
    refetchStats();
    refetchProducts();
    refetchMovements();
  };

  return {
    stats,
    lowStockProducts,
    recentMovements,
    isLoading: isStatsLoading || isProductsLoading || isMovementsLoading,
    refreshAll,
  };
}
