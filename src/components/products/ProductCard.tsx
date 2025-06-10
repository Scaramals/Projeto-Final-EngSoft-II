
import React from "react";
import { Link } from "react-router-dom";
import { Product } from "@/types";
import { formatCurrency, getStockStatus } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const stockStatus = getStockStatus(product.quantity, product.minimumStock);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden card-hover border">
      <div className="h-40 bg-gray-100 flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-4xl text-gray-300 font-bold">
            {product.name.substring(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{product.name}</h3>
          {product.category && (
            <Badge variant="outline">{product.category}</Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
          {product.description}
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
