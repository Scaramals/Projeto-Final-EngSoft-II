
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StockMovement } from "@/types";
import { StockService } from "@/services/stockService";

export const useStockMovements = () => {
  const [allStockMovements, setAllStockMovements] = useState<StockMovement[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  const fetchAllStockMovements = useCallback(async () => {
    setIsLoadingAll(true);
    try {
      console.log("[INFO] Buscando todas as movimentações via RPC");
      
      const movements = await StockService.getMovementsWithDetails(100);
      setAllStockMovements(movements);
    } catch (error) {
      console.error("Erro ao buscar movimentações:", error);
      setAllStockMovements([]);
    } finally {
      setIsLoadingAll(false);
    }
  }, []);

  const fetchProductMovements = useCallback(async (productId: string): Promise<StockMovement[]> => {
    if (!productId) return [];
    
    try {
      const { data, error } = await supabase
        .from("stock_movements")
        .select(`
          *,
          products!inner(name),
          suppliers(name, cnpj)
        `)
        .eq('product_id', productId)
        .order("date", { ascending: false });

      if (error) {
        console.error("Erro ao buscar movimentações do produto:", error);
        return [];
      }

      return (data || []).map((movement) => ({
        id: movement.id,
        productId: movement.product_id,
        productName: movement.products?.name,
        quantity: movement.quantity,
        type: movement.type as 'in' | 'out',
        date: movement.date,
        supplierId: movement.supplier_id,
        supplierName: movement.suppliers?.name,
        notes: movement.notes,
        userId: movement.user_id,
        createdBy: movement.created_by,
        updatedAt: movement.updated_at,
      })) as StockMovement[];
    } catch (error) {
      console.error("Erro ao buscar movimentações do produto:", error);
      return [];
    }
  }, []);

  const useAllStockMovements = () => {
    useEffect(() => {
      fetchAllStockMovements();

      // Escutar eventos de atualização
      const handleUpdate = () => {
        setTimeout(fetchAllStockMovements, 1000);
      };

      window.addEventListener('movements-updated', handleUpdate);
      
      // Escutar realtime do Supabase
      const channel = supabase
        .channel('stock_movements_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'stock_movements'
          },
          () => {
            console.log('📡 Movimentação atualizada via Realtime');
            fetchAllStockMovements();
          }
        )
        .subscribe();
      
      return () => {
        window.removeEventListener('movements-updated', handleUpdate);
        supabase.removeChannel(channel);
      };
    }, [fetchAllStockMovements]);

    return {
      data: allStockMovements,
      isLoading: isLoadingAll,
      refetch: fetchAllStockMovements
    };
  };

  const useProductMovements = (productId?: string) => {
    const [productMovements, setProductMovements] = useState<StockMovement[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadProductMovements = useCallback(async () => {
      if (!productId) return;
      
      setIsLoading(true);
      try {
        const movements = await fetchProductMovements(productId);
        setProductMovements(movements);
      } catch (error) {
        console.error("Erro ao carregar movimentações do produto:", error);
        setProductMovements([]);
      } finally {
        setIsLoading(false);
      }
    }, [productId, fetchProductMovements]);

    useEffect(() => {
      loadProductMovements();

      // Escutar eventos de atualização
      const handleUpdate = () => {
        loadProductMovements();
      };

      window.addEventListener('movements-updated', handleUpdate);
      window.addEventListener('stock-updated', handleUpdate);
      
      return () => {
        window.removeEventListener('movements-updated', handleUpdate);
        window.removeEventListener('stock-updated', handleUpdate);
      };
    }, [loadProductMovements]);

    return {
      data: productMovements,
      isLoading,
      refetch: loadProductMovements
    };
  };

  return {
    useAllStockMovements,
    useProductMovements,
  };
};
