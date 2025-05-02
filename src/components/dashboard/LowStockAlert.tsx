
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";

interface LowStockAlertProps {
  products: Product[];
}

export const LowStockAlert: React.FC<LowStockAlertProps> = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="data-card">
        <h3 className="text-lg font-semibold mb-2">Alertas de Estoque</h3>
        <p className="text-muted-foreground">Todos os produtos estão com estoque adequado</p>
      </div>
    );
  }

  return (
    <div className="data-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Alertas de Estoque</h3>
        <span className="status-badge status-low">{products.length} produtos</span>
      </div>
      
      <div className="space-y-3">
        {products.map(product => (
          <div key={product.id} className="flex items-center justify-between border-b pb-2">
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                Estoque atual: <span className="font-medium text-red-600">{product.quantity}</span>
              </p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link to={`/products/${product.id}`}>Visualizar</Link>
            </Button>
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <Button variant="outline" className="w-full" asChild>
          <Link to="/inventory">Ver todos os alertas</Link>
        </Button>
      </div>
    </div>
  );
};
