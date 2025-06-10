
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product, FilterParams } from "@/types";
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
      staleTime: 0, // SEMPRE buscar dados frescos
      gcTime: 30 * 1000, // 30 segundos
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

  // Fetch a single product by ID - SEMPRE buscar dados DIRETAMENTE do banco
  const useProduct = (productId: string | undefined) => {
    return useQuery({
      queryKey: ['products', productId],
      queryFn: async () => {
        if (!productId) throw new Error("Product ID is required");
        
        console.log('🔄 [PRODUCTS] === BUSCANDO PRODUTO DIRETO DO BANCO ===');
        console.log('🔄 [PRODUCTS] ID do produto:', productId);
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
          
        if (error) {
          console.error('❌ [PRODUCTS] Erro ao buscar produto:', error);
          throw new Error(`Error fetching product: ${error.message}`);
        }
        
        const product = mapDbProductToProduct(data);
        console.log('📊 [PRODUCTS] === PRODUTO CARREGADO DO BANCO ===');
        console.log('📊 [PRODUCTS] Nome:', product.name);
        console.log('📊 [PRODUCTS] Estoque REAL no banco:', product.quantity);
        console.log('📊 [PRODUCTS] === FIM DO CARREGAMENTO ===');
        
        return product;
      },
      enabled: !!user && !!productId,
      staleTime: 0, // SEMPRE buscar dados frescos - NUNCA cache
      gcTime: 0, // NÃO manter em cache
      refetchOnMount: true, // SEMPRE refetch ao montar
      refetchOnWindowFocus: true, // Refetch quando a janela ganha foco
      refetchOnReconnect: true, // Refetch quando reconecta
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
        
        return data.map((dbMovement: any) => ({
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
        }));
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
      onSuccess: async () => {
        // FORÇAR invalidação e refetch completo após criação
        await queryClient.invalidateQueries({ queryKey: ['products'] });
        await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        await queryClient.invalidateQueries({ queryKey: ['lowStockProducts'] });
        await queryClient.invalidateQueries({ queryKey: ['totalStockValue'] });
        await queryClient.refetchQueries({ queryKey: ['products'] });
        
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
      onSuccess: async (_, variables) => {
        // FORÇAR invalidação e refetch completo após atualização
        await queryClient.invalidateQueries({ queryKey: ['products'] });
        await queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
        await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        await queryClient.invalidateQueries({ queryKey: ['lowStockProducts'] });
        await queryClient.invalidateQueries({ queryKey: ['totalStockValue'] });
        
        // Refetch específico
        await queryClient.refetchQueries({ queryKey: ['products'] });
        await queryClient.refetchQueries({ queryKey: ['products', variables.id] });
        
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
      onSuccess: async () => {
        // FORÇAR invalidação e refetch completo após exclusão
        await queryClient.invalidateQueries({ queryKey: ['products'] });
        await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        await queryClient.invalidateQueries({ queryKey: ['lowStockProducts'] });
        await queryClient.invalidateQueries({ queryKey: ['totalStockValue'] });
        await queryClient.invalidateQueries({ queryKey: ['productMovements'] });
        
        // Refetch para garantir dados atualizados
        await queryClient.refetchQueries({ queryKey: ['products'] });
        
        toast.success("Produto excluído com sucesso!");
      },
      onError: (error: any) => {
        SecureLogger.error('Erro na exclusão do produto', error);
        toast.error(`Erro ao excluir produto: ${error.message}`);
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
    useTopSellingProducts,
    useLowStockProducts,
    useTotalStockValue
  };
}
