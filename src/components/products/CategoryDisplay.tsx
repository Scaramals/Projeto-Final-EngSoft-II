
import React from "react";
import { useCategories } from "@/hooks/useCategories";
import { Badge } from "@/components/ui/badge";

interface CategoryDisplayProps {
  categoryId: string | null | undefined;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

// Helper function to check if a string looks like a UUID
const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const CategoryDisplay: React.FC<CategoryDisplayProps> = ({ 
  categoryId, 
  variant = "outline",
  className 
}) => {
  const { useCategoryName } = useCategories();
  
  // Se não há categoria, não mostra nada
  if (!categoryId) return null;
  
  // Se é uma string que não parece UUID, mostra diretamente
  if (typeof categoryId === 'string' && !isUUID(categoryId)) {
    return (
      <Badge variant={variant} className={className}>
        {categoryId}
      </Badge>
    );
  }
  
  // Se parece UUID, busca o nome
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
        Categoria
      </Badge>
    );
  }
  
  return (
    <Badge variant={variant} className={className}>
      {categoryName}
    </Badge>
  );
};
