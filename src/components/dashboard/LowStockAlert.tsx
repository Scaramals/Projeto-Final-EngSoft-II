
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LowStockAlertProps {
  products: Product[];
}

export const LowStockAlert: React.FC<LowStockAlertProps> = ({ products }) => {
  const { toast } = useToast();

  // Simular produtos com estoque baixo se não houver dados
  const lowStockProducts = products?.length > 0 ? products : [
    { id: '1', name: 'Produto A', quantity: 2, minimum_stock: 5 },
    { id: '2', name: 'Produto B', quantity: 1, minimum_stock: 10 },
    { id: '3', name: 'Produto C', quantity: 3, minimum_stock: 8 },
  ];

  const handleViewProduct = (productId: string) => {
    toast({
      title: "Produto visualizado",
      description: "Redirecionando para detalhes do produto...",
    });
  };

  if (lowStockProducts.length === 0) {
    return (
      <div className="data-card">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-green-500" />
          Alertas de Estoque
        </h3>
        <p className="text-muted-foreground">Todos os produtos estão com estoque adequado</p>
      </div>
    );
  }

  return (
    <div className="data-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Alertas de Estoque
        </h3>
        <span className="status-badge status-low">{lowStockProducts.length} produtos</span>
      </div>
      
      <div className="space-y-3">
        {lowStockProducts.slice(0, 5).map(product => (
          <div key={product.id} className="flex items-center justify-between border-b pb-2">
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                Estoque atual: <span className="font-medium text-red-600">{product.quantity}</span>
                {product.minimum_stock && (
                  <span className="text-xs ml-1">(mín: {product.minimum_stock})</span>
                )}
              </p>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleViewProduct(product.id)}
            >
              Visualizar
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
