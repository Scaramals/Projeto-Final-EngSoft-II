
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
  const { useCategoryName } = useCategories();
  
  // Se não há categoria, mostra badge padrão
  if (!categoryId) {
    return (
      <Badge variant={variant} className={className}>
        Sem categoria
      </Badge>
    );
  }
  
  // Busca o nome da categoria pelo ID
  const { data: categoryName, isLoading } = useCategoryName(categoryId);
  
  if (isLoading) {
    return (
      <Badge variant={variant} className={className}>
        Carregando...
      </Badge>
    );
  }
  
  if (!categoryName || categoryName === 'Categoria não encontrada') {
    return (
      <Badge variant={variant} className={className}>
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
