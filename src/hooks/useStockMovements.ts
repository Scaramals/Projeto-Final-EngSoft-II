
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StockMovement } from "@/types";
import { toast } from "@/components/ui/use-toast";

export const useStockMovements = () => {
  const queryClient = useQueryClient();

  const useAllStockMovements = () => {
    return useQuery({
      queryKey: ["stock-movements"],
      queryFn: async (): Promise<StockMovement[]> => {
        console.log("[INFO] Buscando todas as movimentações de estoque");
        
        const { data, error } = await supabase
          .from("stock_movements")
          .select("*")
          .order("date", { ascending: false });

        if (error) {
          console.error("Erro ao buscar movimentações:", error);
          throw error;
        }

        return (data || []).map((movement) => ({
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
      },
    });
  };

  const useProductMovements = (productId?: string) => {
    return useQuery({
      queryKey: ["product-movements", productId],
      queryFn: async (): Promise<StockMovement[]> => {
        if (!productId) return [];
        
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
      },
      enabled: !!productId,
    });
  };

  const useCreateStockMovement = () => {
    return useMutation({
      mutationFn: async (movementData: {
        productId: string;
        quantity: number;
        type: 'in' | 'out';
        notes?: string;
        supplierId?: string | null;
      }) => {
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
        return data;
      },
      onSuccess: (data, variables) => {
        console.log('🎉 [MUTATION] === SUCESSO NA CRIAÇÃO ===');
        console.log('🎉 [MUTATION] Invalidando cache de forma controlada...');
        
        // Invalidar apenas as queries necessárias de forma mais controlada
        queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
        queryClient.invalidateQueries({ queryKey: ["product-movements", variables.productId] });
        queryClient.invalidateQueries({ queryKey: ["product", variables.productId] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
        
        console.log('✅ [MUTATION] Cache invalidado com sucesso');
        
        toast({
          title: "Movimentação registrada",
          description: `${variables.type === 'in' ? 'Entrada' : 'Saída'} de ${variables.quantity} unidades registrada com sucesso.`,
        });
      },
      onError: (error: any) => {
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
      },
    });
  };

  return {
    useAllStockMovements,
    useProductMovements,
    useCreateStockMovement,
  };
};
