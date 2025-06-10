
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
 * Serviço SIMPLIFICADO para operações de estoque
 * O trigger do banco cuida de toda validação e atualização automaticamente
 */
export const StockService = {
  /**
   * Validar movimentação usando função RPC do banco
   */
  async validateMovement(productId: string, quantity: number, type: 'in' | 'out'): Promise<StockValidationResult> {
    try {
      console.log(`🔍 [STOCK_SERVICE] Validando ${type} de ${quantity} unidades para produto ${productId}`);
      
      const { data, error } = await supabase.rpc('validate_stock_movement', {
        product_id_param: productId,
        quantity_param: quantity,
        type_param: type
      });

      if (error) {
        console.error('❌ [STOCK_SERVICE] Erro na validação RPC:', error);
        return {
          isValid: false,
          currentStock: 0,
          message: 'Erro ao validar movimentação'
        };
      }

      console.log(`✅ [STOCK_SERVICE] Resultado da validação:`, data);
      
      const result = data as unknown as StockValidationResult;
      
      return {
        isValid: result.isValid,
        currentStock: result.currentStock,
        message: result.message,
        productName: result.productName
      };
    } catch (error) {
      console.error('❌ [STOCK_SERVICE] Erro crítico na validação:', error);
      return {
        isValid: false,
        currentStock: 0,
        message: 'Erro inesperado na validação'
      };
    }
  },

  /**
   * Criar movimentação - O TRIGGER CUIDA DE TUDO AUTOMATICAMENTE
   */
  async createMovement(data: CreateMovementData): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      console.log(`🚀 [STOCK_SERVICE] Criando movimentação:`, data);

      // SIMPLES: Apenas inserir - o trigger valida e atualiza tudo
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
        
        // Verificar se é erro de estoque insuficiente do trigger
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

      console.log('✅ [STOCK_SERVICE] Movimentação criada com sucesso:', movement);
      
      // Disparar eventos para atualização da UI
      window.dispatchEvent(new CustomEvent('stock-updated', { detail: { productId: data.productId } }));
      window.dispatchEvent(new CustomEvent('movements-updated'));

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
   * Buscar estoque atual usando função RPC otimizada
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
   * Buscar movimentações usando função RPC otimizada
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
   * Buscar produtos com estoque baixo usando nova função RPC
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
