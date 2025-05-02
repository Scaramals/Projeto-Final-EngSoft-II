
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product, StockMovement } from "@/types";
import { useToast } from "@/components/ui/use-toast";

export function useProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all products
  const useAllProducts = (filters?: { search?: string; category?: string }) => {
    return useQuery({
      queryKey: ['products', filters],
      queryFn: async () => {
        let query = supabase.from('products').select('*');

        if (filters?.search) {
          query = query.ilike('name', `%${filters.search}%`);
        }

        if (filters?.category) {
          query = query.eq('category', filters.category);
        }
        
        const { data, error } = await query.order('name');

        if (error) {
          throw new Error(`Error fetching products: ${error.message}`);
        }

        return data as Product[];
      },
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
        
        return data as Product[];
      },
      enabled: category !== undefined,
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
        
        return data as Product;
      },
      enabled: !!productId,
    });
  };

  // Get product stock movement history
  const useProductMovements = (productId: string | undefined) => {
    return useQuery({
      queryKey: ['productMovements', productId],
      queryFn: async () => {
        if (!productId) throw new Error("Product ID is required");
        
        const { data, error } = await supabase.rpc('get_product_movement_history', { 
          product_id_param: productId 
        });
        
        if (error) {
          throw new Error(`Error fetching stock movements: ${error.message}`);
        }
        
        return data as StockMovement[];
      },
      enabled: !!productId,
    });
  };

  // Create a new product
  const useCreateProduct = () => {
    return useMutation({
      mutationFn: async (product: Partial<Product>) => {
        const { data, error } = await supabase
          .from('products')
          .insert(product)
          .select()
          .single();
          
        if (error) {
          throw new Error(`Error creating product: ${error.message}`);
        }
        
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast({
          title: "Produto criado",
          description: "O produto foi criado com sucesso!",
        });
      },
      onError: (error) => {
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
        const { data, error } = await supabase
          .from('products')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
          
        if (error) {
          throw new Error(`Error updating product: ${error.message}`);
        }
        
        return data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
        toast({
          title: "Produto atualizado",
          description: "As alterações foram salvas com sucesso!",
        });
      },
      onError: (error) => {
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
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
          
        if (error) {
          throw new Error(`Error deleting product: ${error.message}`);
        }
        
        return id;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast({
          title: "Produto excluído",
          description: "O produto foi removido com sucesso!",
        });
      },
      onError: (error) => {
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
        const { data, error } = await supabase
          .from('stock_movements')
          .insert(movement)
          .select()
          .single();
          
        if (error) {
          throw new Error(`Error adding stock movement: ${error.message}`);
        }
        
        return data;
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
      onError: (error) => {
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
      }
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
    useTopSellingProducts
  };
}
