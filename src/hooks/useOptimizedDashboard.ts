
import React, { useState, useEffect } from "react";
import { OptimizedApiService } from "@/services/optimizedApi";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardStats, MovementSummary, CategoryAnalysis } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export function useOptimizedDashboard() {
  const { user } = useAuth();

  // State for dashboard stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  // State for movements summary
  const [movementsSummary, setMovementsSummary] = useState<MovementSummary[]>([]);
  const [isMovementsLoading, setIsMovementsLoading] = useState(false);

  // State for category analysis
  const [categoryAnalysis, setCategoryAnalysis] = useState<CategoryAnalysis[]>([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  // State for monthly comparison
  const [monthlyComparison, setMonthlyComparison] = useState<any>(null);
  const [isComparisonLoading, setIsComparisonLoading] = useState(false);

  // Fetch dashboard stats
  const fetchStats = async () => {
    if (!user) return;
    
    setIsStatsLoading(true);
    try {
      console.log('useOptimizedDashboard - Fetching dashboard stats...');
      const data = await OptimizedApiService.getDashboardStats(true);
      setStats(data);
    } catch (error) {
      console.error('useOptimizedDashboard - Error fetching stats:', error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  // Fetch movements summary
  const fetchMovements = async () => {
    if (!user) return;
    
    setIsMovementsLoading(true);
    try {
      console.log('useOptimizedDashboard - Fetching movements summary...');
      const data = await OptimizedApiService.getMovementsSummary(30, true);
      setMovementsSummary(data);
    } catch (error) {
      console.error('useOptimizedDashboard - Error fetching movements:', error);
    } finally {
      setIsMovementsLoading(false);
    }
  };

  // Fetch category analysis
  const fetchCategory = async () => {
    if (!user) return;
    
    setIsCategoryLoading(true);
    try {
      console.log('useOptimizedDashboard - Fetching category analysis with FINAL CORRECTED database function...');
      const data = await OptimizedApiService.getCategoryAnalysis(true);
      setCategoryAnalysis(data);
    } catch (error) {
      console.error('useOptimizedDashboard - Error fetching category analysis:', error);
    } finally {
      setIsCategoryLoading(false);
    }
  };

  // Fetch monthly comparison
  const fetchComparison = async () => {
    if (!user) return;
    
    setIsComparisonLoading(true);
    try {
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
      setMonthlyComparison(comparison);
    } catch (error) {
      console.error('useOptimizedDashboard - Error fetching comparison:', error);
    } finally {
      setIsComparisonLoading(false);
    }
  };

  // Load all data when user is available
  useEffect(() => {
    if (user) {
      fetchStats();
      fetchMovements();
      fetchCategory();
      fetchComparison();
    }
  }, [user]);

  // Função para forçar refresh de todos os dados
  const refreshAll = () => {
    console.log('useOptimizedDashboard - FINAL FORCE REFRESH with corrected function...');
    
    // Limpar cache do service
    OptimizedApiService.clearCache();
    
    // Fazer refetch de todos os dados
    fetchStats();
    fetchMovements();
    fetchCategory();
    fetchComparison();
  };

  // Debug logging final para category analysis
  React.useEffect(() => {
    console.log('useOptimizedDashboard - FINAL CHECK - Stats:', stats);
    console.log('useOptimizedDashboard - FINAL CHECK - Movements Summary:', movementsSummary?.length, 'records');
    console.log('useOptimizedDashboard - FINAL CHECK - Category Analysis:', categoryAnalysis?.length, 'categories');
    
    // Log detalhado final de cada categoria
    if (categoryAnalysis && categoryAnalysis.length > 0) {
      console.log('useOptimizedDashboard - FINAL DETAILED Category Analysis:');
      categoryAnalysis.forEach((category, index) => {
        const isUUID = category.category_name && category.category_name.length === 36 && category.category_name.includes('-');
        console.log(`  FINAL Category ${index}:`, {
          name: category.category_name,
          products: category.product_count,
          value: category.total_value,
          isUUID: isUUID
        });
        
        if (isUUID) {
          console.error(`  ❌ FINAL Category ${index} STILL has UUID:`, category.category_name);
        } else {
          console.log(`  ✅ FINAL Category ${index} has proper name:`, category.category_name);
        }
      });
    } else {
      console.log('useOptimizedDashboard - FINAL CHECK - No category analysis data available');
    }
  }, [stats, movementsSummary, categoryAnalysis]);

  const isLoading = isStatsLoading || isMovementsLoading || isCategoryLoading || isComparisonLoading;

  return {
    stats,
    movementsSummary,
    categoryAnalysis,
    monthlyComparison,
    isLoading,
    refreshAll,
  };
}
