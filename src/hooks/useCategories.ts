
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ApiService } from "@/services/api";
import { Category } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook para gestão de categorias - refatorado para usar a nova estrutura
 */
export function useCategories() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Buscar categorias distintas da tabela categories - retorna objetos {id, name}
  const useDistinctCategories = () => {
    return useQuery({
      queryKey: ['distinct-categories'],
      queryFn: async () => {
        console.log('Fetching distinct categories via hook');
        return await ApiService.getDistinctCategories();
      },
      enabled: !!user,
      staleTime: 1000 * 60 * 5, // 5 minutos de cache
    });
  };

  // Buscar nome da categoria pelo ID
  const useCategoryName = (categoryId: string | undefined) => {
    return useQuery({
      queryKey: ['category-name', categoryId],
      queryFn: async () => {
        if (!categoryId) return '';
        console.log('Fetching category name for ID:', categoryId);
        return await ApiService.getCategoryNameById(categoryId);
      },
      enabled: !!user && !!categoryId,
      staleTime: 1000 * 60 * 10, // 10 minutos de cache
    });
  };

  // Buscar todas as categorias da tabela categories
  const useAllCategories = (search?: string) => {
    return useQuery({
      queryKey: ['categories', search],
      queryFn: async () => {
        console.log('Fetching all categories with search:', search);
        
        let query = supabase.from('categories').select('*');

        if (search) {
          query = query.ilike('name', `%${search}%`);
        }
        
        query = query.order('name');
        
        const { data, error } = await query;

        if (error) {
          console.error('Error fetching categories:', error);
          throw new Error(`Erro ao buscar categorias: ${error.message}`);
        }

        const categories = (data || []).map((category) => ({
          id: category.id,
          name: category.name,
          description: category.description,
          createdAt: category.created_at
        })) as Category[];

        console.log('All categories fetched:', categories.length);
        return categories;
      },
      enabled: !!user,
      staleTime: 1000 * 60 * 5, // 5 minutos de cache
    });
  };

  // Buscar uma categoria pelo ID
  const useCategory = (categoryId: string | undefined) => {
    return useQuery({
      queryKey: ['categories', categoryId],
      queryFn: async () => {
        if (!categoryId) throw new Error("ID da categoria é obrigatório");
        
        console.log('Fetching category by ID:', categoryId);
        
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('id', categoryId)
          .single();
          
        if (error) {
          console.error('Error fetching category:', error);
          throw new Error(`Erro ao buscar categoria: ${error.message}`);
        }
        
        return {
          id: data.id,
          name: data.name,
          description: data.description,
          createdAt: data.created_at
        } as Category;
      },
      enabled: !!user && !!categoryId,
    });
  };

  // Criar uma nova categoria
  const useCreateCategory = () => {
    return useMutation({
      mutationFn: async (category: { name: string; description?: string }) => {
        console.log('Creating new category:', category);
        
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: category.name,
            description: category.description
          })
          .select()
          .single();
          
        if (error) {
          console.error('Error creating category:', error);
          throw new Error(`Erro ao criar categoria: ${error.message}`);
        }
        
        console.log('Category created successfully:', data);
        return {
          id: data.id,
          name: data.name,
          description: data.description,
          createdAt: data.created_at
        } as Category;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        queryClient.invalidateQueries({ queryKey: ['distinct-categories'] });
        toast({
          title: "Categoria criada",
          description: "A categoria foi criada com sucesso!",
        });
      },
      onError: (error) => {
        console.error('Error in category creation:', error);
        toast({
          variant: "destructive",
          title: "Erro ao criar categoria",
          description: error.message,
        });
      }
    });
  };

  // Atualizar uma categoria existente
  const useUpdateCategory = () => {
    return useMutation({
      mutationFn: async ({ id, name, description }: Partial<Category> & { id: string }) => {
        console.log('Updating category:', { id, name, description });
        
        const { data, error } = await supabase
          .from('categories')
          .update({ name, description })
          .eq('id', id)
          .select()
          .single();
          
        if (error) {
          console.error('Error updating category:', error);
          throw new Error(`Erro ao atualizar categoria: ${error.message}`);
        }
        
        console.log('Category updated successfully:', data);
        return {
          id: data.id,
          name: data.name,
          description: data.description,
          createdAt: data.created_at
        } as Category;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        queryClient.invalidateQueries({ queryKey: ['distinct-categories'] });
        queryClient.invalidateQueries({ queryKey: ['categories', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['category-name', variables.id] });
        toast({
          title: "Categoria atualizada",
          description: "As alterações foram salvas com sucesso!",
        });
      },
      onError: (error) => {
        console.error('Error in category update:', error);
        toast({
          variant: "destructive",
          title: "Erro ao atualizar categoria",
          description: error.message,
        });
      }
    });
  };

  // Excluir uma categoria
  const useDeleteCategory = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        console.log('Deleting category:', id);
        
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);
          
        if (error) {
          console.error('Error deleting category:', error);
          throw new Error(`Erro ao excluir categoria: ${error.message}`);
        }
        
        console.log('Category deleted successfully');
        return id;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        queryClient.invalidateQueries({ queryKey: ['distinct-categories'] });
        toast({
          title: "Categoria excluída",
          description: "A categoria foi removida com sucesso!",
        });
      },
      onError: (error) => {
        console.error('Error in category deletion:', error);
        toast({
          variant: "destructive",
          title: "Erro ao excluir categoria",
          description: error.message,
        });
      }
    });
  };

  return {
    useDistinctCategories,
    useCategoryName,
    useAllCategories,
    useCategory,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory
  };
}
