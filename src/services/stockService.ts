
import { supabase } from "@/integrations/supabase/client";
import { StockMovement } from "@/types";

export interface StockValidationResult {
  isValid: boolean;
  currentStock: number;
  message?: string;
}

export interface CreateMovementData {
  productId: string;
  quantity: number;
  type: 'in' | 'out';
  notes?: string;
  supplierId?: string;
}

/**
 * Serviço principal para operações de estoque
 */
export const StockService = {
  /**
   * Validar movimentação de estoque em tempo real
   */
  async validateMovement(productId: string, quantity: number, type: 'in' | 'out'): Promise<StockValidationResult> {
    try {
      console.log(`🔍 [STOCK_SERVICE] Validando ${type} de ${quantity} unidades para produto ${productId}`);
      
      // Buscar estoque atual diretamente do banco
      const { data: product, error } = await supabase
        .from('products')
        .select('quantity, name')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('❌ [STOCK_SERVICE] Erro ao buscar produto:', error);
        return {
          isValid: false,
          currentStock: 0,
          message: 'Produto não encontrado'
        };
      }

      const currentStock = product.quantity;
      console.log(`📊 [STOCK_SERVICE] Estoque atual: ${currentStock}`);

      // Validação para saídas
      if (type === 'out') {
        if (currentStock === 0) {
          return {
            isValid: false,
            currentStock,
            message: `Produto "${product.name}" sem estoque disponível`
          };
        }

        if (currentStock < quantity) {
          return {
            isValid: false,
            currentStock,
            message: `Estoque insuficiente. Disponível: ${currentStock}, Solicitado: ${quantity}`
          };
        }
      }

      return {
        isValid: true,
        currentStock
      };
    } catch (error) {
      console.error('❌ [STOCK_SERVICE] Erro na validação:', error);
      return {
        isValid: false,
        currentStock: 0,
        message: 'Erro ao validar movimentação'
      };
    }
  },

  /**
   * Criar movimentação de estoque
   */
  async createMovement(data: CreateMovementData): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      console.log(`🚀 [STOCK_SERVICE] Criando movimentação:`, data);

      // Validação final antes da criação
      const validation = await this.validateMovement(data.productId, data.quantity, data.type);
      
      if (!validation.isValid) {
        console.error('❌ [STOCK_SERVICE] Validação falhou:', validation.message);
        return {
          success: false,
          message: validation.message
        };
      }

      // Criar movimentação
      const { data: movement, error } = await supabase
        .from('stock_movements')
        .insert({
          product_id: data.productId,
          quantity: data.quantity,
          type: data.type,
          notes: data.notes || '',
          supplier_id: data.supplierId || null,
          date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [STOCK_SERVICE] Erro ao criar movimentação:', error);
        return {
          success: false,
          message: error.message.includes('Estoque insuficiente') 
            ? error.message 
            : 'Erro ao registrar movimentação'
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
   * Buscar movimentações de um produto
   */
  async getProductMovements(productId: string): Promise<StockMovement[]> {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          products!inner(name),
          suppliers(name, cnpj)
        `)
        .eq('product_id', productId)
        .order('date', { ascending: false });

      if (error) {
        console.error('❌ [STOCK_SERVICE] Erro ao buscar movimentações:', error);
        return [];
      }

      return (data || []).map(movement => ({
        id: movement.id,
        productId: movement.product_id,
        productName: movement.products?.name,
        quantity: movement.quantity,
        type: movement.type as 'in' | 'out',
        date: movement.date,
        supplierId: movement.supplier_id,
        supplierName: movement.suppliers?.name,
        notes: movement.notes,
        userId: movement.user_id,
        createdBy: movement.created_by,
        updatedAt: movement.updated_at
      }));
    } catch (error) {
      console.error('❌ [STOCK_SERVICE] Erro ao buscar movimentações:', error);
      return [];
    }
  },

  /**
   * Buscar estoque atual de um produto
   */
  async getCurrentStock(productId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('❌ [STOCK_SERVICE] Erro ao buscar estoque:', error);
        return 0;
      }

      return data.quantity || 0;
    } catch (error) {
      console.error('❌ [STOCK_SERVICE] Erro ao buscar estoque:', error);
      return 0;
    }
  }
};
