
/**
 * Serviço de cache melhorado para o aplicativo
 * Sistema robusto com controle de TTL e gestão automática
 */
type CacheItem<T> = {
  value: T;
  expiry: number;
  lastAccessed: number;
};

class EnhancedCacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos
  private readonly CLEANUP_INTERVAL = 2 * 60 * 1000; // 2 minutos
  
  constructor() {
    this.startCleanupTimer();
  }
  
  /**
   * Obtém um item do cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      console.log(`Cache miss for key: ${key}`);
      return null;
    }
    
    const now = Date.now();
    
    // Verifica se expirou
    if (item.expiry < now) {
      console.log(`Cache expired for key: ${key}`);
      this.cache.delete(key);
      return null;
    }
    
    // Atualiza último acesso
    item.lastAccessed = now;
    
    console.log(`Cache hit for key: ${key}`);
    return item.value as T;
  }
  
  /**
   * Armazena um item no cache
   */
  set<T>(key: string, value: T, ttlMs?: number): void {
    const now = Date.now();
    const ttl = ttlMs || this.DEFAULT_TTL;
    
    this.cache.set(key, {
      value,
      expiry: now + ttl,
      lastAccessed: now
    });
    
    console.log(`Cache set for key: ${key}, TTL: ${ttl}ms`);
  }
  
  /**
   * Remove um item específico do cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`Cache deleted for key: ${key}`);
    }
    return deleted;
  }
  
  /**
   * Remove itens por padrão
   */
  deleteByPattern(pattern: string): number {
    let deleted = 0;
    const regex = new RegExp(pattern);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    
    if (deleted > 0) {
      console.log(`Cache deleted ${deleted} items matching pattern: ${pattern}`);
    }
    
    return deleted;
  }
  
  /**
   * Limpa todo o cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`Cache cleared - removed ${size} items`);
  }
  
  /**
   * Obtém estatísticas do cache
   */
  getStats(): {
    size: number;
    keys: string[];
    memory: string;
  } {
    const keys = Array.from(this.cache.keys());
    return {
      size: this.cache.size,
      keys,
      memory: `${JSON.stringify(Array.from(this.cache.entries())).length} bytes (approx)`
    };
  }
  
  /**
   * Verifica se uma chave existe no cache
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // Verifica se não expirou
    if (item.expiry < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Inicia timer de limpeza automática
   */
  private startCleanupTimer(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, this.CLEANUP_INTERVAL);
  }
  
  /**
   * Remove itens expirados
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry < now) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`Cache cleanup: removed ${cleaned} expired items`);
    }
  }
  
  /**
   * Para o serviço de cache
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Instância singleton
export const cacheService = new EnhancedCacheService();

// Cleanup quando a página é fechada
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cacheService.destroy();
  });
}
