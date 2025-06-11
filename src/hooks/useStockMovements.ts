
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

  // CRIAR MOVIMENTAÇÃO COM LOGS DETALHADOS
  const createMovement = useCallback(async (data: {
    productId: string;
    quantity: number;
    type: 'in' | 'out';
    notes?: string;
    supplierId?: string;
  }) => {
    console.log(`🎯 [USE_STOCK_MOVEMENTS] === INÍCIO CREATE MOVEMENT ===`);
    console.log(`🎯 [USE_STOCK_MOVEMENTS] Hook chamado com:`, data);
    console.log(`🎯 [USE_STOCK_MOVEMENTS] Timestamp:`, new Date().toISOString());
    
    try {
      const result = await StockService.createMovement(data);
      console.log(`🎯 [USE_STOCK_MOVEMENTS] Resultado do serviço:`, result);
      console.log(`🎯 [USE_STOCK_MOVEMENTS] === FIM CREATE MOVEMENT ===`);
      return result;
    } catch (error: any) {
      console.error('❌ [USE_STOCK_MOVEMENTS] Erro no hook:', error);
      console.log(`🎯 [USE_STOCK_MOVEMENTS] === FIM CREATE MOVEMENT (ERRO) ===`);
      return { success: false, message: error.message };
    }
  }, []);

  // Hook para movimentações em tempo real - SIMPLIFICADO COM LOGS
  const useRealtimeMovements = (productId?: string, limit: number = 50) => {
    useEffect(() => {
      console.log(`📡 [REALTIME] Configurando realtime para produto:`, productId);
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
          (payload) => {
            console.log('📡 [REALTIME] Movimentação atualizada via Realtime:', payload);
            fetchMovements(productId, limit);
          }
        )
        .subscribe();

      return () => {
        console.log(`📡 [REALTIME] Removendo canal realtime`);
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
