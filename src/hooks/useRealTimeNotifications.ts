
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertsService, Alert } from "@/services/alertsService";
import { SecureLogger } from "@/services/secureLogger";

export function useRealTimeNotifications() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    let isSubscribed = true;
    
    // Carregar alertas iniciais com tratamento de erro
    const loadInitialAlerts = async () => {
      try {
        const initialAlerts = await AlertsService.getAllAlerts();
        if (isSubscribed) {
          setAlerts(initialAlerts);
        }
      } catch (error) {
        SecureLogger.error('Erro ao carregar alertas iniciais', error);
      }
    };

    loadInitialAlerts();

    // WebSocket para produtos com estoque baixo com melhor tratamento de erro
    const productChannel = supabase
      .channel('product-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products'
        },
        async (payload) => {
          try {
            if (!isSubscribed) return;
            
            const product = payload.new;
            
            // Verificar se o produto tem estoque baixo
            if (product.minimum_stock && product.quantity <= product.minimum_stock) {
              const newAlert: Alert = {
                id: `low-stock-${product.id}-${Date.now()}`,
                type: 'low_stock',
                severity: product.quantity === 0 ? 'critical' : 'high',
                title: 'Estoque Baixo',
                message: `${product.name} possui apenas ${product.quantity} unidades`,
                isRead: false,
                createdAt: new Date().toISOString(),
              };
              
              setAlerts(prev => [newAlert, ...prev.slice(0, 49)]); // Limitar a 50 alertas
              
              toast({
                variant: "destructive",
                title: "⚠️ Estoque Baixo",
                description: `${product.name} - ${product.quantity} unidades restantes`,
              });

              // Trigger custom events for cache invalidation instead of react-query
              setTimeout(() => {
                if (isSubscribed) {
                  window.dispatchEvent(new CustomEvent('dashboard-data-updated'));
                  window.dispatchEvent(new CustomEvent('low-stock-updated'));
                  window.dispatchEvent(new CustomEvent('notifications-updated'));
                }
              }, 1000);
            }
          } catch (error) {
            SecureLogger.error('Erro ao processar atualização de produto', error);
          }
        }
      )
      .subscribe();

    // WebSocket para movimentações de alto valor com melhor tratamento
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
          try {
            if (!isSubscribed) return;
            
            const movement = payload.new;
            
            // Buscar dados do produto para calcular valor
            const { data: product, error } = await supabase
              .from('products')
              .select('name, price')
              .eq('id', movement.product_id)
              .single();

            if (error) {
              SecureLogger.error('Erro ao buscar produto para movimentação', error);
              return;
            }

            if (product) {
              const totalValue = movement.quantity * product.price;
              
              if (totalValue > 1000) { // Movimentação acima de R$ 1.000
                const newAlert: Alert = {
                  id: `high-value-${movement.id}-${Date.now()}`,
                  type: 'high_value_movement',
                  severity: 'medium',
                  title: 'Movimentação de Alto Valor',
                  message: `${movement.type === 'in' ? 'Entrada' : 'Saída'} de ${movement.quantity} ${product.name} - R$ ${totalValue.toFixed(2)}`,
                  isRead: false,
                  createdAt: new Date().toISOString(),
                };
                
                setAlerts(prev => [newAlert, ...prev.slice(0, 49)]); // Limitar a 50 alertas

                // Trigger custom events for cache invalidation instead of react-query
                setTimeout(() => {
                  if (isSubscribed) {
                    window.dispatchEvent(new CustomEvent('dashboard-data-updated'));
                    window.dispatchEvent(new CustomEvent('movements-updated'));
                    window.dispatchEvent(new CustomEvent('notifications-updated'));
                  }
                }, 1000);
              }
            }
          } catch (error) {
            SecureLogger.error('Erro ao processar nova movimentação', error);
          }
        }
      )
      .subscribe();

    return () => {
      isSubscribed = false;
      
      try {
        supabase.removeChannel(productChannel);
        supabase.removeChannel(movementChannel);
      } catch (error) {
        SecureLogger.error('Erro ao remover canais de WebSocket', error);
      }
    };
  }, [toast]);

  return { alerts, setAlerts };
}
