
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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
      const { data, error } = await supabase.rpc('get_movements_with_details', {
        limit_param: limit
      });

      if (error) throw error;

      const formattedMovements = (data || []).map(movement => ({
        id: movement.id,
        productId: movement.product_id,
        productName: movement.product_name || 'Produto não encontrado',
        quantity: movement.quantity,
        type: movement.type as 'in' | 'out',
        date: movement.date,
        supplierId: movement.supplier_id,
        supplierName: movement.supplier_name,
        notes: movement.notes,
        createdBy: movement.created_by
      })) as StockMovement[];

      if (productId) {
        setMovements(formattedMovements.filter(m => m.productId === productId));
      } else {
        setMovements(formattedMovements);
      }
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      setMovements([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createMovement = useCallback(async (data: {
    productId: string;
    quantity: number;
    type: 'in' | 'out';
    notes?: string;
    supplierId?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('stock_movements')
        .insert({
          product_id: data.productId,
          quantity: data.quantity,
          type: data.type,
          notes: data.notes || null,
          supplier_id: data.supplierId || null,
          date: new Date().toISOString()
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao criar movimentação:', error);
      return { success: false, message: error.message };
    }
  }, []);

  const validateMovement = useCallback(async (
    productId: string,
    quantity: number,
    type: 'in' | 'out',
    supplierId?: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('validate_stock_movement_v2', {
        product_id_param: productId,
        quantity_param: quantity,
        type_param: type,
        supplier_id_param: supplierId || null
      });

      if (error) throw error;

      return {
        isValid: data.isValid,
        currentStock: data.currentStock,
        message: data.message,
        productName: data.productName
      };
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
