
import { supabase } from "@/integrations/supabase/client";
import { cacheService } from "./cacheService";
import { DashboardStats, MovementSummary, CategoryAnalysis } from "@/types";

/**
 * API otimizada usando as novas funções do banco para melhor performance
 */
export const OptimizedApiService = {
  /**
   * Obter estatísticas do dashboard usando função otimizada do banco
   */
  async getDashboardStats(skipCache: boolean = false): Promise<DashboardStats> {
    try {
      const cacheKey = 'dashboard_stats_optimized';
      
      if (!skipCache) {
        const cachedStats = cacheService.get<DashboardStats>(cacheKey);
        if (cachedStats) {
          console.log('OptimizedApiService - Using cached dashboard stats');
          return cachedStats;
        }
      }
      
      console.log('OptimizedApiService - Fetching fresh dashboard stats from database');
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) {
        console.error('OptimizedApiService - Error fetching dashboard stats:', error);
        throw error;
      }
      
      // Properly handle the Json type conversion
      const stats = data as unknown as DashboardStats;
      console.log('OptimizedApiService - Dashboard stats fetched:', stats);
      
      // Cache por 2 minutos apenas se não foi skipCache
      if (!skipCache) {
        cacheService.set(cacheKey, stats, 120);
      }
      
      return stats;
    } catch (error) {
      console.error("OptimizedApiService - Erro ao buscar estatísticas do dashboard:", error);
      throw error;
    }
  },

  /**
   * Obter resumo de movimentações otimizado
   */
  async getMovementsSummary(daysBack: number = 30, skipCache: boolean = false): Promise<MovementSummary[]> {
    try {
      const cacheKey = `movements_summary_${daysBack}`;
      
      if (!skipCache) {
        const cached = cacheService.get<MovementSummary[]>(cacheKey);
        if (cached) {
          console.log('OptimizedApiService - Using cached movements summary');
          return cached;
        }
      }
      
      console.log('OptimizedApiService - Fetching fresh movements summary from database');
      const { data, error } = await supabase.rpc('get_movements_summary', { 
        days_back: daysBack 
      });
      
      if (error) {
        console.error('OptimizedApiService - Error fetching movements summary:', error);
        throw error;
      }
      
      // Properly handle the array type conversion
      const movements = (data || []) as unknown as MovementSummary[];
      console.log('OptimizedApiService - Movements summary fetched:', movements.length, 'records');
      
      // Cache por 5 minutos apenas se não foi skipCache
      if (!skipCache) {
        cacheService.set(cacheKey, movements, 300);
      }
      
      return movements;
    } catch (error) {
      console.error("OptimizedApiService - Erro ao buscar resumo de movimentações:", error);
      throw error;
    }
  },

  /**
   * Obter análise de categorias otimizada - agora usa a função corrigida que retorna nomes das categorias
   */
  async getCategoryAnalysis(skipCache: boolean = false): Promise<CategoryAnalysis[]> {
    try {
      const cacheKey = 'category_analysis';
      
      // Limpar cache se skipCache for true
      if (skipCache) {
        console.log('OptimizedApiService - Clearing category analysis cache');
        cacheService.delete(cacheKey);
      }
      
      if (!skipCache) {
        const cached = cacheService.get<CategoryAnalysis[]>(cacheKey);
        if (cached) {
          console.log('OptimizedApiService - Using cached category analysis');
          return cached;
        }
      }
      
      console.log('OptimizedApiService - Fetching fresh category analysis from database (with corrected names)');
      const { data, error } = await supabase.rpc('get_category_analysis');
      
      if (error) {
        console.error('OptimizedApiService - Error fetching category analysis:', error);
        throw error;
      }
      
      // Properly handle the array type conversion
      const analysis = (data || []) as unknown as CategoryAnalysis[];
      console.log('OptimizedApiService - Category analysis fetched with names:', analysis.length, 'categories');
      console.log('OptimizedApiService - Category analysis data with names:', analysis);
      
      // Cache por 10 minutos apenas se não foi skipCache
      if (!skipCache) {
        cacheService.set(cacheKey, analysis, 600);
      }
      
      return analysis;
    } catch (error) {
      console.error("OptimizedApiService - Erro ao buscar análise de categorias:", error);
      throw error;
    }
  },

  /**
   * Limpar cache
   */
  clearCache(cacheKey?: string): void {
    console.log('OptimizedApiService - Clearing API cache', cacheKey ? `for key: ${cacheKey}` : 'all');
    if (cacheKey) {
      cacheService.delete(cacheKey);
    } else {
      cacheService.clear();
    }
  }
};
