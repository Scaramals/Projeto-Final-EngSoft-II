
import { supabase } from "@/integrations/supabase/client";
import { Product, StockMovement, FilterParams, DashboardStats } from "@/types";
import { cacheService } from "./cacheService";

/**
 * Service layer to abstract database operations with cache
 */
export const ApiService = {
  /**
   * Get dashboard statistics - optimized with parallel requests and cache
   */
  async getDashboardStats(skipCache: boolean = false): Promise<DashboardStats> {
    try {
      const cacheKey = 'dashboard_stats';
      
      // Return from cache if available and not expired
      if (!skipCache) {
        const cachedStats = cacheService.get<DashboardStats>(cacheKey);
        if (cachedStats) {
          return cachedStats;
        }
      }
      
      // Use Promise.all to run queries in parallel
      const [
        productsResult,
        lowStockResult,
        valueResult,
        movementsResult
      ] = await Promise.all([
        // Total products count
        supabase.from("products").select("*", { count: "exact", head: true }),
        
        // Low stock products count
        supabase.from("products").select("*", { count: "exact", head: true }).lt("quantity", 10),
        
        // Fetch data for total value calculation 
        supabase.from("products").select("quantity, price"),
        
        // Recent movements count
        supabase.from("stock_movements")
          .select("*", { count: "exact", head: true })
          .order("date", { ascending: false })
          .limit(10)
      ]);

      // Handle potential errors
      if (productsResult.error) throw productsResult.error;
      if (lowStockResult.error) throw lowStockResult.error;
      if (valueResult.error) throw valueResult.error;
      if (movementsResult.error) throw movementsResult.error;

      // Calculate total value
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
      
      // Cache the result for 2 minutes
      cacheService.set(cacheKey, stats, 120);
      
      return stats;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  /**
   * Get low stock products with improved caching
   */
  async getLowStockProducts(limit: number = 5, skipCache: boolean = false): Promise<Product[]> {
    const cacheKey = `low_stock_products_${limit}`;
    
    if (!skipCache) {
      const cachedProducts = cacheService.get<Product[]>(cacheKey);
      if (cachedProducts) {
        return cachedProducts;
      }
    }
    
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .lt("quantity", 10)
      .order("quantity")
      .limit(limit);

    if (error) throw error;
    
    // Convert database model to our Product interface
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
    
    // Cache for 2 minutes
    cacheService.set(cacheKey, products, 120);
    
    return products;
  },

  /**
   * Get recent stock movements with improved error handling and caching
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
    
    // Cache for 1 minuto
    cacheService.set(cacheKey, movements, 60);
    
    return movements;
  },

  /**
   * Get products with filtering, pagination and improved performance with cache
   */
  async getProducts(filters?: FilterParams, skipCache: boolean = false): Promise<Product[]> {
    // Create cache key based on filters
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
    
    // Apply sorting if provided
    if (filters?.sortBy) {
      const direction = filters?.sortDirection || 'asc';
      query = query.order(filters.sortBy, { ascending: direction === 'asc' });
    } else {
      query = query.order('name');
    }
    
    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
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
    
    // Cache for 2 minutos
    cacheService.set(cacheKey, products, 120);
    
    return products;
  },

  /**
   * Get product categories - Optimized with direct query and cache
   */
  async getCategories(skipCache: boolean = false): Promise<string[]> {
    const cacheKey = 'product_categories';
    
    if (!skipCache) {
      const cachedCategories = cacheService.get<string[]>(cacheKey);
      if (cachedCategories) {
        return cachedCategories;
      }
    }
    
    // Use direct SQL query para buscar categorias distintas
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null)
      .order('category');
    
    if (error) throw error;
    
    if (!data) return [];
    
    // Extract category values and filter out any null values
    const categories = data
      .map(item => item.category)
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
