
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
      console.log(`🚀 [STOCK_SERVICE] Criando movimentação SIMPLES:`, data);

      // APENAS INSERIR - SEM VALIDAÇÃO MANUAL, SEM EVENTOS CUSTOMIZADOS
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

      console.log('✅ [STOCK_SERVICE] Movimentação criada:', movement);
      
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
  }
};
