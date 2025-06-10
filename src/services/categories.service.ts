
import { supabase } from "@/integrations/supabase/client";
import { cacheService } from "./cacheService";

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export const CategoriesService = {
  async getAllCategories(): Promise<Category[]> {
    const cacheKey = 'categories_all';
    const cached = cacheService.get<Category[]>(cacheKey);
    
    if (cached) {
      console.log('✅ Categories from cache');
      return cached;
    }

    console.log('🔄 Fetching categories from database');
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('❌ Error fetching categories:', error);
      throw error;
    }

    const categories = (data || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      createdAt: cat.created_at
    }));

    cacheService.set(cacheKey, categories, 300000); // 5 min cache
    return categories;
  },

  async getCategoryById(id: string): Promise<string> {
    const cacheKey = `category_${id}`;
    const cached = cacheService.get<string>(cacheKey);
    
    if (cached) return cached;

    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      return 'Categoria não encontrada';
    }

    const categoryName = data.name;
    cacheService.set(cacheKey, categoryName, 600000); // 10 min cache
    return categoryName;
  },

  async createCategory(category: { name: string; description?: string }): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        description: category.description
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Clear cache
    cacheService.deleteByPattern('categories_');
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: data.created_at
    };
  },

  async updateCategory(id: string, updates: { name?: string; description?: string }): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
    
    // Clear cache
    cacheService.deleteByPattern('categories_');
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Clear cache
    cacheService.deleteByPattern('categories_');
  }
};
