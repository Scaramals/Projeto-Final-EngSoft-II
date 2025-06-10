
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoriesService, Category } from '@/services/categories.service';
import { useToast } from '@/hooks/use-toast';

export function useCategories() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const useAllCategories = () => {
    return useQuery({
      queryKey: ['categories'],
      queryFn: CategoriesService.getAllCategories,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  const useDistinctCategories = () => {
    return useQuery({
      queryKey: ['categories', 'distinct'],
      queryFn: async () => {
        const categories = await CategoriesService.getAllCategories();
        return categories.map(cat => ({ id: cat.id, name: cat.name }));
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  const useCategoryById = (id: string) => {
    return useQuery({
      queryKey: ['category', id],
      queryFn: () => CategoriesService.getCategoryById(id),
      enabled: !!id,
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  const useCreateCategory = () => {
    return useMutation({
      mutationFn: CategoriesService.createCategory,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        toast({
          title: "Sucesso",
          description: "Categoria criada com sucesso!",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Erro",
          description: error?.message || "Erro ao criar categoria",
          variant: "destructive",
        });
      },
    });
  };

  const useUpdateCategory = () => {
    return useMutation({
      mutationFn: ({ id, ...updates }: { id: string } & Partial<Category>) =>
        CategoriesService.updateCategory(id, updates),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        toast({
          title: "Sucesso",
          description: "Categoria atualizada com sucesso!",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Erro",
          description: error?.message || "Erro ao atualizar categoria",
          variant: "destructive",
        });
      },
    });
  };

  const useDeleteCategory = () => {
    return useMutation({
      mutationFn: CategoriesService.deleteCategory,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        toast({
          title: "Sucesso",
          description: "Categoria excluída com sucesso!",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Erro",
          description: error?.message || "Erro ao excluir categoria",
          variant: "destructive",
        });
      },
    });
  };

  return {
    useAllCategories,
    useDistinctCategories,
    useCategoryById,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
  };
}
