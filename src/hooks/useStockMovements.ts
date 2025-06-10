
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StockMovement } from "@/types";
import { toast } from "@/components/ui/use-toast";

export const useStockMovements = () => {
  const [allStockMovements, setAllStockMovements] = useState<StockMovement[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fetchAllStockMovements = useCallback(async () => {
    setIsLoadingAll(true);
    try {
      console.log("[INFO] Buscando todas as movimentações de estoque");
      
      const { data, error } = await supabase
        .from("stock_movements")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error("Erro ao buscar movimentações:", error);
        throw error;
      }

      const movements = (data || []).map((movement) => ({
        id: movement.id,
        productId: movement.product_id,
        quantity: movement.quantity,
        type: movement.type as 'in' | 'out',
        date: movement.date,
        supplierId: movement.supplier_id,
        notes: movement.notes,
        userId: movement.user_id,
        createdBy: movement.created_by,
        updatedAt: movement.updated_at,
      })) as StockMovement[];

      setAllStockMovements(movements);
    } catch (error) {
      console.error("Erro ao buscar movimentações:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar movimentações",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAll(false);
    }
  }, []);

  const fetchProductMovements = useCallback(async (productId: string): Promise<StockMovement[]> => {
    if (!productId) return [];
    
    try {
      console.log("[INFO] Buscando histórico de movimentações do produto");
      
      const { data, error } = await supabase
        .rpc('get_product_movement_history', { 
          product_id_param: productId 
        });

      if (error) {
        console.error("Erro ao buscar movimentações do produto:", error);
        throw error;
      }

      return (data || []).map((movement: any) => ({
        id: movement.id,
        productId: movement.product_id,
        quantity: movement.quantity,
        type: movement.type as 'in' | 'out',
        date: movement.date,
        supplierId: movement.supplier_id,
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

  const createStockMovement = useCallback(async (movementData: {
    productId: string;
    quantity: number;
    type: 'in' | 'out';
    notes?: string;
    supplierId?: string | null;
  }) => {
    setIsCreating(true);
    try {
      console.log('🚀 [MUTATION] === INICIANDO CRIAÇÃO DE MOVIMENTAÇÃO ===');
      console.log('🚀 [MUTATION] Dados recebidos:', movementData);

      // Validação de dados
      if (!movementData.productId || !movementData.quantity || !movementData.type) {
        throw new Error('Dados obrigatórios não fornecidos');
      }

      if (movementData.quantity <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }

      console.log('📤 [MUTATION] Enviando para Supabase...');
      
      const { data, error } = await supabase
        .from("stock_movements")
        .insert({
          product_id: movementData.productId,
          quantity: movementData.quantity,
          type: movementData.type,
          notes: movementData.notes || "",
          supplier_id: movementData.supplierId || null,
          date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [MUTATION] Erro do Supabase:', error);
        throw error;
      }

      console.log('✅ [MUTATION] Movimentação criada com sucesso:', data);
      
      // Disparar eventos customizados para atualizar outras partes da aplicação
      window.dispatchEvent(new CustomEvent('dashboard-data-updated'));
      window.dispatchEvent(new CustomEvent('movements-updated'));
      
      // Recarregar movimentações
      fetchAllStockMovements();
      
      toast({
        title: "Movimentação registrada",
        description: `${movementData.type === 'in' ? 'Entrada' : 'Saída'} de ${movementData.quantity} unidades registrada com sucesso.`,
      });

      return data;
    } catch (error: any) {
      console.error('❌ [MUTATION] === ERRO NA CRIAÇÃO ===');
      console.error('❌ [MUTATION] Erro:', error);
      
      let errorMessage = "Erro ao registrar movimentação";
      
      if (error?.message?.includes('Estoque insuficiente')) {
        errorMessage = error.message;
      } else if (error?.message?.includes('violates check constraint')) {
        errorMessage = "Dados inválidos fornecidos";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [fetchAllStockMovements]);

  const useAllStockMovements = () => ({
    data: allStockMovements,
    isLoading: isLoadingAll,
    refetch: fetchAllStockMovements
  });

  const useProductMovements = (productId?: string) => {
    const [productMovements, setProductMovements] = useState<StockMovement[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      if (productId) {
        setIsLoading(true);
        fetchProductMovements(productId)
          .then(setProductMovements)
          .finally(() => setIsLoading(false));
      }
    }, [productId, fetchProductMovements]);

    return {
      data: productMovements,
      isLoading,
      refetch: () => productId ? fetchProductMovements(productId).then(setProductMovements) : Promise.resolve()
    };
  };

  const useCreateStockMovement = () => ({
    mutateAsync: createStockMovement,
    isPending: isCreating
  });

  return {
    useAllStockMovements,
    useProductMovements,
    useCreateStockMovement,
  };
};
