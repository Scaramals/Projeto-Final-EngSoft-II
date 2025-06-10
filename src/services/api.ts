import { supabase } from "@/integrations/supabase/client";
import { Product, StockMovement, FilterParams, Supplier, Category } from "@/types";
import { cacheService } from "./cacheService";
import { SecureLogger } from "./secureLogger";

/**
 * Serviço principal da API para interações com o Supabase
 */
export const ApiService = {
  /**
   * Obter categorias distintas da tabela categories
   */
  async getDistinctCategories(): Promise<Array<{id: string, name: string}>> {
    try {
      const cacheKey = 'distinct_categories';
      const cached = cacheService.get<Array<{id: string, name: string}>>(cacheKey);
      
      if (cached) {
        console.log('Using cached distinct categories');
        return cached;
      }

      console.log('Fetching distinct categories from database');
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      const categories = (data || []).map(cat => ({
        id: cat.id,
        name: cat.name
      }));

      console.log('Categories fetched:', categories);
      
      // Cache por 5 minutos
      cacheService.set(cacheKey, categories, 300);
      
      return categories;
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      throw error;
    }
  },

  /**
   * Obter nome da categoria pelo ID
   */
  async getCategoryNameById(categoryId: string): Promise<string> {
    try {
      const cacheKey = `category_name_${categoryId}`;
      const cached = cacheService.get<string>(cacheKey);
      
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single();
      
      if (error) {
        console.error('Error fetching category name:', error);
        return 'Categoria não encontrada';
      }

      const categoryName = data?.name || 'Categoria não encontrada';
      
      // Cache por 10 minutos
      cacheService.set(cacheKey, categoryName, 600);
      
      return categoryName;
    } catch (error) {
      console.error("Erro ao buscar nome da categoria:", error);
      return 'Categoria não encontrada';
    }
  },

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
   * Obter todos os fornecedores
   */
  async getAllSuppliers(): Promise<Supplier[]> {
    try {
      const cacheKey = 'all_suppliers';
      const cachedSuppliers = cacheService.get<Supplier[]>(cacheKey);
      
      if (cachedSuppliers) {
        console.log('Using cached suppliers');
        return cachedSuppliers;
      }

      console.log('Fetching suppliers from database');
      const { data, error } = await supabase
        .from('suppliers')
        .select('*');
      
      if (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
      }

      const suppliers = (data || []).map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
        cnpj: supplier.cnpj,
        contactName: supplier.contact_name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        notes: supplier.notes,
        createdAt: supplier.created_at,
        updatedAt: supplier.updated_at,
        createdBy: supplier.created_by,
        lastModifiedBy: supplier.last_modified_by,
      })) as Supplier[];

      console.log('Suppliers fetched:', suppliers.length);
      
      // Cache por 10 minutos
      cacheService.set(cacheKey, suppliers, 600);
      
      return suppliers;
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error);
      throw error;
    }
  },

  /**
   * Obter todos os movimentos de estoque
   */
  async getAllStockMovements(): Promise<StockMovement[]> {
    try {
      const cacheKey = 'all_stock_movements';
      const cachedMovements = cacheService.get<StockMovement[]>(cacheKey);
      
      if (cachedMovements) {
        console.log('Using cached stock movements');
        return cachedMovements;
      }

      console.log('Fetching stock movements from database');
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*');
      
      if (error) {
        console.error('Error fetching stock movements:', error);
        throw error;
      }

       const stockMovements = (data || []).map((movement) => ({
        id: movement.id,
        productId: movement.product_id,
        quantity: movement.quantity,
        type: movement.type as 'in' | 'out',
        date: movement.date,
        supplierId: movement.supplier_id,
        notes: movement.notes,
        userId: movement.user_id,
        createdBy: movement.created_by,
        updatedAt: movement.updated_at,
        // Remove as propriedades que não existem na tabela
        // productName e supplierName devem ser buscados via JOIN ou separadamente
      })) as StockMovement[];

      console.log('Stock movements fetched:', stockMovements.length);
      
      // Cache por 5 minutos
      cacheService.set(cacheKey, stockMovements, 300);
      
      return stockMovements;
    } catch (error) {
      console.error("Erro ao buscar movimentos de estoque:", error);
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
        categoryId: product.category_id, // Usar category_id da nova estrutura
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
        categoryId: product.category_id, // Usar category_id
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
   * Validar movimentação de estoque
   */
  async validateMovement(productId: string, quantity: number, type: 'in' | 'out'): Promise<{valid: boolean, message?: string}> {
    try {
      if (type === 'out') {
        const { data: product, error } = await supabase
          .from('products')
          .select('quantity, name')
          .eq('id', productId)
          .single();
        
        if (error) {
          return { valid: false, message: 'Produto não encontrado' };
        }
        
        if (product.quantity < quantity) {
          return { 
            valid: false, 
            message: `Estoque insuficiente. Disponível: ${product.quantity}, Solicitado: ${quantity}` 
          };
        }
      }
      
      return { valid: true };
    } catch (error) {
      console.error("Erro ao validar movimentação:", error);
      return { valid: false, message: 'Erro na validação' };
    }
  },

  /**
   * Limpar cache
   */
  clearCache(): void {
    console.log('Clearing API cache');
    cacheService.clear();
  }
};
