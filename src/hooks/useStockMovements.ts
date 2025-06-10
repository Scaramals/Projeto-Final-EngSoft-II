
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StockMovement } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { SecureLogger } from "@/services/secureLogger";
import { toast } from "sonner";

/**
 * Helper function to convert StockMovement type to database format
 */
const mapStockMovementToDbStockMovement = (movement: Partial<StockMovement>, userId?: string) => {
  const dbMovement: any = {};
  
  if (movement.productId !== undefined) dbMovement.product_id = movement.productId;
  if (movement.quantity !== undefined) dbMovement.quantity = movement.quantity;
  if (movement.type !== undefined) dbMovement.type = movement.type;
  if (movement.notes !== undefined) dbMovement.notes = movement.notes;
  if (movement.supplierId !== undefined) dbMovement.supplier_id = movement.supplierId;
  
  if (userId) {
    dbMovement.created_by = userId;
    dbMovement.user_id = userId;
  }
  
  return dbMovement;
};

/**
 * Helper function to convert database response to StockMovement type
 */
const mapDbStockMovementToStockMovement = (dbMovement: any): StockMovement => ({
  id: dbMovement.id,
  productId: dbMovement.product_id,
  quantity: dbMovement.quantity,
  type: dbMovement.type as 'in' | 'out',
  date: dbMovement.date,
  notes: dbMovement.notes,
  supplierId: dbMovement.supplier_id,
  createdBy: dbMovement.created_by,
  updatedAt: dbMovement.updated_at || dbMovement.date,
  productName: dbMovement.product_name,
  supplierName: dbMovement.supplier_name,
});

export function useStockMovements() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Add stock movement - FOCO ÚNICO: registrar UMA movimentação
  const useAddStockMovement = () => {
    return useMutation({
      mutationFn: async (movement: Partial<StockMovement>) => {
        console.log('🔄 [HOOK] Iniciando registro de movimentação:', movement);
        
        if (!movement.productId || !movement.quantity || !movement.type) {
          throw new Error('Dados de movimentação incompletos');
        }

        if (!user?.id) {
          throw new Error('Usuário não autenticado');
        }

        // Converter para formato do banco
        const dbMovement = mapStockMovementToDbStockMovement(movement, user.id);
        console.log('💾 [HOOK] Dados para inserção no banco:', dbMovement);
        
        // Inserir no banco - APENAS UMA VEZ
        const { data, error } = await supabase
          .from('stock_movements')
          .insert(dbMovement)
          .select()
          .single();
          
        if (error) {
          console.error('❌ [HOOK] Erro no banco:', error);
          throw new Error(`Erro ao registrar movimentação: ${error.message}`);
        }
        
        console.log('✅ [HOOK] Movimentação registrada no banco:', data);
        return mapDbStockMovementToStockMovement(data);
      },
      onSuccess: (data, variables) => {
        console.log('🎉 [HOOK] Sucesso - invalidando queries específicas');
        
        // Invalidar apenas queries necessárias
        queryClient.invalidateQueries({ queryKey: ['products', variables.productId] });
        queryClient.invalidateQueries({ queryKey: ['productMovements', variables.productId] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        
        SecureLogger.success(`Movimentação ${variables.type} de ${variables.quantity} unidades registrada`);
        toast.success(`${variables.type === 'in' ? 'Entrada' : 'Saída'} de ${variables.quantity} unidades registrada!`);
      },
      onError: (error: any) => {
        console.error('❌ [HOOK] Erro:', error.message);
        SecureLogger.error('Erro no registro da movimentação', error);
        toast.error(`Erro: ${error.message}`);
      }
    });
  };

  return {
    useAddStockMovement
  };
}
