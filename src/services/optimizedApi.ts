
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
          return cachedStats;
        }
      }
      
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) throw error;
      
      // Properly handle the Json type conversion
      const stats = data as unknown as DashboardStats;
      
      // Cache por 2 minutos
      cacheService.set(cacheKey, stats, 120);
      
      return stats;
    } catch (error) {
      console.error("Erro ao buscar estatísticas do dashboard:", error);
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
          return cached;
        }
      }
      
      const { data, error } = await supabase.rpc('get_movements_summary', { 
        days_back: daysBack 
      });
      
      if (error) throw error;
      
      // Properly handle the array type conversion
      const movements = (data || []) as unknown as MovementSummary[];
      
      // Cache por 5 minutos
      cacheService.set(cacheKey, movements, 300);
      
      return movements;
    } catch (error) {
      console.error("Erro ao buscar resumo de movimentações:", error);
      throw error;
    }
  },

  /**
   * Obter análise de categorias otimizada
   */
  async getCategoryAnalysis(skipCache: boolean = false): Promise<CategoryAnalysis[]> {
    try {
      const cacheKey = 'category_analysis';
      
      if (!skipCache) {
        const cached = cacheService.get<CategoryAnalysis[]>(cacheKey);
        if (cached) {
          return cached;
        }
      }
      
      const { data, error } = await supabase.rpc('get_category_analysis');
      
      if (error) throw error;
      
      // Properly handle the array type conversion
      const analysis = (data || []) as unknown as CategoryAnalysis[];
      
      // Cache por 10 minutos
      cacheService.set(cacheKey, analysis, 600);
      
      return analysis;
    } catch (error) {
      console.error("Erro ao buscar análise de categorias:", error);
      throw error;
    }
  },

  /**
   * Limpar cache
   */
  clearCache(cacheKey?: string): void {
    if (cacheKey) {
      cacheService.delete(cacheKey);
    } else {
      cacheService.clear();
    }
  }
};
