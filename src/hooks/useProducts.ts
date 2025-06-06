
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product, StockMovement, FilterParams } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SecureLogger } from "@/services/secureLogger";

/**
 * Helper function to convert database response to Product type
 */
const mapDbProductToProduct = (dbProduct: any): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  description: dbProduct.description,
  quantity: dbProduct.quantity,
  price: dbProduct.price,
  category: dbProduct.category,
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
  updatedAt: dbMovement.updated_at,
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
  if (product.category !== undefined) dbProduct.category = product.category;
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
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch all products with filtering and sorting
  const useAllProducts = (filters?: FilterParams) => {
    return useQuery({
      queryKey: ['products', filters],
      queryFn: async () => {
        let query = supabase.from('products').select('*');

        if (filters?.search) {
          query = query.ilike('name', `%${filters.search}%`);
        }

        if (filters?.category && filters.category !== '') {
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

        return data.map(mapDbProductToProduct) as Product[];
      },
      enabled: !!user, // Only run query when user is authenticated
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
        toast({
          title: "Produto criado",
          description: "O produto foi criado com sucesso!",
        });
      },
      onError: (error: any) => {
        SecureLogger.error('Erro na criação do produto', error);
        toast({
          variant: "destructive",
          title: "Erro ao criar produto",
          description: error.message,
        });
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
        toast({
          title: "Produto atualizado",
          description: "As alterações foram salvas com sucesso!",
        });
      },
      onError: (error: any) => {
        SecureLogger.error('Erro na atualização do produto', error);
        toast({
          variant: "destructive",
          title: "Erro ao atualizar produto",
          description: error.message,
        });
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
        toast({
          title: "Produto excluído",
          description: "O produto foi removido com sucesso!",
        });
      },
      onError: (error: any) => {
        SecureLogger.error('Erro na exclusão do produto', error);
        toast({
          variant: "destructive",
          title: "Erro ao excluir produto",
          description: error.message,
        });
      }
    });
  };

  // Add stock movement
  const useAddStockMovement = () => {
    return useMutation({
      mutationFn: async (movement: Partial<StockMovement>) => {
        SecureLogger.info('Registrando movimentação de estoque');
        
        const dbMovement = mapStockMovementToDbStockMovement(movement, user?.id);
        
        const { data, error } = await supabase
          .from('stock_movements')
          .insert(dbMovement)
          .select()
          .single();
          
        if (error) {
          SecureLogger.error('Erro ao registrar movimentação', error);
          throw new Error(`Erro ao registrar movimentação: ${error.message}`);
        }
        
        SecureLogger.success('Movimentação registrada com sucesso');
        return mapDbStockMovementToStockMovement(data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['products', variables.productId] });
        queryClient.invalidateQueries({ queryKey: ['productMovements', variables.productId] });
        toast({
          title: "Movimentação registrada",
          description: `${variables.type === 'in' ? 'Entrada' : 'Saída'} de ${variables.quantity} unidades registrada com sucesso!`,
        });
      },
      onError: (error: any) => {
        SecureLogger.error('Erro no registro da movimentação', error);
        toast({
          variant: "destructive",
          title: "Erro ao registrar movimentação",
          description: error.message,
        });
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
        const { data, error } = await supabase.rpc('get_low_stock_products');
        
        if (error) {
          throw new Error(`Error fetching low stock products: ${error.message}`);
        }
        
        return data.map(mapDbProductToProduct) as Product[];
      },
      enabled: !!user,
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
