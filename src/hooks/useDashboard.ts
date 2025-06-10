
import { useState, useEffect } from "react";
import { OptimizedApiService } from "@/services/optimizedApi";
import { ApiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { SecureLogger } from "@/services/secureLogger";

export function useDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      SecureLogger.info('Buscando estatísticas do dashboard via OptimizedApiService');
      const data = await OptimizedApiService.getDashboardStats();
      setStats(data);
      return data;
    } catch (error) {
      SecureLogger.error('Erro ao buscar estatísticas do dashboard', error);
      setHasErrors(true);
      // Retornar dados padrão em caso de erro
      const defaultStats = {
        totalProducts: 0,
        lowStockProducts: 0,
        totalValue: 0,
        recentMovementsCount: 0,
      };
      setStats(defaultStats);
      return defaultStats;
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      SecureLogger.info('Buscando produtos com estoque baixo');
      const data = await ApiService.getLowStockProducts();
      setLowStockProducts(data);
      return data;
    } catch (error) {
      SecureLogger.error('Erro ao buscar produtos com estoque baixo', error);
      setHasErrors(true);
      setLowStockProducts([]);
      return [];
    }
  };

  const fetchRecentMovements = async () => {
    try {
      SecureLogger.info('Buscando movimentações recentes');
      const data = await OptimizedApiService.getMovementsSummary(10);
      setRecentMovements(data);
      return data;
    } catch (error) {
      SecureLogger.error('Erro ao buscar movimentações recentes', error);
      setHasErrors(true);
      setRecentMovements([]);
      return [];
    }
  };

  const fetchAllData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setHasErrors(false);
    
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchLowStockProducts(),
        fetchRecentMovements()
      ]);
    } catch (error) {
      SecureLogger.error('Erro ao buscar dados do dashboard', error);
      setHasErrors(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para forçar refresh de todos os dados
  const refreshAll = async () => {
    try {
      SecureLogger.info('Atualizando todos os dados do dashboard');
      
      // Limpar cache antes de atualizar
      OptimizedApiService.clearCache();
      ApiService.clearCache();
      
      // Refetch all data
      await fetchAllData();
      
      SecureLogger.success('Dashboard atualizado com sucesso');
    } catch (error) {
      SecureLogger.error('Erro ao atualizar dashboard', error);
      setHasErrors(true);
    }
  };

  // Carregar dados iniciais quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  return {
    stats,
    lowStockProducts,
    recentMovements,
    isLoading,
    refreshAll,
    hasErrors,
  };
}
