
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StockService } from "@/services/stockService";
import { StockMovement } from "@/types";

export const useStockMovements = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMovements = useCallback(async (productId?: string, limit: number = 50) => {
    setIsLoading(true);
    try {
      const allMovements = await StockService.getMovementsWithDetails(limit);

      if (productId) {
        setMovements(allMovements.filter(m => m.productId === productId));
      } else {
        setMovements(allMovements);
      }
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      setMovements([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // CRIAR MOVIMENTAÇÃO ULTRA-SIMPLIFICADA
  const createMovement = useCallback(async (data: {
    productId: string;
    quantity: number;
    type: 'in' | 'out';
    notes?: string;
    supplierId?: string;
  }) => {
    try {
      return await StockService.createMovement(data);
    } catch (error: any) {
      console.error('Erro ao criar movimentação:', error);
      return { success: false, message: error.message };
    }
  }, []);

  // Hook para movimentações em tempo real - SIMPLIFICADO
  const useRealtimeMovements = (productId?: string, limit: number = 50) => {
    useEffect(() => {
      fetchMovements(productId, limit);

      // APENAS realtime do Supabase
      const channel = supabase
        .channel('movements_realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'stock_movements'
          },
          () => {
            console.log('📡 Movimentação atualizada via Realtime');
            fetchMovements(productId, limit);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [productId, limit, fetchMovements]);

    return {
      movements,
      isLoading,
      refetch: () => fetchMovements(productId, limit)
    };
  };

  return {
    movements,
    isLoading,
    fetchMovements,
    createMovement,
    useRealtimeMovements
  };
};
