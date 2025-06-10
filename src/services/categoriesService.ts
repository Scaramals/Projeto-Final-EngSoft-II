
import { supabase } from "@/integrations/supabase/client";
import { cacheService } from "./cacheService";

/**
 * Serviço para operações relacionadas a categorias
 */
export const CategoriesService = {
  /**
   * Obter categorias distintas da tabela categories
   */
  async getDistinctCategories(): Promise<Array<{id: string, name: string}>> {
    try {
      const cacheKey = 'distinct_categories';
      const cached = cacheService.get<Array<{id: string, name: string}>>(cacheKey);
      
      if (cached) {
        console.log('Using cached distinct categories');
        return cached;
      }

      console.log('Fetching distinct categories from database');
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      const categories = (data || []).map(cat => ({
        id: cat.id,
        name: cat.name
      }));

      console.log('Categories fetched:', categories);
      
      // Cache por 5 minutos
      cacheService.set(cacheKey, categories, 300);
      
      return categories;
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      throw error;
    }
  },

  /**
   * Obter nome da categoria pelo ID
   */
  async getCategoryNameById(categoryId: string): Promise<string> {
    try {
      const cacheKey = `category_name_${categoryId}`;
      const cached = cacheService.get<string>(cacheKey);
      
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single();
      
      if (error) {
        console.error('Error fetching category name:', error);
        return 'Categoria não encontrada';
      }

      const categoryName = data?.name || 'Categoria não encontrada';
      
      // Cache por 10 minutos
      cacheService.set(cacheKey, categoryName, 600);
      
      return categoryName;
    } catch (error) {
      console.error("Erro ao buscar nome da categoria:", error);
      return 'Categoria não encontrada';
    }
  }
};
