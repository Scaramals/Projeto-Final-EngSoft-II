
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertsService, Alert } from "@/services/alertsService";
import { useQueryClient } from "@tanstack/react-query";

export function useRealTimeNotifications() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Carregar alertas iniciais
    AlertsService.getAllAlerts().then(setAlerts);

    // WebSocket para produtos com estoque baixo
    const productChannel = supabase
      .channel('product-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: 'quantity=lte.minimum_stock'
        },
        (payload) => {
          const product = payload.new;
          if (product.quantity <= (product.minimum_stock || 5)) {
            const newAlert: Alert = {
              id: `low-stock-${product.id}`,
              type: 'low_stock',
              severity: product.quantity === 0 ? 'critical' : 'high',
              title: 'Estoque Baixo',
              message: `${product.name} possui apenas ${product.quantity} unidades`,
              isRead: false,
              createdAt: new Date().toISOString(),
            };
            
            setAlerts(prev => [newAlert, ...prev]);
            
            toast({
              variant: "destructive",
              title: "⚠️ Estoque Baixo",
              description: `${product.name} - ${product.quantity} unidades restantes`,
            });

            // Invalidar cache do dashboard quando houver mudanças
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats-optimized'] });
            queryClient.invalidateQueries({ queryKey: ['low-stock-count'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-alerts'] });
          }
        }
      )
      .subscribe();

    // WebSocket para movimentações de alto valor
    const movementChannel = supabase
      .channel('movement-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stock_movements'
        },
        async (payload) => {
          const movement = payload.new;
          
          // Buscar dados do produto para calcular valor
          const { data: product } = await supabase
            .from('products')
            .select('name, price')
            .eq('id', movement.product_id)
            .single();

          if (product) {
            const totalValue = movement.quantity * product.price;
            
            if (totalValue > 1000) { // Movimentação acima de R$ 1.000
              const newAlert: Alert = {
                id: `high-value-${movement.id}`,
                type: 'high_value_movement',
                severity: 'medium',
                title: 'Movimentação de Alto Valor',
                message: `${movement.type === 'in' ? 'Entrada' : 'Saída'} de ${movement.quantity} ${product.name} - R$ ${totalValue.toFixed(2)}`,
                isRead: false,
                createdAt: new Date().toISOString(),
              };
              
              setAlerts(prev => [newAlert, ...prev]);

              // Invalidar cache do dashboard quando houver mudanças
              queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
              queryClient.invalidateQueries({ queryKey: ['dashboard-stats-optimized'] });
              queryClient.invalidateQueries({ queryKey: ['low-stock-count'] });
              queryClient.invalidateQueries({ queryKey: ['notifications-alerts'] });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productChannel);
      supabase.removeChannel(movementChannel);
    };
  }, [toast, queryClient]);

  return { alerts, setAlerts };
}
