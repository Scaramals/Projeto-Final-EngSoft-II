
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { SecureLogger } from "@/services/secureLogger";

export function useDashboard() {
  const { user } = useAuth();

  // Buscar estatísticas do dashboard com cache e melhor tratamento de erro
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats, error: statsError } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      try {
        SecureLogger.info('Buscando estatísticas do dashboard via ApiService');
        return await ApiService.getDashboardStats();
      } catch (error) {
        SecureLogger.error('Erro ao buscar estatísticas do dashboard', error);
        // Retornar dados padrão em caso de erro
        return {
          totalProducts: 0,
          lowStockProducts: 0,
          totalValue: 0,
          recentMovementsCount: 0,
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!user,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Buscar produtos com estoque baixo com cache
  const { data: lowStockProducts, isLoading: isProductsLoading, refetch: refetchProducts, error: productsError } = useQuery({
    queryKey: ["low-stock-products"],
    queryFn: async () => {
      try {
        SecureLogger.info('Buscando produtos com estoque baixo');
        return await ApiService.getLowStockProducts(5);
      } catch (error) {
        SecureLogger.error('Erro ao buscar produtos com estoque baixo', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!user,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Buscar movimentações recentes com cache
  const { data: recentMovements, isLoading: isMovementsLoading, refetch: refetchMovements, error: movementsError } = useQuery({
    queryKey: ["recent-movements"],
    queryFn: async () => {
      try {
        SecureLogger.info('Buscando movimentações recentes');
        return await ApiService.getRecentMovements(10);
      } catch (error) {
        SecureLogger.error('Erro ao buscar movimentações recentes', error);
        return [];
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 3 * 60 * 1000, // 3 minutos
    enabled: !!user,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  
  // Função para forçar refresh de todos os dados
  const refreshAll = async () => {
    try {
      SecureLogger.info('Atualizando todos os dados do dashboard');
      
      // Limpar cache antes de atualizar
      ApiService.clearCache();
      
      // Refetch all queries
      await Promise.all([
        refetchStats(),
        refetchProducts(), 
        refetchMovements()
      ]);
      
      SecureLogger.success('Dashboard atualizado com sucesso');
    } catch (error) {
      SecureLogger.error('Erro ao atualizar dashboard', error);
    }
  };

  // Log de erros se houver
  if (statsError) {
    SecureLogger.error('Erro nas estatísticas do dashboard', statsError);
  }
  if (productsError) {
    SecureLogger.error('Erro nos produtos com estoque baixo', productsError);
  }
  if (movementsError) {
    SecureLogger.error('Erro nas movimentações recentes', movementsError);
  }

  return {
    stats,
    lowStockProducts,
    recentMovements,
    isLoading: isStatsLoading || isProductsLoading || isMovementsLoading,
    refreshAll,
    hasErrors: !!(statsError || productsError || movementsError),
  };
}
