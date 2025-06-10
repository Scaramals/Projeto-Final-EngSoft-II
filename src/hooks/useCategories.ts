
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { SecureLogger } from "@/services/secureLogger";
import { toast } from "sonner";

/**
 * Helper function to convert database response to Category type
 */
const mapDbCategoryToCategory = (dbCategory: any): Category => ({
  id: dbCategory.id,
  name: dbCategory.name,
  description: dbCategory.description,
  createdAt: dbCategory.created_at,
});

export function useCategories() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch all categories
  const useAllCategories = () => {
    return useQuery({
      queryKey: ['categories'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
          
        if (error) {
          throw new Error(`Error fetching categories: ${error.message}`);
        }
        
        return data.map(mapDbCategoryToCategory) as Category[];
      },
      enabled: !!user,
    });
  };

  // Fetch distinct categories with name and id for filtering
  const useDistinctCategories = () => {
    return useQuery({
      queryKey: ['distinctCategories'],
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from('categories')
            .select('id, name')
            .order('name');
          
          if (error) {
            console.error('Error fetching distinct categories:', error);
            return [];
          }
          
          return data || [];
        } catch (error) {
          console.error('Error in useDistinctCategories:', error);
          return [];
        }
      },
      enabled: !!user,
    });
  };

  // Get category name by ID
  const useCategoryById = (categoryId: string | undefined) => {
    return useQuery({
      queryKey: ['categories', categoryId],
      queryFn: async () => {
        if (!categoryId) return null;
        
        const { data, error } = await supabase
          .from('categories')
          .select('name')
          .eq('id', categoryId)
          .single();
          
        if (error) {
          console.error('Error fetching category:', error);
          return null;
        }
        
        return data?.name || null;
      },
      enabled: !!user && !!categoryId,
    });
  };

  // Create a new category
  const useCreateCategory = () => {
    return useMutation({
      mutationFn: async (category: Partial<Category>) => {
        SecureLogger.info('Criando nova categoria');
        
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: category.name,
            description: category.description
          })
          .select()
          .single();
          
        if (error) {
          SecureLogger.error('Erro ao criar categoria', error);
          throw new Error(`Erro ao criar categoria: ${error.message}`);
        }
        
        SecureLogger.success('Categoria criada com sucesso');
        return mapDbCategoryToCategory(data);
      },
      onSuccess: async () => {
        // FORÇAR invalidação e refetch completo após criação
        await queryClient.invalidateQueries({ queryKey: ['categories'] });
        await queryClient.invalidateQueries({ queryKey: ['distinctCategories'] });
        await queryClient.refetchQueries({ queryKey: ['categories'] });
        await queryClient.refetchQueries({ queryKey: ['distinctCategories'] });
        
        toast.success("Categoria criada com sucesso!");
      },
      onError: (error: any) => {
        SecureLogger.error('Erro na criação da categoria', error);
        toast.error(`Erro ao criar categoria: ${error.message}`);
      }
    });
  };

  // Update an existing category
  const useUpdateCategory = () => {
    return useMutation({
      mutationFn: async ({ id, ...updates }: Partial<Category> & { id: string }) => {
        SecureLogger.info('Atualizando categoria');
        
        const { data, error } = await supabase
          .from('categories')
          .update({
            name: updates.name,
            description: updates.description
          })
          .eq('id', id)
          .select()
          .single();
          
        if (error) {
          SecureLogger.error('Erro ao atualizar categoria', error);
          throw new Error(`Erro ao atualizar categoria: ${error.message}`);
        }
        
        SecureLogger.success('Categoria atualizada com sucesso');
        return mapDbCategoryToCategory(data);
      },
      onSuccess: async (_, variables) => {
        // FORÇAR invalidação e refetch completo após atualização
        await queryClient.invalidateQueries({ queryKey: ['categories'] });
        await queryClient.invalidateQueries({ queryKey: ['distinctCategories'] });
        await queryClient.invalidateQueries({ queryKey: ['categories', variables.id] });
        
        // Refetch específico
        await queryClient.refetchQueries({ queryKey: ['categories'] });
        await queryClient.refetchQueries({ queryKey: ['distinctCategories'] });
        await queryClient.refetchQueries({ queryKey: ['categories', variables.id] });
        
        toast.success("Categoria atualizada com sucesso!");
      },
      onError: (error: any) => {
        SecureLogger.error('Erro na atualização da categoria', error);
        toast.error(`Erro ao atualizar categoria: ${error.message}`);
      }
    });
  };

  // Delete a category
  const useDeleteCategory = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        SecureLogger.info('Excluindo categoria');
        
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);
          
        if (error) {
          SecureLogger.error('Erro ao excluir categoria', error);
          throw new Error(`Erro ao excluir categoria: ${error.message}`);
        }
        
        SecureLogger.success('Categoria excluída com sucesso');
        return id;
      },
      onSuccess: async () => {
        // FORÇAR invalidação e refetch completo após exclusão
        await queryClient.invalidateQueries({ queryKey: ['categories'] });
        await queryClient.invalidateQueries({ queryKey: ['distinctCategories'] });
        await queryClient.refetchQueries({ queryKey: ['categories'] });
        await queryClient.refetchQueries({ queryKey: ['distinctCategories'] });
        
        toast.success("Categoria excluída com sucesso!");
      },
      onError: (error: any) => {
        SecureLogger.error('Erro na exclusão da categoria', error);
        toast.error(`Erro ao excluir categoria: ${error.message}`);
      }
    });
  };

  return {
    useAllCategories,
    useDistinctCategories,
    useCategoryById,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory
  };
}
