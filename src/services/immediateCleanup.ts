
/**
 * Script de limpeza imediata de todos os caches
 * Executa automaticamente quando importado
 */
import { CacheManager } from "./cacheManager";

// Executar limpeza imediata
console.log('🧹 INICIANDO LIMPEZA IMEDIATA DE TODOS OS CACHES...');

// Aguardar um momento para garantir que todos os serviços foram carregados
setTimeout(() => {
  CacheManager.clearAllCaches();
  console.log('🧹 LIMPEZA IMEDIATA CONCLUÍDA!');
}, 100);

// Exportar para que possa ser usado onde necessário
export { CacheManager };
