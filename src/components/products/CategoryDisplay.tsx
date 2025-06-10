
import React from "react";
import { useCategories } from "@/hooks/useCategories";
import { Badge } from "@/components/ui/badge";

interface CategoryDisplayProps {
  categoryId: string | null | undefined;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

export const CategoryDisplay: React.FC<CategoryDisplayProps> = ({ 
  categoryId, 
  variant = "outline",
  className 
}) => {
  const { useCategoryById } = useCategories();
  
  // Debug logging
  React.useEffect(() => {
    console.log('CategoryDisplay - categoryId:', categoryId);
  }, [categoryId]);
  
  // Se não há categoria, mostra badge padrão
  if (!categoryId) {
    console.log('CategoryDisplay - No categoryId provided');
    return (
      <Badge variant={variant} className={className}>
        Sem categoria
      </Badge>
    );
  }
  
  // Busca o nome da categoria pelo ID
  const { data: categoryName, isLoading, error } = useCategoryById(categoryId);
  
  // Debug logging
  React.useEffect(() => {
    console.log('CategoryDisplay - categoryName:', categoryName, 'loading:', isLoading, 'error:', error);
  }, [categoryName, isLoading, error]);
  
  if (isLoading) {
    return (
      <Badge variant={variant} className={className}>
        Carregando...
      </Badge>
    );
  }
  
  if (error) {
    console.error('CategoryDisplay - Error fetching category name:', error);
    return (
      <Badge variant="destructive" className={className}>
        Erro ao carregar
      </Badge>
    );
  }
  
  if (!categoryName || categoryName === 'Categoria não encontrada') {
    console.warn('CategoryDisplay - Category not found for ID:', categoryId);
    return (
      <Badge variant="secondary" className={className}>
        Categoria não encontrada
      </Badge>
    );
  }
  
  return (
    <Badge variant={variant} className={className}>
      {categoryName}
    </Badge>
  );
};
