
import React from "react";
import { useCategories } from "@/hooks/useCategories";
import { Badge } from "@/components/ui/badge";

interface CategoryBadgeProps {
  categoryId?: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ 
  categoryId, 
  variant = "outline" 
}) => {
  const { useCategoryById } = useCategories();
  const { data: categoryName, isLoading } = useCategoryById(categoryId || "");

  if (!categoryId) {
    return <Badge variant={variant}>Sem categoria</Badge>;
  }

  if (isLoading) {
    return <Badge variant={variant}>Carregando...</Badge>;
  }

  if (!categoryName || categoryName === 'Categoria não encontrada') {
    return <Badge variant="destructive">Categoria não encontrada</Badge>;
  }

  return <Badge variant={variant}>{categoryName}</Badge>;
};
