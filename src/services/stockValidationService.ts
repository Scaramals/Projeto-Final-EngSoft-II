
import { supabase } from "@/integrations/supabase/client";

export const StockValidationService = {
  /**
   * Buscar estoque atual de um produto diretamente do banco
   */
  async getCurrentStock(productId: string): Promise<number> {
    try {
      console.log('🔍 [VALIDATION] Buscando estoque DIRETO do banco para produto:', productId);
      
      const { data, error } = await supabase
        .from('products')
        .select('quantity, name')
        .eq('id', productId)
        .single();
      
      if (error) {
        console.error('❌ [VALIDATION] Erro ao buscar estoque:', error);
        return 0;
      }
      
      const currentStock = data.quantity || 0;
      console.log(`📊 [VALIDATION] BANCO REAL - Produto: ${data.name}, Estoque: ${currentStock}`);
      return currentStock;
    } catch (error) {
      console.error('❌ [VALIDATION] Erro crítico:', error);
      return 0;
    }
  },

  /**
   * Validar se uma movimentação é possível
   */
  async validateMovement(productId: string, quantity: number, type: 'in' | 'out'): Promise<{valid: boolean, message?: string, currentStock: number}> {
    try {
      console.log(`🔍 [VALIDATION] === INICIANDO VALIDAÇÃO ===`);
      console.log(`🔍 [VALIDATION] Produto: ${productId}`);
      console.log(`🔍 [VALIDATION] Tipo: ${type}`);
      console.log(`🔍 [VALIDATION] Quantidade: ${quantity}`);
      
      const currentStock = await this.getCurrentStock(productId);
      console.log(`📊 [VALIDATION] Estoque obtido do banco: ${currentStock}`);
      
      if (type === 'out') {
        if (currentStock === 0) {
          console.error('❌ [VALIDATION] BLOQUEIO - Produto sem estoque');
          return { 
            valid: false, 
            message: 'Produto sem estoque disponível',
            currentStock 
          };
        }
        
        if (currentStock < quantity) {
          console.error(`❌ [VALIDATION] BLOQUEIO - Estoque insuficiente: ${currentStock} < ${quantity}`);
          return { 
            valid: false, 
            message: `Estoque insuficiente. Disponível: ${currentStock}, Solicitado: ${quantity}`,
            currentStock 
          };
        }
        
        console.log(`✅ [VALIDATION] APROVADO - Saída de ${quantity} quando há ${currentStock}`);
      } else {
        console.log(`✅ [VALIDATION] APROVADO - Entrada de ${quantity} unidades`);
      }
      
      console.log(`🔍 [VALIDATION] === FIM DA VALIDAÇÃO ===`);
      return { valid: true, currentStock };
    } catch (error) {
      console.error('❌ [VALIDATION] Erro na validação:', error);
      return { valid: false, message: 'Erro na validação', currentStock: 0 };
    }
  }
};
