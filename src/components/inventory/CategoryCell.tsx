
import React from "react";
import { useCategories } from "@/hooks/useCategories";

interface CategoryCellProps {
  categoryId: string | null | undefined;
}

// Helper function to check if a string looks like a UUID
const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const CategoryCell: React.FC<CategoryCellProps> = ({ categoryId }) => {
  const { useCategoryById } = useCategories();
  
  // Se não há categoria
  if (!categoryId) return <span>Sem categoria</span>;
  
  // Se é uma string que não parece UUID, mostra diretamente
  if (typeof categoryId === 'string' && !isUUID(categoryId)) {
    return <span>{categoryId}</span>;
  }
  
  // Se parece UUID, busca o nome
  const { data: categoryName, isLoading } = useCategoryById(categoryId);
  
  if (isLoading) return <span>Carregando...</span>;
  
  if (!categoryName || categoryName === 'Categoria não encontrada') {
    return <span>Categoria</span>;
  }
  
  return <span>{categoryName}</span>;
};
