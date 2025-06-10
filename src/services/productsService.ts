
import { supabase } from "@/integrations/supabase/client";
import { Product, FilterParams } from "@/types";
import { cacheService } from "./cacheService";

/**
 * Serviço para operações relacionadas a produtos
 */
export const ProductsService = {
  /**
   * Obter todos os produtos
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      const cacheKey = 'all_products';
      const cachedProducts = cacheService.get<Product[]>(cacheKey);
      
      if (cachedProducts) {
        console.log('Using cached products');
        return cachedProducts;
      }

      console.log('Fetching products from database');
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      const products = (data || []).map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        quantity: product.quantity,
        price: product.price,
        categoryId: product.category_id,
        imageUrl: product.image_url,
        minimumStock: product.minimum_stock,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
        createdBy: product.created_by,
        lastModifiedBy: product.last_modified_by,
      })) as Product[];

      console.log('Products fetched:', products.length);
      
      // Cache por 10 minutos
      cacheService.set(cacheKey, products, 600);
      
      return products;
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      throw error;
    }
  },

  /**
   * Obter produtos com filtros
   */
  async getProducts(filters?: FilterParams): Promise<Product[]> {
    try {
      console.log('Fetching products with filters:', filters);
      
      let query = supabase.from('products').select('*');

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.categoryId && filters.categoryId !== 'all') {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters?.sortBy) {
        const direction = filters.sortDirection || 'asc';
        if (filters.sortBy === 'created_at') {
          query = query.order('created_at', { ascending: direction === 'asc' });
        } else {
          query = query.order(filters.sortBy, { ascending: direction === 'asc' });
        }
      } else {
        query = query.order('name', { ascending: true });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      const products = (data || []).map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        quantity: product.quantity,
        price: product.price,
        categoryId: product.category_id,
        imageUrl: product.image_url,
        minimumStock: product.minimum_stock,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
        createdBy: product.created_by,
        lastModifiedBy: product.last_modified_by,
      })) as Product[];

      console.log('Products fetched:', products.length);
      return products;
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      throw error;
    }
  },

  /**
   * Obter produtos com estoque baixo
   */
  async getLowStockProducts(): Promise<Product[]> {
    try {
      const cacheKey = 'low_stock_products';
      const cached = cacheService.get<Product[]>(cacheKey);
      
      if (cached) {
        console.log('Using cached low stock products');
        return cached;
      }

      console.log('Fetching low stock products from database');
      const { data, error } = await supabase.rpc('get_low_stock_products');
      
      if (error) {
        console.error('Error fetching low stock products:', error);
        throw error;
      }

      const products = (data || []).map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        quantity: product.quantity,
        price: product.price,
        categoryId: product.category_id,
        imageUrl: product.image_url,
        minimumStock: product.minimum_stock,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
        createdBy: product.created_by,
        lastModifiedBy: product.last_modified_by,
      })) as Product[];

      console.log('Low stock products fetched:', products.length);
      
      // Cache por 2 minutos
      cacheService.set(cacheKey, products, 120);
      
      return products;
    } catch (error) {
      console.error("Erro ao buscar produtos com estoque baixo:", error);
      throw error;
    }
  },

  /**
   * Buscar estoque atual de um produto específico (sem cache)
   */
  async getCurrentStock(productId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', productId)
        .single();
      
      if (error) {
        console.error('Erro ao buscar estoque atual:', error);
        return 0;
      }
      
      return data.quantity || 0;
    } catch (error) {
      console.error('Erro ao buscar estoque atual:', error);
      return 0;
    }
  }
};
