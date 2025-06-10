
import { useData } from "@/contexts/DataContext";
import { Category } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { SecureLogger } from "@/services/secureLogger";
import { toast } from "sonner";
import { useState } from "react";

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
  const { user } = useAuth();
  const { categories, loadingCategories, fetchCategories } = useData();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all categories
  const useAllCategories = () => {
    return {
      data: categories,
      isLoading: loadingCategories,
      error: null,
      refetch: fetchCategories
    };
  };

  // Fetch distinct categories with name and id for filtering
  const useDistinctCategories = () => {
    return {
      data: categories.map(cat => ({ id: cat.id, name: cat.name })),
      isLoading: loadingCategories,
      error: null,
      refetch: fetchCategories
    };
  };

  // Get category name by ID
  const useCategoryById = (categoryId: string | undefined) => {
    const category = categories.find(cat => cat.id === categoryId);
    return {
      data: category?.name || null,
      isLoading: loadingCategories,
      error: null
    };
  };

  // Create a new category
  const useCreateCategory = () => {
    return {
      mutateAsync: async (category: Partial<Category>) => {
        setIsCreating(true);
        try {
          SecureLogger.info('Criando nova categoria');
          
          // For now, we'll need to implement this directly with Supabase
          // since DataContext doesn't have createCategory yet
          const { supabase } = await import("@/integrations/supabase/client");
          
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
          
          // Refresh categories
          await fetchCategories();
          
          toast.success("Categoria criada com sucesso!");
          
          return mapDbCategoryToCategory(data);
        } catch (error: any) {
          SecureLogger.error('Erro na criação da categoria', error);
          toast.error(`Erro ao criar categoria: ${error.message}`);
          throw error;
        } finally {
          setIsCreating(false);
        }
      },
      isPending: isCreating,
      isLoading: isCreating
    };
  };

  // Update an existing category
  const useUpdateCategory = () => {
    return {
      mutateAsync: async ({ id, ...updates }: Partial<Category> & { id: string }) => {
        setIsUpdating(true);
        try {
          SecureLogger.info('Atualizando categoria');
          
          const { supabase } = await import("@/integrations/supabase/client");
          
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
          
          // Refresh categories
          await fetchCategories();
          
          toast.success("Categoria atualizada com sucesso!");
          
          return mapDbCategoryToCategory(data);
        } catch (error: any) {
          SecureLogger.error('Erro na atualização da categoria', error);
          toast.error(`Erro ao atualizar categoria: ${error.message}`);
          throw error;
        } finally {
          setIsUpdating(false);
        }
      },
      isPending: isUpdating,
      isLoading: isUpdating
    };
  };

  // Delete a category
  const useDeleteCategory = () => {
    return {
      mutateAsync: async (id: string) => {
        setIsDeleting(true);
        try {
          SecureLogger.info('Excluindo categoria');
          
          const { supabase } = await import("@/integrations/supabase/client");
          
          const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);
            
          if (error) {
            SecureLogger.error('Erro ao excluir categoria', error);
            throw new Error(`Erro ao excluir categoria: ${error.message}`);
          }
          
          SecureLogger.success('Categoria excluída com sucesso');
          
          // Refresh categories
          await fetchCategories();
          
          toast.success("Categoria excluída com sucesso!");
          
          return id;
        } catch (error: any) {
          SecureLogger.error('Erro na exclusão da categoria', error);
          toast.error(`Erro ao excluir categoria: ${error.message}`);
          throw error;
        } finally {
          setIsDeleting(false);
        }
      },
      isPending: isDeleting,
      isLoading: isDeleting
    };
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
