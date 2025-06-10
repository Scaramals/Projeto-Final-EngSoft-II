
import React from "react";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";

type ViewMode = "grid" | "list";

interface ProductsGridProps {
  products: Product[];
  isLoading: boolean;
  error: any;
  viewMode: ViewMode;
  onRefresh: () => void;
}

export const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  isLoading,
  error,
  viewMode,
  onRefresh
}) => {
  if (isLoading) {
    return (
      <div className={`grid gap-6 ${
        viewMode === "grid" 
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
          : "grid-cols-1"
      }`}>
        {Array(8).fill(0).map((_, index) => (
          <Skeleton key={index} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive text-lg">Erro ao carregar produtos</p>
        <Button className="mt-4" variant="outline" onClick={onRefresh}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${
      viewMode === "grid" 
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
        : "grid-cols-1 max-w-4xl"
    }`}>
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product}
        />
      ))}
    </div>
  );
};
