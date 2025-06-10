
/**
 * Gerenciador central de cache otimizado
 * Remove limpezas automáticas desnecessárias e melhora controle
 */
import { cacheService } from "./cacheService";
import { OptimizedApiService } from "./optimizedApi";
import { optimizedNotificationService } from "./optimizedNotificationService";

export const CacheManager = {
  /**
   * Limpa todos os caches do sistema de forma controlada
   */
  clearAllCaches(): void {
    console.log('🧹 CacheManager - Iniciando limpeza de caches...');
    
    try {
      // Limpar cache principal
      cacheService.clear();
      
      // Limpar cache do serviço otimizado
      OptimizedApiService.clearCache();
      
      // Limpar cache das notificações
      optimizedNotificationService.clearCache();
      
      // Limpar caches do browser de forma seletiva
      this.clearBrowserCaches();
      
      console.log('✅ CacheManager - Caches limpos com sucesso!');
      
      // Disparar evento para componentes
      this.notifyCacheCleared();
      
    } catch (error) {
      console.error('❌ CacheManager - Erro ao limpar caches:', error);
    }
  },

  /**
   * Limpa caches por categoria
   */
  clearCacheByCategory(category: 'dashboard' | 'products' | 'movements' | 'categories' | 'suppliers'): void {
    console.log(`🧹 CacheManager - Limpando cache da categoria: ${category}`);
    
    const patterns = {
      dashboard: ['dashboard_', 'stats_', 'movements_summary'],
      products: ['products_', 'all_products', 'low_stock'],
      movements: ['movements_', 'stock_movements'],
      categories: ['categories_', 'distinct_categories'],
      suppliers: ['suppliers_', 'all_suppliers']
    };
    
    const categoryPatterns = patterns[category] || [];
    
    categoryPatterns.forEach(pattern => {
      const deleted = cacheService.deleteByPattern(pattern);
      if (deleted > 0) {
        console.log(`🧹 Removidos ${deleted} itens para padrão: ${pattern}`);
      }
    });
    
    // Também limpar cache do serviço otimizado
    OptimizedApiService.clearCache();
  },

  /**
   * Obtém estatísticas consolidadas dos caches
   */
  getCacheStats(): {
    mainCache: any;
    totalKeys: number;
    categorizedKeys: Record<string, number>;
  } {
    const mainStats = cacheService.getStats();
    
    const categorizedKeys = {
      dashboard: 0,
      products: 0,
      movements: 0,
      categories: 0,
      suppliers: 0,
      outros: 0
    };
    
    mainStats.keys.forEach(key => {
      if (key.includes('dashboard') || key.includes('stats')) {
        categorizedKeys.dashboard++;
      } else if (key.includes('product')) {
        categorizedKeys.products++;
      } else if (key.includes('movement')) {
        categorizedKeys.movements++;
      } else if (key.includes('categor')) {
        categorizedKeys.categories++;
      } else if (key.includes('supplier')) {
        categorizedKeys.suppliers++;
      } else {
        categorizedKeys.outros++;
      }
    });
    
    return {
      mainCache: mainStats,
      totalKeys: mainStats.size,
      categorizedKeys
    };
  },

  /**
   * Invalidar cache específico
   */
  invalidateCache(key: string): boolean {
    return cacheService.delete(key);
  },

  /**
   * Verificar se cache existe
   */
  hasCache(key: string): boolean {
    return cacheService.has(key);
  },

  /**
   * Limpar caches do browser de forma seletiva
   */
  clearBrowserCaches(): void {
    try {
      // Limpar localStorage relacionado ao app
      this.clearStorageByPattern(localStorage, ['stock-control', 'dashboard', 'temp']);
      
      // Limpar sessionStorage relacionado ao app
      this.clearStorageByPattern(sessionStorage, ['stock-control', 'dashboard', 'temp']);
      
    } catch (error) {
      console.warn('⚠️ Erro ao limpar caches do browser:', error);
    }
  },

  /**
   * Limpar storage por padrões
   */
  clearStorageByPattern(storage: Storage, patterns: string[]): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && patterns.some(pattern => key.includes(pattern))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      storage.removeItem(key);
      console.log(`🧹 Storage removido: ${key}`);
    });
  },

  /**
   * Notificar componentes sobre limpeza de cache
   */
  notifyCacheCleared(): void {
    window.dispatchEvent(new CustomEvent('cache-cleared', { 
      detail: { 
        timestamp: new Date().toISOString(),
        source: 'CacheManager'
      } 
    }));
  },

  /**
   * Configurar limpeza automática por categoria
   */
  scheduleCleanup(category: string, intervalMs: number = 300000): NodeJS.Timeout {
    return setInterval(() => {
      console.log(`🕒 Limpeza automática programada para: ${category}`);
      this.clearCacheByCategory(category as any);
    }, intervalMs);
  }
};
