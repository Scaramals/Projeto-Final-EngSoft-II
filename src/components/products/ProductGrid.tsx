
import React from "react";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { Package, AlertCircle } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  error: any;
  onRefresh: () => void;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  error,
  onRefresh,
  hasFilters,
  onClearFilters
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array(8).fill(0).map((_, index) => (
          <Skeleton key={index} className="h-80 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Erro ao carregar produtos</h3>
        <p className="text-muted-foreground mb-4">
          Não foi possível carregar os produtos. Tente novamente.
        </p>
        <Button onClick={onRefresh}>Tentar novamente</Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {hasFilters ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
        </h3>
        <p className="text-muted-foreground mb-4">
          {hasFilters 
            ? "Tente ajustar os filtros para encontrar produtos."
            : "Comece adicionando seu primeiro produto ao sistema."
          }
        </p>
        {hasFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            Limpar filtros
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
