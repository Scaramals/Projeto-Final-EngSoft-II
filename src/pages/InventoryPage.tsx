
import React, { useState, useMemo, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MobileOptimizedLayout, MobileContainer, MobileCard } from "@/components/layout/MobileOptimizedLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { formatCurrency, getStockStatus, cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { ApiService } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryDisplay } from "@/components/products/CategoryDisplay";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Helper function to check if a string looks like a UUID
const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Helper function to generate a display name if the name is a UUID
const getDisplayName = (productName: string, description?: string): string => {
  if (!productName) return "Produto sem nome";
  
  // If name looks like a UUID, try to create a meaningful name
  if (isUUID(productName)) {
    if (description && description.trim()) {
      return description.substring(0, 50);
    }
    
    return `Produto ${productName.substring(0, 8)}`;
  }
  
  return productName;
};

const InventoryPage: React.FC = () => {
  const isMobile = useIsMobile();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState<"all" | "low" | "medium" | "good">("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all"); // Mudança: agora é categoryId
  const pageRef = useRef(null);
  
  // Componente de card para mobile
  const ProductMobileCard: React.FC<{ product: any }> = ({ product }) => {
    const stockStatus = getStockStatus(product.quantity, product.minimumStock);
    const totalValue = product.quantity * product.price;
    const displayName = getDisplayName(product.name, product.description);
    
    return (
      <MobileCard className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <Link 
              to={`/products/${product.id}`}
              className="font-medium hover:underline text-base leading-tight"
              title={displayName}
            >
              {displayName}
            </Link>
            {product.description && !isUUID(product.name) && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {product.description}
              </p>
            )}
          </div>
          <Badge className={cn("ml-2 shrink-0", stockStatus.class)}>
            {stockStatus.label}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Categoria:</span>
            <div className="mt-1">
              <CategoryDisplay categoryId={product.categoryId} />
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Estoque:</span>
            <div className="mt-1 font-medium">
              {product.quantity}
              {product.minimumStock && (
                <span className="text-xs text-muted-foreground ml-1">
                  (min: {product.minimumStock})
                </span>
              )}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Preço:</span>
            <div className="mt-1 font-medium">
              {formatCurrency(product.price)}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Total:</span>
            <div className="mt-1 font-medium">
              {formatCurrency(totalValue)}
            </div>
          </div>
        </div>
      </MobileCard>
    );
  };

  // Get products with filters using React Query
  const { useAllProducts } = useProducts();
  const { data: products = [], isLoading, error, refetch } = useAllProducts({
    search: searchQuery || undefined,
    categoryId: selectedCategoryId === "all" ? undefined : selectedCategoryId, // Mudança
    sortBy: sortBy as any,
    sortDirection: sortDirection
  });

  // Get categories using React Query - agora retorna objetos {id, name}
  const { useDistinctCategories } = useCategories();
  const { data: categories = [], isLoading: categoriesLoading } = useDistinctCategories();
  
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
    setSelectedCategoryId("all"); // Mudança
  };

  const handleRefresh = () => {
    refetch();
    // Clear cache to force fresh data
    ApiService.clearCache();
  };

  return (
    <AppLayout>
      <MobileContainer>
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Estoque</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Visualize e gerencie seus produtos em estoque
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button variant="outline" onClick={handleRefresh} className="sm:w-auto">
                Atualizar
              </Button>
              <Button asChild className="sm:w-auto">
                <Link to="/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Produto
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar produtos..."
                className="pl-9 text-base sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Select
                value={filter}
                onValueChange={(value) => setFilter(value as "all" | "low" | "medium" | "good")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="low">Baixo</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="good">Bom</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categoriesLoading ? (
                    <SelectItem value="loading" disabled>Carregando...</SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={handleClearFilters} className="sm:col-span-1">
                Limpar
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, index) => (
                <Skeleton key={index} className="h-32 sm:h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <MobileCard className="text-center py-8">
              <p className="text-destructive text-lg">Erro ao carregar produtos</p>
              <Button className="mt-4" variant="outline" onClick={handleRefresh}>
                Tentar novamente
              </Button>
            </MobileCard>
          ) : (
            <>
              {/* Mobile view */}
              {isMobile ? (
                <div className="space-y-3">
                  {filteredProducts.length === 0 ? (
                    <MobileCard className="text-center py-8">
                      <p className="text-muted-foreground">
                        Nenhum produto encontrado
                      </p>
                      <Button 
                        className="mt-2" 
                        variant="outline" 
                        onClick={handleClearFilters}
                      >
                        Limpar filtros
                      </Button>
                    </MobileCard>
                  ) : (
                    filteredProducts.map((product) => (
                      <ProductMobileCard key={product.id} product={product} />
                    ))
                  )}
                </div>
              ) : (
                /* Desktop table view */
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer select-none"
                          onClick={() => toggleSort("name")}
                        >
                          Produto {getSortIcon("name")}
                        </TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead 
                          className="cursor-pointer select-none text-right"
                          onClick={() => toggleSort("quantity")}
                        >
                          Estoque {getSortIcon("quantity")}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer select-none text-right"
                          onClick={() => toggleSort("price")}
                        >
                          Preço {getSortIcon("price")}
                        </TableHead>
                        <TableHead className="text-right">Valor Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <p className="text-muted-foreground">
                              Nenhum produto encontrado
                            </p>
                            <Button 
                              className="mt-2" 
                              variant="outline" 
                              onClick={handleClearFilters}
                            >
                              Limpar filtros
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProducts.map((product) => {
                          const stockStatus = getStockStatus(product.quantity, product.minimumStock);
                          const totalValue = product.quantity * product.price;
                          const displayName = getDisplayName(product.name, product.description);
                          
                          return (
                            <TableRow key={product.id}>
                              <TableCell>
                                <Link 
                                  to={`/products/${product.id}`}
                                  className="font-medium hover:underline"
                                  title={displayName}
                                >
                                  {displayName}
                                </Link>
                                {product.description && !isUUID(product.name) && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {product.description}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell>
                                <CategoryDisplay categoryId={product.categoryId} />
                              </TableCell>
                              <TableCell className="text-right">
                                {product.quantity}
                                {product.minimumStock && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    (min: {product.minimumStock})
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(product.price)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(totalValue)}
                              </TableCell>
                              <TableCell>
                                <Badge className={stockStatus.class}>
                                  {stockStatus.label}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </div>
      </MobileContainer>
    </AppLayout>
  );
};

export default InventoryPage;
