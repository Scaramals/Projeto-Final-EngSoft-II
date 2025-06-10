
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductsEmptyStateProps {
  activeFiltersCount: number;
  onClearFilters: () => void;
}

export const ProductsEmptyState: React.FC<ProductsEmptyStateProps> = ({
  activeFiltersCount,
  onClearFilters
}) => {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground text-lg">
        Nenhum produto encontrado
      </p>
      {activeFiltersCount > 0 ? (
        <Button className="mt-4" variant="outline" onClick={onClearFilters}>
          Limpar filtros
        </Button>
      ) : (
        <Button className="mt-4" asChild>
          <Link to="/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar primeiro produto
          </Link>
        </Button>
      )}
    </div>
  );
};
