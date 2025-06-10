
import { supabase } from "@/integrations/supabase/client";
import { Product, StockMovement, FilterParams, DashboardStats } from "@/types";
import { cacheService } from "./cacheService";
import { SecureLogger } from "./secureLogger";

/**
 * Camada de serviço melhorada para abstrair operações de banco de dados com cache e tratamento de erros
 */
export const ApiService = {
  /**
   * Obter estatísticas do dashboard - otimizado com requisições paralelas e cache
   */
  async getDashboardStats(skipCache: boolean = false): Promise<DashboardStats> {
    try {
      const cacheKey = 'dashboard_stats';
      
      // Retornar do cache se disponível e não expirado
      if (!skipCache) {
        const cachedStats = cacheService.get<DashboardStats>(cacheKey);
        if (cachedStats) {
          SecureLogger.info('Estatísticas carregadas do cache');
          return cachedStats;
        }
      }
      
      SecureLogger.info('Buscando estatísticas do dashboard via RPC');
      
      // Usar função RPC otimizada do Supabase
      const { data, error } = await supabase.rpc('get_dashboard_stats');

      if (error) {
        SecureLogger.error('Erro ao buscar estatísticas via RPC', error);
        throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
      }

      const stats: DashboardStats = {
        totalProducts: Number(data?.totalProducts) || 0,
        lowStockProducts: Number(data?.lowStockProducts) || 0,
        totalValue: Number(data?.totalValue) || 0,
        recentMovementsCount: Number(data?.recentMovementsCount) || 0,
      };
      
      // Armazenar em cache por 2 minutos
      cacheService.set(cacheKey, stats, 120);
      SecureLogger.success('Estatísticas obtidas com sucesso');
      
      return stats;
    } catch (error) {
      SecureLogger.error("Erro ao buscar estatísticas do dashboard:", error);
      
      // Retornar valores padrão em caso de erro
      const fallbackStats: DashboardStats = {
        totalProducts: 0,
        lowStockProducts: 0,
        totalValue: 0,
        recentMovementsCount: 0,
      };
      
      return fallbackStats;
    }
  },

  /**
   * Obter produtos com estoque baixo com melhoria no cache
   */
  async getLowStockProducts(limit: number = 5, skipCache: boolean = false): Promise<Product[]> {
    try {
      const cacheKey = `low_stock_products_${limit}`;
      
      if (!skipCache) {
        const cachedProducts = cacheService.get<Product[]>(cacheKey);
        if (cachedProducts) {
          return cachedProducts;
        }
      }
      
      SecureLogger.info('Buscando produtos com estoque baixo via RPC');
      
      // Usar função RPC para buscar produtos com estoque baixo
      const { data, error } = await supabase
        .rpc('get_low_stock_products')
        .order("quantity")
        .limit(limit);

      if (error) {
        SecureLogger.error('Erro ao buscar produtos com estoque baixo', error);
        throw error;
      }
      
      // Converter modelo do banco para nossa interface Product
      const products = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        quantity: item.quantity,
        price: item.price,
        category: item.category || undefined,
        imageUrl: item.image_url || undefined,
        minimumStock: item.minimum_stock || undefined,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
      
      // Cache por 2 minutos
      cacheService.set(cacheKey, products, 120);
      SecureLogger.success(`${products.length} produtos com estoque baixo encontrados`);
      
      return products;
    } catch (error) {
      SecureLogger.error('Erro ao buscar produtos com estoque baixo', error);
      return [];
    }
  },

  /**
   * Obter movimentações recentes de estoque com melhor tratamento de erro e cache
   */
  async getRecentMovements(limit: number = 10, skipCache: boolean = false): Promise<StockMovement[]> {
    try {
      const cacheKey = `recent_movements_${limit}`;
      
      if (!skipCache) {
        const cachedMovements = cacheService.get<StockMovement[]>(cacheKey);
        if (cachedMovements) {
          return cachedMovements;
        }
      }
      
      SecureLogger.info('Buscando movimentações recentes');
      
      const { data, error } = await supabase
        .from("stock_movements")
        .select(`
          id,
          product_id,
          quantity,
          type,
          date,
          notes,
          user_id,
          products(name)
        `)
        .order("date", { ascending: false })
        .limit(limit);

      if (error) {
        SecureLogger.error('Erro ao buscar movimentações', error);
        throw error;
      }
      
      if (!data) return [];

      const movements = data.map(movement => ({
        id: movement.id,
        productId: movement.product_id,
        productName: movement.products?.name || 'Produto desconhecido',
        quantity: movement.quantity,
        type: movement.type as 'in' | 'out',
        date: movement.date,
        notes: movement.notes || undefined,
        userId: movement.user_id || undefined,
      }));
      
      // Cache por 1 minuto
      cacheService.set(cacheKey, movements, 60);
      SecureLogger.success(`${movements.length} movimentações recentes carregadas`);
      
      return movements;
    } catch (error) {
      SecureLogger.error('Erro ao buscar movimentações recentes', error);
      return [];
    }
  },

  /**
   * Obter produtos com filtragem, paginação e melhor performance com cache
   */
  async getProducts(filters?: FilterParams, skipCache: boolean = false): Promise<Product[]> {
    try {
      // Criar chave de cache baseada nos filtros
      const cacheKey = `products_${JSON.stringify(filters || {})}`;
      
      if (!skipCache) {
        const cachedProducts = cacheService.get<Product[]>(cacheKey);
        if (cachedProducts) {
          return cachedProducts;
        }
      }
      
      SecureLogger.info('Buscando produtos com filtros', filters);
      
      let query = supabase.from('products').select('*');

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      
      // Aplicar ordenação se fornecida
      if (filters?.sortBy) {
        const direction = filters?.sortDirection || 'asc';
        query = query.order(filters.sortBy, { ascending: direction === 'asc' });
      } else {
        query = query.order('name');
      }
      
      const { data, error } = await query;

      if (error) {
        SecureLogger.error('Erro ao buscar produtos', error);
        throw new Error(`Erro ao buscar produtos: ${error.message}`);
      }
      
      if (!data) return [];

      const products = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        quantity: item.quantity,
        price: item.price,
        category: item.category || undefined,
        imageUrl: item.image_url || undefined,
        minimumStock: item.minimum_stock || undefined,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
      
      // Cache por 2 minutos
      cacheService.set(cacheKey, products, 120);
      SecureLogger.success(`${products.length} produtos carregados`);
      
      return products;
    } catch (error) {
      SecureLogger.error('Erro ao buscar produtos', error);
      return [];
    }
  },

  /**
   * Obter categorias de produtos - Otimizado com consulta direta e cache
   */
  async getCategories(skipCache: boolean = false): Promise<string[]> {
    try {
      const cacheKey = 'product_categories';
      
      if (!skipCache) {
        const cachedCategories = cacheService.get<string[]>(cacheKey);
        if (cachedCategories) {
          return cachedCategories;
        }
      }
      
      SecureLogger.info('Buscando categorias de produtos');
      
      // Usar consulta SQL direta para buscar categorias distintas
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .not('name', 'is', null)
        .order('name');
      
      if (error) {
        SecureLogger.error('Erro ao buscar categorias', error);
        throw error;
      }
      
      if (!data) return [];
      
      // Extrair valores de categoria e filtrar valores nulos
      const categories = data
        .map(item => item.name)
        .filter(Boolean) as string[];
      
      // Cache por 10 minutos (categorias mudam com pouca frequência)
      cacheService.set(cacheKey, categories, 600);
      SecureLogger.success(`${categories.length} categorias carregadas`);
      
      return categories;
    } catch (error) {
      SecureLogger.error('Erro ao buscar categorias', error);
      return [];
    }
  },

  /**
   * Verificar se produto tem estoque suficiente para saída
   */
  async checkStockAvailability(productId: string, quantity: number): Promise<boolean> {
    try {
      SecureLogger.info(`Verificando estoque para produto ${productId}: ${quantity} unidades`);
      
      const { data, error } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', productId)
        .single();

      if (error) {
        SecureLogger.error('Erro ao verificar estoque', error);
        return false;
      }

      const available = data?.quantity || 0;
      const hasStock = available >= quantity;
      
      SecureLogger.info(`Estoque disponível: ${available}, solicitado: ${quantity}, suficiente: ${hasStock}`);
      
      return hasStock;
    } catch (error) {
      SecureLogger.error('Erro ao verificar disponibilidade de estoque', error);
      return false;
    }
  },

  /**
   * Validar movimentação antes de processar
   */
  async validateMovement(productId: string, quantity: number, type: 'in' | 'out'): Promise<{ valid: boolean; message?: string }> {
    try {
      if (type === 'out') {
        const hasStock = await this.checkStockAvailability(productId, quantity);
        if (!hasStock) {
          const { data } = await supabase
            .from('products')
            .select('quantity, name')
            .eq('id', productId)
            .single();
            
          return {
            valid: false,
            message: `Estoque insuficiente. Disponível: ${data?.quantity || 0} unidades de ${data?.name || 'produto'}`
          };
        }
      }
      
      return { valid: true };
    } catch (error) {
      SecureLogger.error('Erro ao validar movimentação', error);
      return { valid: false, message: 'Erro interno ao validar movimentação' };
    }
  },
  
  /**
   * Limpar o cache para uma chave específica ou para todas as chaves
   */
  clearCache(cacheKey?: string): void {
    if (cacheKey) {
      cacheService.delete(cacheKey);
      SecureLogger.info(`Cache limpo para chave: ${cacheKey}`);
    } else {
      cacheService.clear();
      SecureLogger.info('Cache geral limpo');
    }
  }
};
