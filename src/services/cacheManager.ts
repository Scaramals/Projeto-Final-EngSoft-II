
/**
 * Gerenciador central de cache do sistema
 * Responsável por limpar todos os caches de forma coordenada
 */
import { cacheService } from "./cacheService";
import { OptimizedApiService } from "./optimizedApi";
import { optimizedNotificationService } from "./optimizedNotificationService";

export const CacheManager = {
  /**
   * Limpa todos os caches do sistema
   */
  clearAllCaches(): void {
    console.log('🧹 CacheManager - Iniciando limpeza completa de todos os caches...');
    
    try {
      // Limpar cache principal do serviço
      console.log('🧹 Limpando cache principal...');
      cacheService.clear();
      
      // Limpar cache do serviço otimizado
      console.log('🧹 Limpando cache do serviço otimizado...');
      OptimizedApiService.clearCache();
      
      // Limpar cache das notificações
      console.log('🧹 Limpando cache das notificações...');
      optimizedNotificationService.clearCache();
      
      // Limpar cache do localStorage se houver
      console.log('🧹 Limpando localStorage...');
      this.clearLocalStorageCache();
      
      // Limpar cache do sessionStorage se houver
      console.log('🧹 Limpando sessionStorage...');
      this.clearSessionStorageCache();
      
      console.log('✅ CacheManager - Todos os caches foram limpos com sucesso!');
      
      // Disparar evento para componentes que precisam saber da limpeza
      window.dispatchEvent(new CustomEvent('cache-cleared', { 
        detail: { timestamp: new Date().toISOString() } 
      }));
      
    } catch (error) {
      console.error('❌ CacheManager - Erro ao limpar caches:', error);
    }
  },

  /**
   * Limpa apenas caches específicos de uma categoria
   */
  clearCacheByCategory(category: 'dashboard' | 'products' | 'movements' | 'categories' | 'suppliers'): void {
    console.log(`🧹 CacheManager - Limpando cache da categoria: ${category}`);
    
    const cacheKeys = this.getCacheKeysByCategory(category);
    
    cacheKeys.forEach(key => {
      cacheService.delete(key);
      console.log(`🧹 Cache removido: ${key}`);
    });
    
    // Também limpar cache do serviço otimizado para a categoria
    OptimizedApiService.clearCache();
  },

  /**
   * Obtém as chaves de cache por categoria
   */
  getCacheKeysByCategory(category: string): string[] {
    const allKeys = cacheService.getKeys();
    
    const categoryMappings = {
      dashboard: ['dashboard_stats', 'movements_summary', 'category_analysis'],
      products: ['all_products', 'low_stock_products'],
      movements: ['all_stock_movements', 'movements_summary'],
      categories: ['distinct_categories', 'category_analysis'],
      suppliers: ['all_suppliers']
    };
    
    const patterns = categoryMappings[category as keyof typeof categoryMappings] || [];
    
    return allKeys.filter(key => 
      patterns.some(pattern => key.includes(pattern))
    );
  },

  /**
   * Limpa cache do localStorage relacionado ao app
   */
  clearLocalStorageCache(): void {
    try {
      const keysToRemove = [];
      
      // Procurar por chaves relacionadas ao app
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('stock-control') || 
          key.includes('dashboard') ||
          key.includes('cache') ||
          key.includes('temp')
        )) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🧹 localStorage removido: ${key}`);
      });
      
    } catch (error) {
      console.warn('⚠️ Erro ao limpar localStorage:', error);
    }
  },

  /**
   * Limpa cache do sessionStorage relacionado ao app
   */
  clearSessionStorageCache(): void {
    try {
      const keysToRemove = [];
      
      // Procurar por chaves relacionadas ao app
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (
          key.includes('stock-control') || 
          key.includes('dashboard') ||
          key.includes('cache') ||
          key.includes('temp')
        )) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
        console.log(`🧹 sessionStorage removido: ${key}`);
      });
      
    } catch (error) {
      console.warn('⚠️ Erro ao limpar sessionStorage:', error);
    }
  },

  /**
   * Obtém estatísticas dos caches
   */
  getCacheStats(): { totalKeys: number, categories: Record<string, number> } {
    const allKeys = cacheService.getKeys();
    
    const stats = {
      totalKeys: allKeys.length,
      categories: {
        dashboard: 0,
        products: 0,
        movements: 0,
        categories: 0,
        suppliers: 0,
        outros: 0
      }
    };
    
    allKeys.forEach(key => {
      if (key.includes('dashboard') || key.includes('stats')) {
        stats.categories.dashboard++;
      } else if (key.includes('product')) {
        stats.categories.products++;
      } else if (key.includes('movement')) {
        stats.categories.movements++;
      } else if (key.includes('categor')) {
        stats.categories.categories++;
      } else if (key.includes('supplier')) {
        stats.categories.suppliers++;
      } else {
        stats.categories.outros++;
      }
    });
    
    return stats;
  }
};
