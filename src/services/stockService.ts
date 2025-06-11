
import { supabase } from "@/integrations/supabase/client";
import { StockMovement } from "@/types";

export interface StockValidationResult {
  isValid: boolean;
  currentStock: number;
  message?: string;
  productName?: string;
}

export interface CreateMovementData {
  productId: string;
  quantity: number;
  type: 'in' | 'out';
  notes?: string;
  supplierId?: string;
}

/**
 * Serviço ULTRA-SIMPLIFICADO para operações de estoque
 * O trigger do banco cuida de TODA validação e atualização automaticamente
 */
export const StockService = {
  /**
   * Criar movimentação - APENAS INSERT SIMPLES
   * O trigger valida e atualiza automaticamente
   */
  async createMovement(data: CreateMovementData): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      console.log(`🚀 [STOCK_SERVICE] === INÍCIO CRIAÇÃO MOVIMENTAÇÃO ===`);
      console.log(`🚀 [STOCK_SERVICE] Dados recebidos:`, data);
      console.log(`🚀 [STOCK_SERVICE] Timestamp:`, new Date().toISOString());

      // BUSCAR ESTOQUE ANTES DA MOVIMENTAÇÃO
      const { data: productBefore, error: productError } = await supabase
        .from('products')
        .select('quantity, name')
        .eq('id', data.productId)
        .single();

      if (productError) {
        console.error('❌ [STOCK_SERVICE] Erro ao buscar produto:', productError);
        return {
          success: false,
          message: 'Produto não encontrado'
        };
      }

      console.log(`📊 [STOCK_SERVICE] Estoque ANTES: ${productBefore.quantity} para produto "${productBefore.name}"`);

      // APENAS INSERIR - SEM VALIDAÇÃO MANUAL, SEM EVENTOS CUSTOMIZADOS
      console.log(`💾 [STOCK_SERVICE] Inserindo movimentação no banco...`);
      
      const { data: movement, error } = await supabase
        .from('stock_movements')
        .insert({
          product_id: data.productId,
          quantity: data.quantity,
          type: data.type,
          notes: data.notes || null,
          supplier_id: data.supplierId || null,
          date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [STOCK_SERVICE] Erro ao criar movimentação:', error);
        
        if (error.message.includes('Estoque insuficiente')) {
          return {
            success: false,
            message: error.message
          };
        }
        
        return {
          success: false,
          message: 'Erro ao registrar movimentação'
        };
      }

      console.log('✅ [STOCK_SERVICE] Movimentação inserida no banco:', movement);

      // BUSCAR ESTOQUE DEPOIS DA MOVIMENTAÇÃO
      const { data: productAfter, error: productAfterError } = await supabase
        .from('products')
        .select('quantity, name')
        .eq('id', data.productId)
        .single();

      if (productAfterError) {
        console.error('❌ [STOCK_SERVICE] Erro ao buscar produto após movimentação:', productAfterError);
      } else {
        console.log(`📊 [STOCK_SERVICE] Estoque DEPOIS: ${productAfter.quantity} para produto "${productAfter.name}"`);
        
        const expectedChange = data.type === 'in' ? data.quantity : -data.quantity;
        const actualChange = productAfter.quantity - productBefore.quantity;
        
        console.log(`🔍 [STOCK_SERVICE] ANÁLISE:`);
        console.log(`   - Mudança esperada: ${expectedChange}`);
        console.log(`   - Mudança real: ${actualChange}`);
        console.log(`   - Status: ${actualChange === expectedChange ? '✅ CORRETO' : '❌ INCORRETO'}`);
        
        if (actualChange !== expectedChange) {
          console.error(`🚨 [STOCK_SERVICE] DUPLICAÇÃO DETECTADA!`);
          console.error(`   - Movimentação: ${data.type} ${data.quantity}`);
          console.error(`   - Esperado: ${expectedChange}`);
          console.error(`   - Real: ${actualChange}`);
        }
      }
      
      console.log(`🚀 [STOCK_SERVICE] === FIM CRIAÇÃO MOVIMENTAÇÃO ===`);
      
      // SEM EVENTOS CUSTOMIZADOS - APENAS REALTIME DO SUPABASE
      return {
        success: true,
        data: movement
      };
    } catch (error: any) {
      console.error('❌ [STOCK_SERVICE] Erro crítico:', error);
      return {
        success: false,
        message: error.message || 'Erro inesperado'
      };
    }
  },

  /**
   * Buscar estoque atual
   */
  async getCurrentStock(productId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_current_stock', {
        product_id_param: productId
      });

      if (error) {
        console.error('❌ [STOCK_SERVICE] Erro ao buscar estoque:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('❌ [STOCK_SERVICE] Erro ao buscar estoque:', error);
      return 0;
    }
  },

  /**
   * Buscar movimentações
   */
  async getMovementsWithDetails(limit: number = 50): Promise<StockMovement[]> {
    try {
      const { data, error } = await supabase.rpc('get_movements_with_details', {
        limit_param: limit
      });

      if (error) {
        console.error('❌ [STOCK_SERVICE] Erro ao buscar movimentações:', error);
        return [];
      }

      return (data || []).map(movement => ({
        id: movement.id,
        productId: movement.product_id,
        productName: movement.product_name,
        quantity: movement.quantity,
        type: movement.type as 'in' | 'out',
        date: movement.date,
        supplierId: movement.supplier_id,
        supplierName: movement.supplier_name,
        notes: movement.notes,
        userId: movement.created_by,
        createdBy: movement.created_by,
        updatedAt: movement.updated_at
      }));
    } catch (error) {
      console.error('❌ [STOCK_SERVICE] Erro ao buscar movimentações:', error);
      return [];
    }
  },

  /**
   * Validar movimentação - SIMPLIFICADO (só para UI feedback)
   */
  async validateMovement(productId: string, quantity: number, type: 'in' | 'out'): Promise<StockValidationResult> {
    try {
      const { data, error } = await supabase.rpc('validate_stock_movement', {
        product_id_param: productId,
        quantity_param: quantity,
        type_param: type
      });

      if (error) {
        console.error('❌ [STOCK_SERVICE] Erro na validação:', error);
        return {
          isValid: false,
          currentStock: 0,
          message: 'Erro na validação'
        };
      }

      // Type cast the JSON response to the expected structure
      const validation = data as {
        isValid: boolean;
        currentStock: number;
        message?: string;
        productName?: string;
      };

      return {
        isValid: validation.isValid,
        currentStock: validation.currentStock,
        message: validation.message,
        productName: validation.productName
      };
    } catch (error) {
      console.error('❌ [STOCK_SERVICE] Erro na validação:', error);
      return {
        isValid: false,
        currentStock: 0,
        message: 'Erro na validação'
      };
    }
  },

  /**
   * Buscar produtos com estoque baixo
   */
  async getLowStockProducts(): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('get_low_stock_products_v2');

      if (error) {
        console.error('❌ [STOCK_SERVICE] Erro ao buscar produtos com estoque baixo:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ [STOCK_SERVICE] Erro ao buscar produtos com estoque baixo:', error);
      return [];
    }
  }
};
