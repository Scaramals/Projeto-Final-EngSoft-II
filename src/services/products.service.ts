
import { supabase } from "@/integrations/supabase/client";
import { cacheService } from "./cacheService";
import { Product, FilterParams } from "@/types";

export const ProductsService = {
  async getAllProducts(filters?: FilterParams): Promise<Product[]> {
    const cacheKey = `products_${JSON.stringify(filters || {})}`;
    const cached = cacheService.get<Product[]>(cacheKey);
    
    if (cached) {
      console.log('✅ Products from cache');
      return cached;
    }

    console.log('🔄 Fetching products from database');
    let query = supabase.from('products').select('*');

    // Apply filters
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.categoryId && filters.categoryId !== 'all') {
      query = query.eq('category_id', filters.categoryId);
    }

    // Apply sorting
    if (filters?.sortBy) {
      query = query.order(filters.sortBy, { 
        ascending: filters.sortDirection === 'asc' 
      });
    } else {
      query = query.order('name', { ascending: true });
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching products:', error);
      throw error;
    }

    const products = (data || []).map(product => ({
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

    console.log('✅ Products fetched:', products.length);
    cacheService.set(cacheKey, products, 180000); // 3 min cache
    return products;
  },

  async getProductById(id: string): Promise<Product | null> {
    const cacheKey = `product_${id}`;
    const cached = cacheService.get<Product>(cacheKey);
    
    if (cached) {
      console.log('✅ Product from cache');
      return cached;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      console.error('❌ Product not found:', error);
      return null;
    }

    const product = {
      id: data.id,
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      price: data.price,
      categoryId: data.category_id,
      imageUrl: data.image_url,
      minimumStock: data.minimum_stock,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      lastModifiedBy: data.last_modified_by,
    } as Product;

    cacheService.set(cacheKey, product, 300000); // 5 min cache
    return product;
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        description: productData.description,
        quantity: productData.quantity,
        price: productData.price,
        category_id: productData.categoryId,
        image_url: productData.imageUrl,
        minimum_stock: productData.minimumStock,
        created_by: productData.createdBy,
        last_modified_by: productData.lastModifiedBy
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Clear cache
    cacheService.deleteByPattern('products_');
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      price: data.price,
      categoryId: data.category_id,
      imageUrl: data.image_url,
      minimumStock: data.minimum_stock,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      lastModifiedBy: data.last_modified_by,
    } as Product;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({
        name: updates.name,
        description: updates.description,
        quantity: updates.quantity,
        price: updates.price,
        category_id: updates.categoryId,
        image_url: updates.imageUrl,
        minimum_stock: updates.minimumStock,
        last_modified_by: updates.lastModifiedBy
      })
      .eq('id', id);
    
    if (error) throw error;
    
    // Clear cache
    cacheService.deleteByPattern('products_');
    cacheService.delete(`product_${id}`);
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Clear cache
    cacheService.deleteByPattern('products_');
    cacheService.delete(`product_${id}`);
  }
};
