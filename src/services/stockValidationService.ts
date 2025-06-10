
import { supabase } from "@/integrations/supabase/client";

export const StockValidationService = {
  /**
   * Buscar estoque atual de um produto diretamente do banco
   */
  async getCurrentStock(productId: string): Promise<number> {
    try {
      console.log('📊 [VALIDATION] Buscando estoque atual para produto:', productId);
      
      const { data, error } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', productId)
        .single();
      
      if (error) {
        console.error('❌ [VALIDATION] Erro ao buscar estoque:', error);
        return 0;
      }
      
      const currentStock = data.quantity || 0;
      console.log('📊 [VALIDATION] Estoque atual no banco:', currentStock);
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
      console.log(`🔍 [VALIDATION] Validando ${type} de ${quantity} unidades`);
      
      const currentStock = await this.getCurrentStock(productId);
      
      if (type === 'out') {
        if (currentStock === 0) {
          return { 
            valid: false, 
            message: 'Produto sem estoque disponível',
            currentStock 
          };
        }
        
        if (currentStock < quantity) {
          return { 
            valid: false, 
            message: `Estoque insuficiente. Disponível: ${currentStock}, Solicitado: ${quantity}`,
            currentStock 
          };
        }
      }
      
      console.log('✅ [VALIDATION] Movimentação válida');
      return { valid: true, currentStock };
    } catch (error) {
      console.error('❌ [VALIDATION] Erro na validação:', error);
      return { valid: false, message: 'Erro na validação', currentStock: 0 };
    }
  }
};
