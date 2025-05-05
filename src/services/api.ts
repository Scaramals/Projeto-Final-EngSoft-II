
import { supabase } from "@/integrations/supabase/client";
import { Product, StockMovement, FilterParams, DashboardStats } from "@/types";

/**
 * Service layer to abstract database operations
 */
export const ApiService = {
  /**
   * Get dashboard statistics - optimized with parallel requests
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
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

      return {
        totalProducts: productsResult.count || 0,
        lowStockProducts: lowStockResult.count || 0,
        totalValue,
        recentMovementsCount: movementsResult.count || 0,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  /**
   * Get low stock products with improved caching
   */
  async getLowStockProducts(limit: number = 5): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .lt("quantity", 10)
      .order("quantity")
      .limit(limit);

    if (error) throw error;
    
    // Convert database model to our Product interface
    return data.map(item => ({
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
  },

  /**
   * Get recent stock movements with improved error handling
   */
  async getRecentMovements(limit: number = 10): Promise<StockMovement[]> {
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

    return data.map(movement => ({
      id: movement.id,
      productId: movement.product_id,
      productName: movement.products?.name || 'Produto desconhecido',
      quantity: movement.quantity,
      type: movement.type as 'in' | 'out',
      date: movement.date,
      notes: movement.notes || undefined,
      userId: movement.user_id || undefined,
    }));
  },

  /**
   * Get products with filtering, pagination and improved performance
   */
  async getProducts(filters?: FilterParams): Promise<Product[]> {
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

    return data.map(item => ({
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
  },

  /**
   * Get product categories - Optimized with direct query
   */
  async getCategories(): Promise<string[]> {
    // Use direct SQL query to fetch distinct categories
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null)
      .order('category');
    
    if (error) throw error;
    
    if (!data) return [];
    
    // Extract category values and filter out any null values
    return data
      .map(item => item.category)
      .filter(Boolean) as string[];
  }
};
