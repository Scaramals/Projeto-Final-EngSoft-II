
import React from "react";
import { CategoryBadge } from "./CategoryBadge";

interface CategoryDisplayProps {
  categoryId?: string;
}

export const CategoryDisplay: React.FC<CategoryDisplayProps> = ({ categoryId }) => {
  return <CategoryBadge categoryId={categoryId} variant="outline" />;
};
