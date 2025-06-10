
import React from "react";
import { Link } from "react-router-dom";
import { Product } from "@/types";
import { formatCurrency, getStockStatus } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
}

// Helper function to check if a string looks like a UUID
const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Helper function to generate a display name if the name is a UUID
const getDisplayName = (product: Product): string => {
  if (!product.name) return "Produto sem nome";
  
  // If name looks like a UUID, try to create a meaningful name
  if (isUUID(product.name)) {
    console.log('Product with UUID name detected:', product);
    
    // Try to use description or create a name based on category
    if (product.description && product.description.trim()) {
      return product.description.substring(0, 50);
    }
    
    if (product.category) {
      return `${product.category} - Produto ${product.name.substring(0, 8)}`;
    }
    
    return `Produto ${product.name.substring(0, 8)}`;
  }
  
  return product.name;
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const stockStatus = getStockStatus(product.quantity, product.minimumStock);
  const displayName = getDisplayName(product);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden card-hover border">
      <div className="h-40 bg-gray-100 flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-4xl text-gray-300 font-bold">
            {displayName.substring(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg" title={displayName}>
            {displayName}
          </h3>
          {product.category && (
            <Badge variant="outline">{product.category}</Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
          {product.description || "Sem descrição disponível"}
        </p>
        <div className="mt-4 flex justify-between items-center">
          <p className="font-bold text-lg">
            {formatCurrency(product.price)}
          </p>
          <Badge className={stockStatus.class}>
            {product.quantity} un. • {stockStatus.label}
          </Badge>
        </div>
        <div className="mt-4">
          <Button variant="outline" className="w-full" asChild>
            <Link to={`/products/${product.id}`}>Detalhes</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
