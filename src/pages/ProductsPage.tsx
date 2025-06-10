
import React, { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import { ProductsFilters } from "@/components/products/ProductsFilters";
import { ProductsGrid } from "@/components/products/ProductsGrid";
import { ProductsEmptyState } from "@/components/products/ProductsEmptyState";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { ApiService } from "@/services/api";

type SortOption = "name" | "price" | "quantity" | "created_at";

const ProductsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const searchRef = useRef<HTMLInputElement>(null);
  
  // Get products with filters using React Query
  const { useAllProducts } = useProducts();
  const { data: products = [], isLoading, error, refetch } = useAllProducts({
    search: searchQuery || undefined,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    sortBy: sortBy === "created_at" ? "name" : sortBy,
    sortDirection: "asc"
  });

  // Get categories using React Query
  const { useDistinctCategories } = useCategories();
  const { data: categories = [], isLoading: categoriesLoading } = useDistinctCategories();

  // Debug logging to understand the data
  React.useEffect(() => {
    if (products.length > 0) {
      console.log('Products data:', products.slice(0, 3));
      console.log('Categories data:', categories);
    }
  }, [products, categories]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("name");
    if (searchRef.current) {
      searchRef.current.focus();
    }
  };

  const handleRefresh = () => {
    refetch();
    // Clear cache to force fresh data
    ApiService.clearCache();
  };

  const activeFiltersCount = [searchQuery, selectedCategory !== "all" ? selectedCategory : ""].filter(Boolean).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <ProductsHeader onRefresh={handleRefresh} />
        
        <ProductsFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
          categories={categories}
          categoriesLoading={categoriesLoading}
          activeFiltersCount={activeFiltersCount}
          onClearFilters={handleClearFilters}
          searchRef={searchRef}
        />
        
        {/* Produtos */}
        {products.length === 0 && !isLoading && !error ? (
          <ProductsEmptyState
            activeFiltersCount={activeFiltersCount}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <ProductsGrid
            products={products}
            isLoading={isLoading}
            error={error}
            viewMode={viewMode}
            onRefresh={handleRefresh}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default ProductsPage;
