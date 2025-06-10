
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

      // Verificar se data existe e fazer type assertion segura
      if (!data) {
        throw new Error('Nenhum dado retornado da função RPC');
      }

      // Type assertion segura - assumindo que o RPC retorna um objeto
      const statsData = data as any;

      const stats: DashboardStats = {
        totalProducts: Number(statsData?.totalProducts) || 0,
        lowStockProducts: Number(statsData?.lowStockProducts) || 0,
        totalValue: Number(statsData?.totalValue) || 0,
        recentMovementsCount: Number(statsData?.recentMovementsCount) || 0,
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
      const { data, error } = await supabase.rpc('get_low_stock_products');

      if (error) {
        SecureLogger.error('Erro ao buscar produtos com estoque baixo', error);
        throw error;
      }
      
      if (!data) return [];
      
      // Converter modelo do banco para nossa interface Product
      const products = data.slice(0, limit).map((item: any) => ({
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
   * Criar produto com validação
   */
  async createProduct(productData: {
    name: string;
    description?: string;
    quantity: number;
    price: number;
    category?: string;
    minimumStock?: number;
    imageUrl?: string;
  }): Promise<Product> {
    try {
      SecureLogger.info('Criando novo produto', productData);
      
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          description: productData.description || '',
          quantity: productData.quantity,
          price: productData.price,
          category: productData.category,
          minimum_stock: productData.minimumStock || 5,
          image_url: productData.imageUrl
        }])
        .select()
        .single();

      if (error) {
        SecureLogger.error('Erro ao criar produto', error);
        throw new Error(`Erro ao criar produto: ${error.message}`);
      }

      const product: Product = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        quantity: data.quantity,
        price: data.price,
        category: data.category || undefined,
        imageUrl: data.image_url || undefined,
        minimumStock: data.minimum_stock || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      // Limpar cache relacionado
      this.clearCache('products_');
      this.clearCache('dashboard_stats');
      
      SecureLogger.success('Produto criado com sucesso');
      return product;
    } catch (error) {
      SecureLogger.error('Erro ao criar produto', error);
      throw error;
    }
  },

  /**
   * Atualizar produto
   */
  async updateProduct(productId: string, updates: Partial<{
    name: string;
    description: string;
    quantity: number;
    price: number;
    category: string;
    minimumStock: number;
    imageUrl: string;
  }>): Promise<Product> {
    try {
      SecureLogger.info(`Atualizando produto ${productId}`, updates);
      
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.minimumStock !== undefined) updateData.minimum_stock = updates.minimumStock;
      if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        SecureLogger.error('Erro ao atualizar produto', error);
        throw new Error(`Erro ao atualizar produto: ${error.message}`);
      }

      const product: Product = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        quantity: data.quantity,
        price: data.price,
        category: data.category || undefined,
        imageUrl: data.image_url || undefined,
        minimumStock: data.minimum_stock || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      // Limpar cache relacionado
      this.clearCache('products_');
      this.clearCache('dashboard_stats');
      this.clearCache('low_stock_products');
      
      SecureLogger.success('Produto atualizado com sucesso');
      return product;
    } catch (error) {
      SecureLogger.error('Erro ao atualizar produto', error);
      throw error;
    }
  },

  /**
   * Deletar produto
   */
  async deleteProduct(productId: string): Promise<void> {
    try {
      SecureLogger.info(`Deletando produto ${productId}`);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        SecureLogger.error('Erro ao deletar produto', error);
        throw new Error(`Erro ao deletar produto: ${error.message}`);
      }

      // Limpar cache relacionado
      this.clearCache('products_');
      this.clearCache('dashboard_stats');
      this.clearCache('low_stock_products');
      
      SecureLogger.success('Produto deletado com sucesso');
    } catch (error) {
      SecureLogger.error('Erro ao deletar produto', error);
      throw error;
    }
  },

  /**
   * Criar movimentação de estoque
   */
  async createStockMovement(movementData: {
    productId: string;
    quantity: number;
    type: 'in' | 'out';
    notes?: string;
    supplierId?: string;
  }): Promise<StockMovement> {
    try {
      SecureLogger.info('Criando movimentação de estoque', movementData);
      
      // Validar movimentação antes de criar
      const validation = await this.validateMovement(
        movementData.productId, 
        movementData.quantity, 
        movementData.type
      );
      
      if (!validation.valid) {
        throw new Error(validation.message || 'Movimentação inválida');
      }

      const { data, error } = await supabase
        .from('stock_movements')
        .insert([{
          product_id: movementData.productId,
          quantity: movementData.quantity,
          type: movementData.type,
          notes: movementData.notes,
          supplier_id: movementData.supplierId,
          date: new Date().toISOString()
        }])
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
        .single();

      if (error) {
        SecureLogger.error('Erro ao criar movimentação', error);
        throw new Error(`Erro ao criar movimentação: ${error.message}`);
      }

      const movement: StockMovement = {
        id: data.id,
        productId: data.product_id,
        productName: data.products?.name || 'Produto desconhecido',
        quantity: data.quantity,
        type: data.type as 'in' | 'out',
        date: data.date,
        notes: data.notes || undefined,
        userId: data.user_id || undefined,
      };

      // Limpar cache relacionado
      this.clearCache('recent_movements');
      this.clearCache('dashboard_stats');
      this.clearCache('products_');
      
      SecureLogger.success('Movimentação criada com sucesso');
      return movement;
    } catch (error) {
      SecureLogger.error('Erro ao criar movimentação', error);
      throw error;
    }
  },
  
  /**
   * Limpar o cache para uma chave específica ou para todas as chaves
   */
  clearCache(cacheKey?: string): void {
    if (cacheKey) {
      // Se for uma chave parcial (termina com _), limpar todas as chaves que começam com ela
      if (cacheKey.endsWith('_')) {
        const keys = cacheService.getKeys();
        keys.forEach(key => {
          if (key.startsWith(cacheKey)) {
            cacheService.delete(key);
          }
        });
        SecureLogger.info(`Cache limpo para chaves que começam com: ${cacheKey}`);
      } else {
        cacheService.delete(cacheKey);
        SecureLogger.info(`Cache limpo para chave: ${cacheKey}`);
      }
    } else {
      cacheService.clear();
      SecureLogger.info('Cache geral limpo');
    }
  }
};
