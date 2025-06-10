
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SecureLogger } from "@/services/secureLogger";

interface LowStockProduct {
  id: string;
  name: string;
  quantity: number;
  minimum_stock: number | null;
}

export const LowStockAlert: React.FC = () => {
  const { toast } = useToast();

  // Buscar produtos com estoque baixo usando função RPC
  const { data: lowStockProducts = [], isLoading } = useQuery({
    queryKey: ['low-stock-products'],
    queryFn: async () => {
      SecureLogger.info('Buscando produtos com estoque baixo para alertas');
      
      // Usar função RPC que já existe no banco
      const { data, error } = await supabase.rpc('get_low_stock_products');

      if (error) {
        SecureLogger.error('Erro ao buscar produtos', error);
        throw new Error(`Erro ao buscar produtos: ${error.message}`);
      }

      // Converter e ordenar os produtos
      const lowStockItems = (data || [])
        .map(product => ({
          id: product.id,
          name: product.name,
          quantity: product.quantity,
          minimum_stock: product.minimum_stock
        }))
        .sort((a, b) => a.quantity - b.quantity);

      SecureLogger.success(`Produtos com estoque baixo encontrados: ${lowStockItems.length}`);
      return lowStockItems as LowStockProduct[];
    },
  });

  const handleViewProduct = (productId: string) => {
    SecureLogger.info('Ação: Visualizar produto selecionado');
    toast({
      title: "Produto visualizado",
      description: "Redirecionando para detalhes do produto...",
    });
  };

  if (isLoading) {
    return (
      <div className="data-card">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Alertas de Estoque
        </h3>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

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
