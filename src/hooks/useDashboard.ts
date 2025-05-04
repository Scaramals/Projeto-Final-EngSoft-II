
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services/api";
import { DashboardStats, Product, StockMovement } from "@/types";

export function useDashboard() {
  // Fetch dashboard statistics
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => ApiService.getDashboardStats(),
  });

  // Fetch low stock products
  const { data: lowStockProducts, isLoading: isProductsLoading } = useQuery({
    queryKey: ["low-stock-products"],
    queryFn: () => ApiService.getLowStockProducts(5),
  });

  // Fetch recent stock movements
  const { data: recentMovements, isLoading: isMovementsLoading } = useQuery({
    queryKey: ["recent-movements"],
    queryFn: () => ApiService.getRecentMovements(10),
  });

  return {
    stats,
    lowStockProducts,
    recentMovements,
    isLoading: isStatsLoading || isProductsLoading || isMovementsLoading,
  };
}
