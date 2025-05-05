
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services/api";
import { DashboardStats, Product, StockMovement } from "@/types";

export function useDashboard() {
  // Fetch dashboard statistics with cache
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => ApiService.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime)
  });

  // Fetch low stock products with cache
  const { data: lowStockProducts, isLoading: isProductsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ["low-stock-products"],
    queryFn: () => ApiService.getLowStockProducts(5),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000, // Renamed from cacheTime
  });

  // Fetch recent stock movements with cache
  const { data: recentMovements, isLoading: isMovementsLoading, refetch: refetchMovements } = useQuery({
    queryKey: ["recent-movements"],
    queryFn: () => ApiService.getRecentMovements(10),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes (renamed from cacheTime)
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
