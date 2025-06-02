
import { supabase } from "@/integrations/supabase/client";
import { Product, StockMovement, FilterParams, DashboardStats } from "@/types";
import { cacheService } from "./cacheService";

/**
 * Camada de serviço para abstrair operações de banco de dados com cache
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
          return cachedStats;
        }
      }
      
      // Usar Promise.all para executar consultas em paralelo
      const [
        productsResult,
        lowStockResult,
        valueResult,
        movementsResult
      ] = await Promise.all([
        // Contagem total de produtos
        supabase.from("products").select("*", { count: "exact", head: true }),
        
        // Contagem de produtos com estoque baixo usando consulta SQL direta
        supabase.from("products")
          .select("*", { count: "exact", head: true })
          .filter("quantity", "lte", "minimum_stock")
          .gt("quantity", 0),
        
        // Buscar dados para cálculo do valor total
        supabase.from("products").select("quantity, price"),
        
        // Contagem de movimentações recentes
        supabase.from("stock_movements")
          .select("*", { count: "exact", head: true })
          .order("date", { ascending: false })
          .limit(10)
      ]);

      // Tratar possíveis erros
      if (productsResult.error) throw productsResult.error;
      if (lowStockResult.error) throw lowStockResult.error;
      if (valueResult.error) throw valueResult.error;
      if (movementsResult.error) throw movementsResult.error;

      // Calcular valor total
      const totalValue = valueResult.data.reduce(
        (sum, product) => sum + product.quantity * product.price,
        0
      );

      const stats = {
        totalProducts: productsResult.count || 0,
        lowStockProducts: lowStockResult.count || 0,
        totalValue,
        recentMovementsCount: movementsResult.count || 0,
      };
      
      // Armazenar em cache por 2 minutos
      cacheService.set(cacheKey, stats, 120);
      
      return stats;
    } catch (error) {
      console.error("Erro ao buscar estatísticas do dashboard:", error);
      throw error;
    }
  },

  /**
   * Obter produtos com estoque baixo com melhoria no cache
   */
  async getLowStockProducts(limit: number = 5, skipCache: boolean = false): Promise<Product[]> {
    const cacheKey = `low_stock_products_${limit}`;
    
    if (!skipCache) {
      const cachedProducts = cacheService.get<Product[]>(cacheKey);
      if (cachedProducts) {
        return cachedProducts;
      }
    }
    
    // Use uma consulta SQL direta que compara quantity com minimum_stock
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .filter("quantity", "lte", "minimum_stock")
      .gt("quantity", 0)
      .order("quantity")
      .limit(limit);

    if (error) throw error;
    
    // Converter modelo do banco para nossa interface Product
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
    
    return products;
  },

  /**
   * Obter movimentações recentes de estoque com melhor tratamento de erro e cache
   */
  async getRecentMovements(limit: number = 10, skipCache: boolean = false): Promise<StockMovement[]> {
    const cacheKey = `recent_movements_${limit}`;
    
    if (!skipCache) {
      const cachedMovements = cacheService.get<StockMovement[]>(cacheKey);
      if (cachedMovements) {
        return cachedMovements;
      }
    }
    
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

    if (error) throw error;
    
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
    
    return movements;
  },

  /**
   * Obter produtos com filtragem, paginação e melhor performance com cache
   */
  async getProducts(filters?: FilterParams, skipCache: boolean = false): Promise<Product[]> {
    // Criar chave de cache baseada nos filtros
    const cacheKey = `products_${JSON.stringify(filters || {})}`;
    
    if (!skipCache) {
      const cachedProducts = cacheService.get<Product[]>(cacheKey);
      if (cachedProducts) {
        return cachedProducts;
      }
    }
    
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
    
    return products;
  },

  /**
   * Obter categorias de produtos - Otimizado com consulta direta e cache
   */
  async getCategories(skipCache: boolean = false): Promise<string[]> {
    const cacheKey = 'product_categories';
    
    if (!skipCache) {
      const cachedCategories = cacheService.get<string[]>(cacheKey);
      if (cachedCategories) {
        return cachedCategories;
      }
    }
    
    // Usar consulta SQL direta para buscar categorias distintas
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .not('name', 'is', null)
      .order('name');
    
    if (error) throw error;
    
    if (!data) return [];
    
    // Extrair valores de categoria e filtrar valores nulos
    const categories = data
      .map(item => item.name)
      .filter(Boolean) as string[];
    
    // Cache por 10 minutos (categorias mudam com pouca frequência)
    cacheService.set(cacheKey, categories, 600);
    
    return categories;
  },
  
  /**
   * Limpar o cache para uma chave específica ou para todas as chaves
   */
  clearCache(cacheKey?: string): void {
    if (cacheKey) {
      cacheService.delete(cacheKey);
    } else {
      cacheService.clear();
    }
  }
};
