
import React from "react";
import { Link } from "react-router-dom";
import { Product } from "@/types";
import { formatCurrency, getStockStatus } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "./CategoryBadge";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const stockStatus = getStockStatus(product.quantity, product.minimumStock);

  return (
    <div className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow">
      <div className="h-40 bg-gray-100 flex items-center justify-center rounded-t-lg">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover rounded-t-lg"
          />
        ) : (
          <div className="text-4xl text-gray-300 font-bold">
            {product.name.substring(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg truncate" title={product.name}>
            {product.name}
          </h3>
          <CategoryBadge categoryId={product.categoryId} />
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {product.description || "Sem descrição disponível"}
        </p>
        
        <div className="flex justify-between items-center mb-4">
          <p className="font-bold text-lg">
            {formatCurrency(product.price)}
          </p>
          <Badge className={stockStatus.class}>
            {product.quantity} un. • {stockStatus.label}
          </Badge>
        </div>
        
        <Button variant="outline" className="w-full" asChild>
          <Link to={`/products/${product.id}`}>Ver detalhes</Link>
        </Button>
      </div>
    </div>
  );
};
