
import React, { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Plus, Search as SearchIcon, SlidersHorizontal, Grid3X3, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { ApiService } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

type SortOption = "name" | "price" | "quantity" | "created_at";

const ProductsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const searchRef = useRef<HTMLInputElement>(null);
  
  // Get products with filters
  const { useAllProducts } = useProducts();
  const { data: products = [], isLoading, error, refetch } = useAllProducts({
    search: searchQuery,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    sortBy: sortBy === "created_at" ? "name" : sortBy,
    sortDirection: "asc"
  });

  // Extract unique categories from products
  const categories = React.useMemo(() => {
    const uniqueCategories = new Set<string>();
    products.forEach(product => {
      if (product.category && product.category.trim()) {
        uniqueCategories.add(product.category);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [products]);

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Produtos</h1>
            <p className="text-muted-foreground">
              Gerencie seu catálogo de produtos
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              Atualizar
            </Button>
            <Button asChild>
              <Link to="/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Filtros e Busca */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={searchRef}
              placeholder="Pesquisar produtos..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Filtro de Categoria */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Ordenação */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Ordenar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("name")}>
                  Nome A-Z
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price")}>
                  Menor Preço
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("quantity")}>
                  Maior Estoque
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("created_at")}>
                  Mais Recente
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Visualização */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Limpar Filtros */}
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={handleClearFilters}>
                Limpar Filtros
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              </Button>
            )}
          </div>
        </div>
        
        {/* Produtos */}
        {isLoading ? (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          }`}>
            {Array(8).fill(0).map((_, index) => (
              <Skeleton key={index} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive text-lg">Erro ao carregar produtos</p>
            <Button className="mt-4" variant="outline" onClick={handleRefresh}>
              Tentar novamente
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Nenhum produto encontrado
            </p>
            <Button className="mt-4" variant="outline" onClick={handleClearFilters}>
              Limpar filtros
            </Button>
          </div>
        ) : (
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
        )}
      </div>
    </AppLayout>
  );
};

export default ProductsPage;
