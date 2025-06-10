
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductsService } from '@/services/products.service';
import { Product, FilterParams } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const useAllProducts = (filters?: FilterParams) => {
    return useQuery({
      queryKey: ['products', filters],
      queryFn: () => ProductsService.getAllProducts(filters),
      staleTime: 3 * 60 * 1000, // 3 minutes
    });
  };

  const useProduct = (id?: string) => {
    return useQuery({
      queryKey: ['product', id],
      queryFn: () => ProductsService.getProductById(id!),
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  const useCreateProduct = () => {
    return useMutation({
      mutationFn: ProductsService.createProduct,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast({
          title: "Sucesso",
          description: "Produto criado com sucesso!",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Erro",
          description: error?.message || "Erro ao criar produto",
          variant: "destructive",
        });
      },
    });
  };

  const useUpdateProduct = () => {
    return useMutation({
      mutationFn: ({ id, ...updates }: { id: string } & Partial<Product>) =>
        ProductsService.updateProduct(id, updates),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['product'] });
        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso!",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Erro",
          description: error?.message || "Erro ao atualizar produto",
          variant: "destructive",
        });
      },
    });
  };

  const useDeleteProduct = () => {
    return useMutation({
      mutationFn: ProductsService.deleteProduct,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast({
          title: "Sucesso",
          description: "Produto excluído com sucesso!",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Erro",
          description: error?.message || "Erro ao excluir produto",
          variant: "destructive",
        });
      },
    });
  };

  return {
    useAllProducts,
    useProduct,
    useCreateProduct,
    useUpdateProduct,
    useDeleteProduct,
  };
}
