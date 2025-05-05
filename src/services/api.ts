
import { supabase } from "@/integrations/supabase/client";
import { Product, StockMovement, FilterParams, DashboardStats } from "@/types";

/**
 * Service layer to abstract database operations
 */
export const ApiService = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch total products count
      const { count: totalProducts, error: productsError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      if (productsError) throw productsError;

      // Fetch low stock products count
      const { count: lowStockProducts, error: lowStockError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .lt("quantity", 10);

      if (lowStockError) throw lowStockError;

      // Calculate total stock value
      const { data: products, error: valueError } = await supabase
        .from("products")
        .select("quantity, price");

      if (valueError) throw valueError;

      const totalValue = products.reduce(
        (sum, product) => sum + product.quantity * product.price,
        0
      );

      // Fetch recent movements count
      const { count: recentMovementsCount, error: movementsError } = await supabase
        .from("stock_movements")
        .select("*", { count: "exact", head: true })
        .order("date", { ascending: false })
        .limit(10);

      if (movementsError) throw movementsError;

      return {
        totalProducts: totalProducts || 0,
        lowStockProducts: lowStockProducts || 0,
        totalValue,
        recentMovementsCount: recentMovementsCount || 0,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  /**
   * Get low stock products
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
   * Get recent stock movements
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
   * Get products with filtering and pagination
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
   * Get product categories
   */
  async getCategories(): Promise<string[]> {
    // Use direct SQL query to fetch distinct categories
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null)
      .order('category');
    
    if (error) throw error;
    
    // Extract category values and filter out any null values
    return data
      .map(item => item.category)
      .filter(Boolean) as string[];
  }
};
