
import { supabase } from "@/integrations/supabase/client";
import { cacheService } from "./cacheService";
import { DashboardStats, MovementSummary, CategoryAnalysis } from "@/types";

/**
 * API otimizada com cache melhorado
 */
export const OptimizedApiService = {
  /**
   * Obter estatísticas do dashboard
   */
  async getDashboardStats(skipCache: boolean = false): Promise<DashboardStats> {
    try {
      const cacheKey = 'dashboard_stats_v2';
      
      if (!skipCache) {
        const cachedStats = cacheService.get<DashboardStats>(cacheKey);
        if (cachedStats) {
          console.log('✅ OptimizedApiService - Dashboard stats from cache');
          return cachedStats;
        }
      }
      
      console.log('🔄 OptimizedApiService - Fetching fresh dashboard stats');
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) {
        console.error('❌ OptimizedApiService - Dashboard stats error:', error);
        throw error;
      }
      
      const stats = data as unknown as DashboardStats;
      console.log('✅ OptimizedApiService - Dashboard stats loaded:', stats);
      
      // Cache por 3 minutos
      if (!skipCache) {
        cacheService.set(cacheKey, stats, 180000);
      }
      
      return stats;
    } catch (error) {
      console.error("❌ OptimizedApiService - Erro ao buscar estatísticas:", error);
      throw error;
    }
  },

  /**
   * Obter resumo de movimentações
   */
  async getMovementsSummary(daysBack: number = 30, skipCache: boolean = false): Promise<MovementSummary[]> {
    try {
      const cacheKey = `movements_summary_${daysBack}_v2`;
      
      if (!skipCache) {
        const cached = cacheService.get<MovementSummary[]>(cacheKey);
        if (cached) {
          console.log('✅ OptimizedApiService - Movements summary from cache');
          return cached;
        }
      }
      
      console.log('🔄 OptimizedApiService - Fetching fresh movements summary');
      const { data, error } = await supabase.rpc('get_movements_summary', { 
        days_back: daysBack 
      });
      
      if (error) {
        console.error('❌ OptimizedApiService - Movements summary error:', error);
        throw error;
      }
      
      const movements = (data || []) as unknown as MovementSummary[];
      console.log('✅ OptimizedApiService - Movements summary loaded:', movements.length, 'records');
      
      // Cache por 5 minutos
      if (!skipCache) {
        cacheService.set(cacheKey, movements, 300000);
      }
      
      return movements;
    } catch (error) {
      console.error("❌ OptimizedApiService - Erro ao buscar movimentações:", error);
      throw error;
    }
  },

  /**
   * Obter análise de categorias
   */
  async getCategoryAnalysis(skipCache: boolean = false): Promise<CategoryAnalysis[]> {
    try {
      const cacheKey = 'category_analysis_v2';
      
      if (!skipCache) {
        const cached = cacheService.get<CategoryAnalysis[]>(cacheKey);
        if (cached) {
          console.log('✅ OptimizedApiService - Category analysis from cache');
          return cached;
        }
      }
      
      console.log('🔄 OptimizedApiService - Fetching fresh category analysis');
      const { data, error } = await supabase.rpc('get_category_analysis');
      
      if (error) {
        console.error('❌ OptimizedApiService - Category analysis error:', error);
        throw error;
      }
      
      const analysis = (data || []) as unknown as CategoryAnalysis[];
      console.log('✅ OptimizedApiService - Category analysis loaded:', analysis.length, 'categories');
      
      // Cache por 5 minutos
      if (!skipCache) {
        cacheService.set(cacheKey, analysis, 300000);
      }
      
      return analysis;
    } catch (error) {
      console.error("❌ OptimizedApiService - Erro ao buscar análise de categorias:", error);
      throw error;
    }
  },

  /**
   * Limpar cache específico
   */
  clearCache(cacheKey?: string): void {
    if (cacheKey) {
      cacheService.delete(cacheKey);
      console.log('🧹 OptimizedApiService - Cache specific key cleared:', cacheKey);
    } else {
      cacheService.deleteByPattern('dashboard_|movements_|category_');
      console.log('🧹 OptimizedApiService - All API cache cleared');
    }
  },

  /**
   * Invalidar caches relacionados
   */
  invalidateRelatedCaches(category: string): void {
    const patterns = {
      dashboard: 'dashboard_',
      movements: 'movements_',
      categories: 'category_',
      products: 'products_'
    };
    
    const pattern = patterns[category as keyof typeof patterns];
    if (pattern) {
      cacheService.deleteByPattern(pattern);
      console.log(`🧹 OptimizedApiService - Invalidated ${category} related caches`);
    }
  }
};
