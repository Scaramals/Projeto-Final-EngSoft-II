
import { useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { Product, FilterParams } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { SecureLogger } from '@/services/secureLogger';
import { useToast } from '@/hooks/use-toast';

export function useProducts() {
  const { 
    products, 
    loadingProducts, 
    fetchProducts,
    createProduct: createProductData,
    updateProduct: updateProductData,
    deleteProduct: deleteProductData
  } = useData();
  
  const { toast } = useToast();

  // Get all products with filtering
  const getAllProducts = useCallback((filters?: FilterParams) => {
    let filteredProducts = [...products];

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.categoryId && filters.categoryId !== 'all') {
      filteredProducts = filteredProducts.filter(product =>
        product.categoryId === filters.categoryId
      );
    }

    if (filters?.sortBy) {
      filteredProducts.sort((a, b) => {
        const aValue = a[filters.sortBy as keyof Product];
        const bValue = b[filters.sortBy as keyof Product];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return filters.sortDirection === 'desc' 
            ? bValue.localeCompare(aValue)
            : aValue.localeCompare(bValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return filters.sortDirection === 'desc' 
            ? bValue - aValue
            : aValue - bValue;
        }
        
        return 0;
      });
    }

    return {
      data: filteredProducts,
      isLoading: loadingProducts,
      error: null,
      refetch: fetchProducts
    };
  }, [products, loadingProducts, fetchProducts]);

  // Get a single product by ID
  const getProduct = useCallback((productId: string | undefined) => {
    const product = productId ? products.find(p => p.id === productId) : undefined;
    
    return {
      data: product,
      isLoading: loadingProducts,
      error: null,
      refetch: fetchProducts
    };
  }, [products, loadingProducts, fetchProducts, productId]);

  // Get product movements history
  const getProductMovements = useCallback(async (productId: string | undefined) => {
    if (!productId) return { data: [], isLoading: false, error: null };

    try {
      SecureLogger.info('Buscando histórico de movimentações do produto');
      
      const { data, error } = await supabase.rpc('get_product_movement_history', { 
        product_id_param: productId 
      });
      
      if (error) {
        SecureLogger.error('Erro ao buscar movimentações', error);
        throw new Error(`Erro ao buscar movimentações: ${error.message}`);
      }
      
      const movements = data.map((dbMovement: any) => ({
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

      return { data: movements, isLoading: false, error: null };
    } catch (error) {
      SecureLogger.error('Erro ao buscar movimentações', error);
      return { data: [], isLoading: false, error: error as Error };
    }
  }, []);

  // Create a new product
  const createProduct = useCallback(async (product: Partial<Product>) => {
    try {
      await createProductData(product);
      toast({
        title: "Sucesso",
        description: "Produto criado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar produto",
        variant: "destructive",
      });
      throw error;
    }
  }, [createProductData, toast]);

  // Update an existing product
  const updateProduct = useCallback(async ({ id, ...updates }: Partial<Product> & { id: string }) => {
    try {
      await updateProductData(id, updates);
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto",
        variant: "destructive",
      });
      throw error;
    }
  }, [updateProductData, toast]);

  // Delete a product
  const deleteProduct = useCallback(async (id: string) => {
    try {
      await deleteProductData(id);
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir produto",
        variant: "destructive",
      });
      throw error;
    }
  }, [deleteProductData, toast]);

  // Get low stock products
  const getLowStockProducts = useCallback(() => {
    const lowStockProducts = products.filter(product => 
      product.minimumStock && product.quantity < product.minimumStock
    );

    return {
      data: lowStockProducts,
      isLoading: loadingProducts,
      error: null
    };
  }, [products, loadingProducts]);

  // Get total stock value
  const getTotalStockValue = useCallback(() => {
    const totalValue = products.reduce((sum, product) => 
      sum + (product.quantity * product.price), 0
    );

    return {
      data: totalValue,
      isLoading: loadingProducts,
      error: null
    };
  }, [products, loadingProducts]);

  return {
    // Hook-like functions that return data, loading, error states
    useAllProducts: getAllProducts,
    useProduct: getProduct,
    useProductMovements: getProductMovements,
    useLowStockProducts: getLowStockProducts,
    useTotalStockValue: getTotalStockValue,
    
    // Mutation functions
    useCreateProduct: () => ({
      mutateAsync: createProduct,
      isLoading: loadingProducts
    }),
    useUpdateProduct: () => ({
      mutateAsync: updateProduct,
      isLoading: loadingProducts
    }),
    useDeleteProduct: () => ({
      mutateAsync: deleteProduct,
      isLoading: loadingProducts
    }),

    // Direct access to products data
    products,
    loadingProducts,
    fetchProducts
  };
}
