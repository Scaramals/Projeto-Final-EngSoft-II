import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product, StockMovement, FilterParams } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { SecureLogger } from "@/services/secureLogger";
import { ApiService } from "@/services/api";
import { toast } from "sonner";

/**
 * Helper function to convert database response to Product type
 */
const mapDbProductToProduct = (dbProduct: any): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  description: dbProduct.description,
  quantity: dbProduct.quantity,
  price: dbProduct.price,
  categoryId: dbProduct.category_id,
  imageUrl: dbProduct.image_url,
  minimumStock: dbProduct.minimum_stock,
  createdAt: dbProduct.created_at,
  updatedAt: dbProduct.updated_at,
  createdBy: dbProduct.created_by,
  lastModifiedBy: dbProduct.last_modified_by,
});

/**
 * Helper function to convert database response to StockMovement type
 */
const mapDbStockMovementToStockMovement = (dbMovement: any): StockMovement => ({
  id: dbMovement.id,
  productId: dbMovement.product_id,
  quantity: dbMovement.quantity,
  type: dbMovement.type as 'in' | 'out',
  date: dbMovement.date,
  notes: dbMovement.notes,
  supplierId: dbMovement.supplier_id,
  createdBy: dbMovement.created_by,
  updatedAt: dbMovement.updated_at || dbMovement.date,
  productName: dbMovement.product_name,
  supplierName: dbMovement.supplier_name,
});

/**
 * Helper function to convert Product type to database format
 */
const mapProductToDbProduct = (product: Partial<Product>, userId?: string) => {
  const dbProduct: any = {};
  
  if (product.name !== undefined) dbProduct.name = product.name;
  if (product.description !== undefined) dbProduct.description = product.description;
  if (product.quantity !== undefined) dbProduct.quantity = product.quantity;
  if (product.price !== undefined) dbProduct.price = product.price;
  if (product.categoryId !== undefined) dbProduct.category_id = product.categoryId;
  if (product.imageUrl !== undefined) dbProduct.image_url = product.imageUrl;
  if (product.minimumStock !== undefined) dbProduct.minimum_stock = product.minimumStock;
  
  if (userId) {
    dbProduct.created_by = userId;
    dbProduct.last_modified_by = userId;
  }
  
  return dbProduct;
};

/**
 * Helper function to convert StockMovement type to database format
 */
const mapStockMovementToDbStockMovement = (movement: Partial<StockMovement>, userId?: string) => {
  const dbMovement: any = {};
  
  if (movement.productId !== undefined) dbMovement.product_id = movement.productId;
  if (movement.quantity !== undefined) dbMovement.quantity = movement.quantity;
  if (movement.type !== undefined) dbMovement.type = movement.type;
  if (movement.notes !== undefined) dbMovement.notes = movement.notes;
  if (movement.supplierId !== undefined) dbMovement.supplier_id = movement.supplierId;
  
  if (userId) {
    dbMovement.created_by = userId;
    dbMovement.user_id = userId;
  }
  
  return dbMovement;
};

export function useProducts() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch all products with filtering and sorting
  const useAllProducts = (filters?: FilterParams) => {
    return useQuery({
      queryKey: ['products', filters],
      queryFn: async () => {
        try {
          return await ApiService.getProducts(filters);
        } catch (error) {
          SecureLogger.error('Erro ao buscar produtos via hook', error);
          throw error;
        }
      },
      enabled: !!user,
      staleTime: 2 * 60 * 1000, // 2 minutos
      gcTime: 5 * 60 * 1000, // 5 minutos
    });
  };

  // Fetch products by category
  const useProductsByCategory = (category: string | null) => {
    return useQuery({
      queryKey: ['products', 'category', category],
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_products_by_category', {
          category_filter: category
        });
        
        if (error) {
          throw new Error(`Error fetching products by category: ${error.message}`);
        }
        
        return data.map(mapDbProductToProduct) as Product[];
      },
      enabled: !!user && category !== undefined,
    });
  };

  // Fetch a single product by ID
  const useProduct = (productId: string | undefined) => {
    return useQuery({
      queryKey: ['products', productId],
      queryFn: async () => {
        if (!productId) throw new Error("Product ID is required");
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
          
        if (error) {
          throw new Error(`Error fetching product: ${error.message}`);
        }
        
        return mapDbProductToProduct(data);
      },
      enabled: !!user && !!productId,
    });
  };

  // Get product stock movement history
  const useProductMovements = (productId: string | undefined) => {
    return useQuery({
      queryKey: ['productMovements', productId],
      queryFn: async () => {
        if (!productId) throw new Error("ID do produto é obrigatório");
        
        SecureLogger.info('Buscando histórico de movimentações do produto');
        
        const { data, error } = await supabase.rpc('get_product_movement_history', { 
          product_id_param: productId 
        });
        
        if (error) {
          SecureLogger.error('Erro ao buscar movimentações', error);
          throw new Error(`Erro ao buscar movimentações: ${error.message}`);
        }
        
        return data.map(mapDbStockMovementToStockMovement) as StockMovement[];
      },
      enabled: !!user && !!productId,
    });
  };

  // Create a new product
  const useCreateProduct = () => {
    return useMutation({
      mutationFn: async (product: Partial<Product>) => {
        SecureLogger.info('Criando novo produto');
        
        const dbProduct = mapProductToDbProduct(product, user?.id);
        
        const { data, error } = await supabase
          .from('products')
          .insert(dbProduct)
          .select()
          .single();
          
        if (error) {
          SecureLogger.error('Erro ao criar produto', error);
          throw new Error(`Erro ao criar produto: ${error.message}`);
        }
        
        SecureLogger.success('Produto criado com sucesso');
        return mapDbProductToProduct(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        toast.success("Produto criado com sucesso!");
      },
      onError: (error: any) => {
        SecureLogger.error('Erro na criação do produto', error);
        toast.error(`Erro ao criar produto: ${error.message}`);
      }
    });
  };

  // Update an existing product
  const useUpdateProduct = () => {
    return useMutation({
      mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
        SecureLogger.info('Atualizando produto');
        
        const dbUpdates = mapProductToDbProduct(updates, user?.id);
        dbUpdates.last_modified_by = user?.id;
        
        const { data, error } = await supabase
          .from('products')
          .update(dbUpdates)
          .eq('id', id)
          .select()
          .single();
          
        if (error) {
          SecureLogger.error('Erro ao atualizar produto', error);
          throw new Error(`Erro ao atualizar produto: ${error.message}`);
        }
        
        SecureLogger.success('Produto atualizado com sucesso');
        return mapDbProductToProduct(data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        toast.success("Produto atualizado com sucesso!");
      },
      onError: (error: any) => {
        SecureLogger.error('Erro na atualização do produto', error);
        toast.error(`Erro ao atualizar produto: ${error.message}`);
      }
    });
  };

  // Delete a product
  const useDeleteProduct = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        SecureLogger.info('Excluindo produto');
        
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
          
        if (error) {
          SecureLogger.error('Erro ao excluir produto', error);
          throw new Error(`Erro ao excluir produto: ${error.message}`);
        }
        
        SecureLogger.success('Produto excluído com sucesso');
        return id;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        toast.success("Produto excluído com sucesso!");
      },
      onError: (error: any) => {
        SecureLogger.error('Erro na exclusão do produto', error);
        toast.error(`Erro ao excluir produto: ${error.message}`);
      }
    });
  };

  // Add stock movement with ENHANCED validation and real-time stock check
  const useAddStockMovement = () => {
    return useMutation({
      mutationFn: async (movement: Partial<StockMovement>) => {
        SecureLogger.info('Iniciando registro de movimentação com validação em tempo real');
        
        if (!movement.productId || !movement.quantity || !movement.type) {
          throw new Error('Dados de movimentação incompletos');
        }

        // VALIDAÇÃO CRÍTICA: Buscar estoque atual em tempo real antes de qualquer operação
        console.log('Buscando estoque atual em tempo real...');
        const { data: currentProduct, error: productError } = await supabase
          .from('products')
          .select('quantity, name')
          .eq('id', movement.productId)
          .single();

        if (productError) {
          SecureLogger.error('Erro ao buscar produto atual', productError);
          throw new Error('Erro ao verificar estoque atual do produto');
        }

        const currentStock = currentProduct.quantity;
        console.log(`Estoque atual em tempo real: ${currentStock} unidades`);

        // VALIDAÇÃO RIGOROSA para saídas
        if (movement.type === 'out') {
          console.log(`Validando saída: ${movement.quantity} unidades solicitadas de ${currentStock} disponíveis`);
          
          if (currentStock === 0) {
            SecureLogger.error('BLOQUEIO: Produto sem estoque');
            throw new Error(`BLOQUEADO: Produto "${currentProduct.name}" não possui estoque disponível`);
          }
          
          if (currentStock < movement.quantity) {
            SecureLogger.error(`BLOQUEIO: Saída de ${movement.quantity} quando há apenas ${currentStock}`);
            throw new Error(`BLOQUEADO: Estoque insuficiente. Disponível: ${currentStock}, Solicitado: ${movement.quantity}`);
          }
          
          console.log('Validação de saída APROVADA');
        }
        
        const dbMovement = mapStockMovementToDbStockMovement(movement, user?.id);
        
        // Registrar a movimentação (o trigger do banco fará a segunda validação e atualizará o estoque)
        const { data, error } = await supabase
          .from('stock_movements')
          .insert(dbMovement)
          .select()
          .single();
          
        if (error) {
          SecureLogger.error('Erro no banco de dados', error);
          
          // Tratar erros específicos do trigger de validação
          if (error.message && error.message.includes('Estoque insuficiente')) {
            throw new Error(`SISTEMA BLOQUEOU: ${error.message}`);
          }
          
          throw new Error(`Erro ao registrar movimentação: ${error.message}`);
        }
        
        SecureLogger.success('Movimentação registrada com sucesso');
        return mapDbStockMovementToStockMovement(data);
      },
      onSuccess: (_, variables) => {
        // Invalidar TODAS as queries relacionadas para forçar atualização
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['products', variables.productId] });
        queryClient.invalidateQueries({ queryKey: ['productMovements', variables.productId] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['recent-movements'] });
        queryClient.invalidateQueries({ queryKey: ['low-stock-products'] });
        
        // Limpar cache da API para forçar busca de dados frescos
        ApiService.clearCache();
        
        // Aguardar um pouco e forçar refetch do produto específico
        setTimeout(() => {
          queryClient.refetchQueries({ queryKey: ['products', variables.productId] });
        }, 100);
        
        SecureLogger.success(`Movimentação ${variables.type} de ${variables.quantity} unidades registrada com SUCESSO`);
        toast.success(`${variables.type === 'in' ? 'Entrada' : 'Saída'} de ${variables.quantity} unidades registrada com sucesso!`);
      },
      onError: (error: any) => {
        SecureLogger.error('ERRO CRÍTICO no registro da movimentação', error);
        toast.error(`Operação bloqueada: ${error.message}`);
      }
    });
  };

  // Get top selling products
  const useTopSellingProducts = (limit: number = 5) => {
    return useQuery({
      queryKey: ['topSellingProducts', limit],
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_top_selling_products', { limit_count: limit });
        
        if (error) {
          throw new Error(`Error fetching top selling products: ${error.message}`);
        }
        
        return data;
      },
      enabled: !!user,
    });
  };

  // Get low stock products
  const useLowStockProducts = () => {
    return useQuery({
      queryKey: ['lowStockProducts'],
      queryFn: async () => {
        try {
          return await ApiService.getLowStockProducts();
        } catch (error) {
          SecureLogger.error('Erro ao buscar produtos com estoque baixo via hook', error);
          return [];
        }
      },
      enabled: !!user,
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
    });
  };

  // Get total stock value
  const useTotalStockValue = () => {
    return useQuery({
      queryKey: ['totalStockValue'],
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_total_stock_value');
        
        if (error) {
          throw new Error(`Error fetching total stock value: ${error.message}`);
        }
        
        return data;
      },
      enabled: !!user,
    });
  };

  return {
    useAllProducts,
    useProductsByCategory,
    useProduct,
    useProductMovements,
    useCreateProduct,
    useUpdateProduct,
    useDeleteProduct,
    useAddStockMovement,
    useTopSellingProducts,
    useLowStockProducts,
    useTotalStockValue
  };
}
