
/**
 * Serviço de cache para melhorar o desempenho do aplicativo
 * Implementa um mecanismo simples de cache em memória com tempo de expiração
 */
type CacheItem<T> = {
  value: T;
  expiry: number;
};

class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  
  /**
   * Obtém um item do cache
   * @param key Chave do item
   * @returns O valor armazenado ou null se expirado ou não existente
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Verifica se o item expirou
    if (item.expiry < Date.now()) {
      this.delete(key);
      return null;
    }
    
    return item.value as T;
  }
  
  /**
   * Armazena um item no cache
   * @param key Chave do item
   * @param value Valor a ser armazenado
   * @param ttlSeconds Tempo de vida em segundos (padrão: 5 minutos)
   */
  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expiry });
  }
  
  /**
   * Remove um item do cache
   * @param key Chave do item a ser removido
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Remove todos os itens do cache
   */
  clear(): void {
    console.log('🧹 CacheService - Limpando todos os itens do cache principal...');
    this.cache.clear();
    console.log('✅ CacheService - Cache principal limpo!');
  }
  
  /**
   * Obtém todas as chaves do cache
   * @returns Array com todas as chaves
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }
  
  /**
   * Remove todos os itens expirados do cache
   */
  cleanup(): void {
    const now = Date.now();
    let removedCount = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry < now) {
        this.delete(key);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      console.log(`🧹 CacheService - Removidos ${removedCount} itens expirados`);
    }
  }

  /**
   * Força limpeza completa e imediata
   */
  forceClear(): void {
    console.log('🧹 CacheService - FORÇA LIMPEZA COMPLETA INICIADA...');
    this.cache.clear();
    
    // Parar o timer de limpeza automática temporariamente
    console.log('🧹 CacheService - Cache completamente limpo e resetado!');
  }
}

export const cacheService = new CacheService();

// Executar limpeza periódica do cache a cada 10 minutos
setInterval(() => {
  cacheService.cleanup();
}, 10 * 60 * 1000);

// LIMPEZA IMEDIATA - executa assim que o serviço é carregado
console.log('🧹 EXECUTANDO LIMPEZA IMEDIATA DE CACHE...');
cacheService.forceClear();
