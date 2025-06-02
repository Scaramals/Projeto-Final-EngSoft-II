
import { supabase } from "@/integrations/supabase/client";
import { cacheService } from "./cacheService";

/**
 * API otimizada usando as novas funções do banco para melhor performance
 */
export const OptimizedApiService = {
  /**
   * Obter estatísticas do dashboard usando função otimizada do banco
   */
  async getDashboardStats(skipCache: boolean = false) {
    try {
      const cacheKey = 'dashboard_stats_optimized';
      
      if (!skipCache) {
        const cachedStats = cacheService.get(cacheKey);
        if (cachedStats) {
          return cachedStats;
        }
      }
      
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) throw error;
      
      // Cache por 2 minutos
      cacheService.set(cacheKey, data, 120);
      
      return data;
    } catch (error) {
      console.error("Erro ao buscar estatísticas do dashboard:", error);
      throw error;
    }
  },

  /**
   * Obter resumo de movimentações otimizado
   */
  async getMovementsSummary(daysBack: number = 30, skipCache: boolean = false) {
    try {
      const cacheKey = `movements_summary_${daysBack}`;
      
      if (!skipCache) {
        const cached = cacheService.get(cacheKey);
        if (cached) {
          return cached;
        }
      }
      
      const { data, error } = await supabase.rpc('get_movements_summary', { 
        days_back: daysBack 
      });
      
      if (error) throw error;
      
      // Cache por 5 minutos
      cacheService.set(cacheKey, data || [], 300);
      
      return data || [];
    } catch (error) {
      console.error("Erro ao buscar resumo de movimentações:", error);
      throw error;
    }
  },

  /**
   * Obter análise de categorias otimizada
   */
  async getCategoryAnalysis(skipCache: boolean = false) {
    try {
      const cacheKey = 'category_analysis';
      
      if (!skipCache) {
        const cached = cacheService.get(cacheKey);
        if (cached) {
          return cached;
        }
      }
      
      const { data, error } = await supabase.rpc('get_category_analysis');
      
      if (error) throw error;
      
      // Cache por 10 minutos
      cacheService.set(cacheKey, data || [], 600);
      
      return data || [];
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
