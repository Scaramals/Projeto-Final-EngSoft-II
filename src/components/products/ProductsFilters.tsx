
import React from "react";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, SlidersHorizontal, Grid3X3, List } from "lucide-react";
import { Input } from "@/components/ui/input";
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
type ViewMode = "grid" | "list";

interface ProductsFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  sortBy: SortOption;
  setSortBy: (value: SortOption) => void;
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
  categories: string[];
  categoriesLoading: boolean;
  activeFiltersCount: number;
  onClearFilters: () => void;
  searchRef: React.RefObject<HTMLInputElement>;
}

export const ProductsFilters: React.FC<ProductsFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  categories,
  categoriesLoading,
  activeFiltersCount,
  onClearFilters,
  searchRef
}) => {
  return (
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
            {categoriesLoading ? (
              <SelectItem value="loading" disabled>Carregando...</SelectItem>
            ) : (
              categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))
            )}
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
          <Button variant="outline" onClick={onClearFilters}>
            Limpar Filtros
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          </Button>
        )}
      </div>
    </div>
  );
};
