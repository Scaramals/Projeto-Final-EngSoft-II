
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
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const searchRef = useRef<HTMLInputElement>(null);
  
  // Get products with filters using React Query
  const { useAllProducts } = useProducts();
  const { data: products = [], isLoading, error, refetch } = useAllProducts({
    search: searchQuery || undefined,
    categoryId: selectedCategoryId === "all" ? undefined : selectedCategoryId,
    sortBy: sortBy === "created_at" ? "name" : sortBy,
    sortDirection: "asc"
  });

  // Get categories using React Query - retorna objetos {id, name}
  const { useDistinctCategories } = useCategories();
  const { data: categoriesData = [], isLoading: categoriesLoading } = useDistinctCategories();

  // Convert categories data to the format expected by ProductsFilters
  const categories: Array<string> = categoriesData.map(cat => cat.name);

  // Debug logging to understand the data
  React.useEffect(() => {
    console.log('ProductsPage - Products:', products.length);
    console.log('ProductsPage - Categories data:', categoriesData);
    console.log('ProductsPage - Categories for filter:', categories);
    
    if (products.length > 0) {
      console.log('Sample product:', products[0]);
    }
  }, [products, categoriesData, categories]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategoryId("all");
    setSortBy("name");
    if (searchRef.current) {
      searchRef.current.focus();
    }
  };

  const handleRefresh = () => {
    console.log('Refreshing products and clearing cache');
    refetch();
    // Clear cache to force fresh data
    ApiService.clearCache();
  };

  // Handle category change - convert category name back to ID
  const handleCategoryChange = (categoryName: string) => {
    console.log('Category changed to:', categoryName);
    
    if (categoryName === "all") {
      setSelectedCategoryId("all");
    } else {
      // Find the category ID by name
      const foundCategory = categoriesData.find(cat => cat.name === categoryName);
      if (foundCategory) {
        console.log('Found category ID:', foundCategory.id);
        setSelectedCategoryId(foundCategory.id);
      } else {
        console.warn('Category not found:', categoryName);
        setSelectedCategoryId("all");
      }
    }
  };

  // Convert current categoryId back to name for display
  const getSelectedCategoryName = () => {
    if (selectedCategoryId === "all") return "all";
    const foundCategory = categoriesData.find(cat => cat.id === selectedCategoryId);
    return foundCategory?.name || "all";
  };

  const activeFiltersCount = [searchQuery, selectedCategoryId !== "all" ? selectedCategoryId : ""].filter(Boolean).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <ProductsHeader onRefresh={handleRefresh} />
        
        <ProductsFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={getSelectedCategoryName()}
          setSelectedCategory={handleCategoryChange}
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
