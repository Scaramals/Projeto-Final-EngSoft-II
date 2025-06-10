
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StockService } from '@/services/stockService';

export const useRealtimeStock = (productId?: string) => {
  const [currentStock, setCurrentStock] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refreshStock = useCallback(async () => {
    if (!productId) return;
    
    try {
      const stock = await StockService.getCurrentStock(productId);
      setCurrentStock(stock);
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
    }
  }, [productId]);

  useEffect(() => {
    if (!productId) return;

    // Carregar estoque inicial
    const loadInitialStock = async () => {
      setIsLoading(true);
      await refreshStock();
      setIsLoading(false);
    };

    loadInitialStock();

    // Escutar atualizações via eventos customizados
    const handleStockUpdate = (event: CustomEvent) => {
      if (event.detail?.productId === productId) {
        refreshStock();
      }
    };

    const handleGeneralUpdate = () => {
      refreshStock();
    };

    window.addEventListener('stock-updated', handleStockUpdate as EventListener);
    window.addEventListener('movements-updated', handleGeneralUpdate);

    // Escutar mudanças via Supabase Realtime
    const channel = supabase
      .channel(`product-${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`
        },
        () => {
          console.log('📡 Produto atualizado via Realtime');
          refreshStock();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('stock-updated', handleStockUpdate as EventListener);
      window.removeEventListener('movements-updated', handleGeneralUpdate);
      supabase.removeChannel(channel);
    };
  }, [productId, refreshStock]);

  return {
    currentStock,
    isLoading,
    refreshStock
  };
};
