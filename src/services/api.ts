
import { supabase } from "@/integrations/supabase/client";
import { Product, StockMovement, FilterParams } from "@/types";
import { SecureLogger } from "./secureLogger";
import { cacheService } from "./cacheService";

export interface MovementValidation {
  valid: boolean;
  message?: string;
  currentStock?: number;
}

/**
 * Serviço de API centralizado com cache otimizado para melhor performance
 */
export const ApiService = {
  /**
   * Obter produtos com filtros opcionais
   */
  async getProducts(filters?: FilterParams): Promise<Product[]> {
    try {
      const cacheKey = `products_${JSON.stringify(filters || {})}`;
      const cached = cacheService.get<Product[]>(cacheKey);
      
      if (cached) {
        SecureLogger.info('[CACHE] Produtos carregados do cache');
        return cached;
      }

      SecureLogger.info('[INFO] Buscando produtos com filtros', filters);
      
      let query = supabase
        .from('products')
        .select('*');

      // Aplicar filtros
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      // Aplicar ordenação
      if (filters?.sortBy && filters?.sortDirection) {
        query = query.order(filters.sortBy, { ascending: filters.sortDirection === 'asc' });
      } else {
        query = query.order('name', { ascending: true });
      }

      const { data, error } = await query;

      if (error) {
        SecureLogger.error('[ERROR] Erro ao buscar produtos', error);
        throw error;
      }

      const products = (data || []).map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        quantity: product.quantity,
        price: product.price,
        category: product.category,
        imageUrl: product.image_url,
        minimumStock: product.minimum_stock,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
        createdBy: product.created_by,
        lastModifiedBy: product.last_modified_by,
      })) as Product[];

      // Cache por 2 minutos
      cacheService.set(cacheKey, products, 120);
      
      SecureLogger.success(`[SUCCESS] ${products.length} produtos carregados`);
      return products;
    } catch (error) {
      SecureLogger.error('[ERROR] Erro no serviço de produtos', error);
      throw error;
    }
  },

  /**
   * Obter produtos com estoque baixo - corrigida a query
   */
  async getLowStockProducts(): Promise<Product[]> {
    try {
      const cacheKey = 'low_stock_products';
      const cached = cacheService.get<Product[]>(cacheKey);
      
      if (cached) {
        SecureLogger.info('[CACHE] Produtos com estoque baixo carregados do cache');
        return cached;
      }

      SecureLogger.info('[INFO] Buscando produtos com estoque baixo');
      
      // Usar a função do banco que já existe
      const { data, error } = await supabase.rpc('get_low_stock_products');

      if (error) {
        SecureLogger.error('[ERROR] Erro ao buscar produtos com estoque baixo', error);
        throw error;
      }

      const products = (data || []).map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        quantity: product.quantity,
        price: product.price,
        category: product.category,
        imageUrl: product.image_url,
        minimumStock: product.minimum_stock,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
        createdBy: product.created_by,
        lastModifiedBy: product.last_modified_by,
      })) as Product[];

      // Cache por 2 minutos
      cacheService.set(cacheKey, products, 120);
      
      SecureLogger.success(`[SUCCESS] ${products.length} produtos com estoque baixo carregados`);
      return products;
    } catch (error) {
      SecureLogger.error('[ERROR] Erro ao buscar produtos com estoque baixo', error);
      return []; // Retornar array vazio em caso de erro
    }
  },

  /**
   * Validar movimentação de estoque
   */
  async validateMovement(productId: string, quantity: number, type: 'in' | 'out'): Promise<MovementValidation> {
    try {
      if (type === 'in') {
        return { valid: true };
      }

      // Para saídas, verificar se há estoque suficiente
      const { data: product, error } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', productId)
        .single();

      if (error) {
        return { 
          valid: false, 
          message: 'Produto não encontrado' 
        };
      }

      const currentStock = product.quantity;
      
      if (currentStock < quantity) {
        return {
          valid: false,
          message: `Estoque insuficiente. Disponível: ${currentStock}, Solicitado: ${quantity}`,
          currentStock
        };
      }

      return { 
        valid: true, 
        currentStock 
      };
    } catch (error) {
      SecureLogger.error('[ERROR] Erro na validação de movimentação', error);
      return { 
        valid: false, 
        message: 'Erro interno na validação' 
      };
    }
  },

  /**
   * Limpar cache específico ou todo o cache
   */
  clearCache(cacheKey?: string): void {
    if (cacheKey) {
      cacheService.delete(cacheKey);
      SecureLogger.info(`[CACHE] Cache limpo para: ${cacheKey}`);
    } else {
      cacheService.clear();
      SecureLogger.info('[CACHE] Todo o cache foi limpo');
    }
  },

  /**
   * Obter estatísticas do cache para debug
   */
  getCacheStats(): { keys: string[], size: number } {
    const keys = cacheService.getKeys();
    return {
      keys,
      size: keys.length
    };
  }
};
