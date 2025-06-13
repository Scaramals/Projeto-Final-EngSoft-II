
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MobileOptimizedLayout, MobileContainer } from "@/components/layout/MobileOptimizedLayout";
import { useOptimizedDashboard } from "@/hooks/useOptimizedDashboard";
import { useDashboard } from "@/hooks/useDashboard";
import { OptimizedApiService } from "@/services/optimizedApi";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats } from "@/types";
import { SecureLogger } from "@/services/secureLogger";
import { WelcomeMessage } from "@/components/dashboard/WelcomeMessage";
import { RealTimePerformanceSummary } from "@/components/dashboard/RealTimePerformanceSummary";
import { EnhancedDashboard } from "@/components/dashboard/EnhancedDashboard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import { useData } from "@/contexts/DataContext";
import { useIsMobile } from "@/hooks/use-mobile";

const DashboardPage: React.FC = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { refreshAll: refreshOptimized } = useOptimizedDashboard();
  const { products, fetchProducts, loadingProducts } = useData();
  const { recentMovements, refreshAll: refreshDashboard } = useDashboard();
  
  useRealTimeNotifications();

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [monthlyComparison, setMonthlyComparison] = useState<any>(null);
  const [isComparisonLoading, setIsComparisonLoading] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);

  const fetchDashboardStats = async () => {
    setIsStatsLoading(true);
    try {
      SecureLogger.info('Buscando estatísticas do dashboard');
      
      const { data, error } = await supabase.rpc('get_dashboard_stats');

      if (error) {
        SecureLogger.error('Erro ao buscar estatísticas do dashboard', error);
        throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
      }

      SecureLogger.success('Estatísticas do dashboard obtidas com sucesso');
      setDashboardStats(data as unknown as DashboardStats);
    } catch (error) {
      SecureLogger.error('Erro ao buscar estatísticas', error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const fetchMonthlyComparison = async () => {
    setIsComparisonLoading(true);
    try {
      SecureLogger.info('Buscando dados de comparação mensal');
      
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      const { data: currentData, error: currentError } = await supabase
        .from('stock_movements')
        .select('quantity, type')
        .gte('date', currentMonth.toISOString());

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

      setMonthlyComparison({
        entriesGrowth: lastIn === 0 ? 100 : ((currentIn - lastIn) / lastIn) * 100,
        exitsGrowth: lastOut === 0 ? 100 : ((currentOut - lastOut) / lastOut) * 100,
        movementsGrowth: (currentIn + currentOut) === 0 || (lastIn + lastOut) === 0 ? 0 : 
          (((currentIn + currentOut) - (lastIn + lastOut)) / (lastIn + lastOut)) * 100
      });
    } catch (error) {
      SecureLogger.error('Erro ao buscar comparação mensal', error);
    } finally {
      setIsComparisonLoading(false);
    }
  };

  const fetchLowStockCount = async () => {
    try {
      SecureLogger.info('Buscando contagem de produtos com estoque baixo');
      
      const { data, error } = await supabase
        .from('products')
        .select('id, quantity, minimum_stock')
        .not('minimum_stock', 'is', null);

      if (error) {
        SecureLogger.error('Erro ao buscar produtos', error);
        return;
      }

      const lowStockItems = (data || []).filter(product => 
        product.minimum_stock && product.quantity < product.minimum_stock
      );

      setLowStockCount(lowStockItems.length);
    } catch (error) {
      SecureLogger.error('Erro ao buscar contagem de estoque baixo', error);
    }
  };

  const isLoading = isStatsLoading || isComparisonLoading || loadingProducts;

  const handleRefresh = async () => {
    try {
      SecureLogger.info('Iniciando atualização do dashboard');
      OptimizedApiService.clearCache();
      await Promise.all([
        fetchDashboardStats(),
        fetchLowStockCount(),
        fetchMonthlyComparison(),
        refreshDashboard(),
        refreshOptimized(),
        fetchProducts()
      ]);
      toast({
        title: "Dashboard atualizado",
        description: "Os dados foram atualizados com sucesso!",
      });
      SecureLogger.success('Dashboard atualizado com sucesso');
    } catch (error) {
      SecureLogger.error('Erro ao atualizar dashboard', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados. Tente novamente.",
      });
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchMonthlyComparison();
    fetchLowStockCount();
    fetchProducts();
  }, []);

  return (
    <AppLayout>
      <MobileContainer>
        <div className="space-y-3 sm:space-y-4 md:space-y-6 max-w-full overflow-hidden">
          <WelcomeMessage />
          
          <DashboardHeader onRefresh={handleRefresh} isLoading={isLoading} />

          <DashboardMetrics
            isLoading={isLoading}
            dashboardStats={dashboardStats}
            monthlyComparison={monthlyComparison}
            lowStockCount={lowStockCount}
            productsLength={products.length}
          />

          <RealTimePerformanceSummary />
          
          <EnhancedDashboard />
        </div>
      </MobileContainer>
    </AppLayout>
  );
};

export default DashboardPage;
