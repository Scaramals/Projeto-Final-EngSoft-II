
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductGrid } from "@/components/products/ProductGrid";

const ProductsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  
  const filters = {
    search: searchQuery || undefined,
    categoryId: selectedCategory === "all" ? undefined : selectedCategory,
    sortBy: sortBy as any,
    sortDirection: "asc" as const
  };

  const { useAllProducts } = useProducts();
  const { data: products = [], isLoading, error, refetch } = useAllProducts(filters);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("name");
  };

  const handleRefresh = () => {
    refetch();
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCategory !== "all" ? selectedCategory : "",
  ].filter(Boolean).length;

  const hasFilters = activeFiltersCount > 0;

  return (
    <AppLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Produtos</h1>
            <p className="text-muted-foreground">
              Gerencie seu catálogo de produtos
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button asChild>
              <Link to="/products/add">
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Link>
            </Button>
          </div>
        </div>
        
        <ProductFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onClearFilters={handleClearFilters}
          activeFiltersCount={activeFiltersCount}
        />
        
        <ProductGrid
          products={products}
          isLoading={isLoading}
          error={error}
          onRefresh={handleRefresh}
          hasFilters={hasFilters}
          onClearFilters={handleClearFilters}
        />
      </div>
    </AppLayout>
  );
};

export default ProductsPage;
