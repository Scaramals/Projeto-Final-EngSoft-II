
import { supabase } from "@/integrations/supabase/client";

export const StockValidationService = {
  /**
   * Buscar estoque atual de um produto diretamente do banco
   */
  async getCurrentStock(productId: string): Promise<number> {
    try {
      console.log('🔍 [VALIDATION] === INICIANDO BUSCA DE ESTOQUE ===');
      console.log('🔍 [VALIDATION] Product ID:', productId);
      console.log('🔍 [VALIDATION] Timestamp:', new Date().toISOString());
      
      // Fazer a query diretamente
      const { data, error } = await supabase
        .from('products')
        .select('quantity, name, id, updated_at')
        .eq('id', productId)
        .single();
      
      console.log('🔍 [VALIDATION] Query executada');
      console.log('🔍 [VALIDATION] Dados retornados:', data);
      console.log('🔍 [VALIDATION] Erro retornado:', error);
      
      if (error) {
        console.error('❌ [VALIDATION] Erro na query:', error);
        return 0;
      }
      
      const currentStock = data.quantity || 0;
      console.log(`📊 [VALIDATION] === RESULTADO FINAL ===`);
      console.log(`📊 [VALIDATION] Produto: ${data.name}`);
      console.log(`📊 [VALIDATION] ID: ${data.id}`);
      console.log(`📊 [VALIDATION] Estoque: ${currentStock}`);
      console.log(`📊 [VALIDATION] Última atualização: ${data.updated_at}`);
      console.log(`📊 [VALIDATION] === FIM DA BUSCA ===`);
      
      return currentStock;
    } catch (error) {
      console.error('❌ [VALIDATION] Erro crítico na busca:', error);
      return 0;
    }
  },

  /**
   * Validar se uma movimentação é possível
   */
  async validateMovement(productId: string, quantity: number, type: 'in' | 'out'): Promise<{valid: boolean, message?: string, currentStock: number}> {
    try {
      console.log(`🔍 [VALIDATION] === INICIANDO VALIDAÇÃO DE MOVIMENTO ===`);
      console.log(`🔍 [VALIDATION] Product ID: ${productId}`);
      console.log(`🔍 [VALIDATION] Tipo: ${type}`);
      console.log(`🔍 [VALIDATION] Quantidade: ${quantity}`);
      console.log(`🔍 [VALIDATION] Timestamp: ${new Date().toISOString()}`);
      
      const currentStock = await this.getCurrentStock(productId);
      console.log(`📊 [VALIDATION] Estoque obtido: ${currentStock}`);
      
      if (type === 'out') {
        console.log(`🔍 [VALIDATION] Validando saída...`);
        
        if (currentStock === 0) {
          console.error('❌ [VALIDATION] BLOQUEIO - Produto sem estoque');
          return { 
            valid: false, 
            message: 'Produto sem estoque disponível',
            currentStock 
          };
        }
        
        if (currentStock < quantity) {
          console.error(`❌ [VALIDATION] BLOQUEIO - Estoque insuficiente`);
          console.error(`❌ [VALIDATION] Disponível: ${currentStock}`);
          console.error(`❌ [VALIDATION] Solicitado: ${quantity}`);
          return { 
            valid: false, 
            message: `Estoque insuficiente. Disponível: ${currentStock}, Solicitado: ${quantity}`,
            currentStock 
          };
        }
        
        console.log(`✅ [VALIDATION] APROVADO - Saída válida`);
      } else {
        console.log(`✅ [VALIDATION] APROVADO - Entrada sempre válida`);
      }
      
      console.log(`🔍 [VALIDATION] === FIM DA VALIDAÇÃO ===`);
      return { valid: true, currentStock };
    } catch (error) {
      console.error('❌ [VALIDATION] Erro na validação:', error);
      return { valid: false, message: 'Erro na validação', currentStock: 0 };
    }
  }
};
