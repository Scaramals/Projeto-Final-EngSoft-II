
import React, { useState, useRef, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { formatCurrency, getStockStatus } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useCategories } from "@/hooks/useCategories";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const InventoryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState<"all" | "low" | "medium" | "good">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();
  const pageRef = useRef<HTMLDivElement>(null);
  
  // Usar hook de categorias correto
  const { useAllCategories } = useCategories();
  const { data: categories = [], isLoading: loadingCategories } = useAllCategories();
  
  // Get products with filters
  const { useAllProducts } = useProducts();
  const { data: products = [], isLoading, error } = useAllProducts({
    search: searchQuery,
    category: selectedCategory === "all" ? "" : selectedCategory,
    sortBy: sortBy as any,
    sortDirection: sortDirection
  });
  
  // Filter products based on stock status - memoized for performance
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (filter === "all") return true;
      
      const status = getStockStatus(product.quantity, product.minimumStock).class.split("-")[1];
      return filter === status;
    });
  }, [products, filter]);
  
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };
  
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilter("all");
    setSelectedCategory("all");
  };

  return (
    <AppLayout>
      <div ref={pageRef} className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Estoque</h1>
            <p className="text-muted-foreground">
              Visualize e gerencie seus produtos em estoque
            </p>
          </div>
          <Button asChild>
            <Link to="/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar produtos..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <Select
              value={filter}
              onValueChange={(value) => setFilter(value as any)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estoque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os produtos</SelectItem>
                <SelectItem value="low">Estoque crítico</SelectItem>
                <SelectItem value="medium">Estoque baixo</SelectItem>
                <SelectItem value="good">Estoque adequado</SelectItem>
              </SelectContent>
            </Select>
            
            {loadingCategories ? (
              <Skeleton className="h-10 w-40" />
            ) : (
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todas categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, index) => (
              <Skeleton key={index} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive text-lg">Erro ao carregar produtos</p>
            <Button className="mt-4" variant="outline" onClick={() => {
              window.location.reload();
            }}>
              Tentar novamente
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Nenhum produto encontrado
            </p>
            <Button className="mt-4" variant="outline" onClick={handleClearFilters}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50" 
                    onClick={() => toggleSort("name")}
                  >
                    Nome {getSortIcon("name")}
                  </TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50" 
                    onClick={() => toggleSort("quantity")}
                  >
                    Quantidade {getSortIcon("quantity")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50" 
                    onClick={() => toggleSort("price")}
                  >
                    Preço {getSortIcon("price")}
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.quantity, product.minimumStock);
                  
                  return (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        {product.category || "—"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.quantity}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(product.price)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            stockStatus.class.includes("red") ? "destructive" :
                            stockStatus.class.includes("yellow") ? "secondary" : "default"
                          }
                        >
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          asChild
                        >
                          <Link to={`/products/${product.id}`}>
                            Detalhes
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default InventoryPage;
