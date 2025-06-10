
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StockService } from "@/services/stockService";

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  type: 'in' | 'out';
  date: string;
  supplierId?: string;
  supplierName?: string;
  notes?: string;
  createdBy?: string;
}

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

  // CRIAR MOVIMENTAÇÃO SIMPLIFICADA - SEM VALIDAÇÃO MANUAL
  const createMovement = useCallback(async (data: {
    productId: string;
    quantity: number;
    type: 'in' | 'out';
    notes?: string;
    supplierId?: string;
  }) => {
    try {
      // Usar o StockService que já cuida de tudo
      return await StockService.createMovement(data);
    } catch (error: any) {
      console.error('Erro ao criar movimentação:', error);
      return { success: false, message: error.message };
    }
  }, []);

  // VALIDAÇÃO SIMPLES - APENAS CHAMADA RPC
  const validateMovement = useCallback(async (
    productId: string,
    quantity: number,
    type: 'in' | 'out',
    supplierId?: string
  ) => {
    try {
      // Verificar se é entrada sem fornecedor
      if (type === 'in' && !supplierId) {
        return {
          isValid: false,
          currentStock: 0,
          message: 'Entrada de estoque obrigatoriamente deve ter um fornecedor'
        };
      }

      // Usar validação RPC do banco
      return await StockService.validateMovement(productId, quantity, type);
    } catch (error: any) {
      console.error('Erro na validação:', error);
      return {
        isValid: false,
        currentStock: 0,
        message: error.message || 'Erro na validação'
      };
    }
  }, []);

  // Hook para movimentações em tempo real
  const useRealtimeMovements = (productId?: string, limit: number = 50) => {
    useEffect(() => {
      fetchMovements(productId, limit);

      // Escutar mudanças em tempo real
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
    validateMovement,
    useRealtimeMovements
  };
};
