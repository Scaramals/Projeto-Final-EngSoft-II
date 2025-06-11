
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StockService } from '@/services/stockService';

export const useRealtimeStock = (productId?: string) => {
  const [currentStock, setCurrentStock] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refreshStock = useCallback(async () => {
    if (!productId || productId === 'new') {
      console.log('⚠️ [REALTIME_STOCK] ID inválido:', productId);
      setCurrentStock(0);
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('📊 [REALTIME_STOCK] Buscando estoque para produto:', productId);
      const stock = await StockService.getCurrentStock(productId);
      console.log('📊 [REALTIME_STOCK] Estoque atual:', stock);
      setCurrentStock(stock);
    } catch (error) {
      console.error('❌ [REALTIME_STOCK] Erro ao atualizar estoque:', error);
      setCurrentStock(0);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (!productId || productId === 'new') {
      console.log('⚠️ [REALTIME_STOCK] Ignorando produto com ID inválido:', productId);
      setCurrentStock(0);
      setIsLoading(false);
      return;
    }

    // Carregar estoque inicial
    const loadInitialStock = async () => {
      setIsLoading(true);
      await refreshStock();
    };

    loadInitialStock();

    // APENAS REALTIME DO SUPABASE - SEM EVENTOS CUSTOMIZADOS
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
          console.log('📡 [REALTIME_STOCK] Produto atualizado via Realtime');
          refreshStock();
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 [REALTIME_STOCK] Removendo canal realtime para produto:', productId);
      supabase.removeChannel(channel);
    };
  }, [productId, refreshStock]);

  return {
    currentStock,
    isLoading,
    refreshStock
  };
};
