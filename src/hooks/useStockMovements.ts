
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

  // Add stock movement
  const useAddStockMovement = () => {
    return useMutation({
      mutationFn: async (movement: Partial<StockMovement>) => {
        console.log('🔄 [HOOK] === INICIANDO REGISTRO DE MOVIMENTAÇÃO ===');
        console.log('🔄 [HOOK] Dados recebidos:', movement);
        console.log('🔄 [HOOK] User ID:', user?.id);
        console.log('🔄 [HOOK] Timestamp:', new Date().toISOString());
        
        if (!movement.productId || !movement.quantity || !movement.type) {
          console.error('❌ [HOOK] Dados incompletos');
          throw new Error('Dados de movimentação incompletos');
        }

        if (!user?.id) {
          console.error('❌ [HOOK] Usuário não autenticado');
          throw new Error('Usuário não autenticado');
        }

        // Verificar estoque atual ANTES da inserção
        console.log('🔍 [HOOK] Verificando estoque atual antes da inserção...');
        const { data: preCheck, error: preCheckError } = await supabase
          .from('products')
          .select('quantity, name')
          .eq('id', movement.productId)
          .single();
        
        if (preCheckError) {
          console.error('❌ [HOOK] Erro na verificação prévia:', preCheckError);
        } else {
          console.log(`📊 [HOOK] Estoque PRÉ-inserção: ${preCheck.quantity} para ${preCheck.name}`);
        }

        // Converter para formato do banco
        const dbMovement = mapStockMovementToDbStockMovement(movement, user.id);
        console.log('💾 [HOOK] Dados formatados para inserção:', dbMovement);
        
        // Inserir no banco
        console.log('🔄 [HOOK] Executando inserção no banco...');
        const { data, error } = await supabase
          .from('stock_movements')
          .insert(dbMovement)
          .select()
          .single();
          
        if (error) {
          console.error('❌ [HOOK] Erro na inserção:', error);
          console.error('❌ [HOOK] Código do erro:', error.code);
          console.error('❌ [HOOK] Detalhes:', error.details);
          console.error('❌ [HOOK] Hint:', error.hint);
          throw new Error(`Erro ao registrar movimentação: ${error.message}`);
        }
        
        console.log('✅ [HOOK] Movimentação inserida:', data);
        
        // Verificar estoque atual APÓS a inserção
        console.log('🔍 [HOOK] Verificando estoque atual APÓS a inserção...');
        const { data: postCheck, error: postCheckError } = await supabase
          .from('products')
          .select('quantity, name, updated_at')
          .eq('id', movement.productId)
          .single();
        
        if (postCheckError) {
          console.error('❌ [HOOK] Erro na verificação pós-inserção:', postCheckError);
        } else {
          console.log(`📊 [HOOK] Estoque PÓS-inserção: ${postCheck.quantity} para ${postCheck.name}`);
          console.log(`📊 [HOOK] Última atualização: ${postCheck.updated_at}`);
        }
        
        console.log('🔄 [HOOK] === FIM DO REGISTRO ===');
        return mapDbStockMovementToStockMovement(data);
      },
      onSuccess: async (data, variables) => {
        console.log('🎉 [HOOK] === SUCESSO NA MOVIMENTAÇÃO ===');
        console.log('🎉 [HOOK] Dados retornados:', data);
        console.log('🎉 [HOOK] Variáveis:', variables);
        
        // FORÇAR invalidação e refetch imediato
        console.log('🔄 [HOOK] FORÇANDO invalidação completa...');
        
        // Invalidar TODAS as queries relacionadas
        await queryClient.invalidateQueries({ queryKey: ['products'] });
        await queryClient.invalidateQueries({ queryKey: ['productMovements'] });
        await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        
        // Remover dados específicos do cache para forçar refetch
        queryClient.removeQueries({ queryKey: ['products', variables.productId] });
        
        // Refetch específico do produto
        await queryClient.refetchQueries({ queryKey: ['products', variables.productId] });
        
        SecureLogger.success(`Movimentação ${variables.type} de ${variables.quantity} unidades registrada`);
        toast.success(`${variables.type === 'in' ? 'Entrada' : 'Saída'} de ${variables.quantity} unidades registrada!`);
        console.log('🎉 [HOOK] === FIM DO SUCESSO ===');
      },
      onError: (error: any) => {
        console.error('❌ [HOOK] === ERRO NA MOVIMENTAÇÃO ===');
        console.error('❌ [HOOK] Erro completo:', error);
        console.error('❌ [HOOK] Mensagem:', error.message);
        console.error('❌ [HOOK] Stack:', error.stack);
        SecureLogger.error('Erro no registro da movimentação', error);
        toast.error(`Erro: ${error.message}`);
        console.error('❌ [HOOK] === FIM DO ERRO ===');
      }
    });
  };

  return {
    useAddStockMovement
  };
}
