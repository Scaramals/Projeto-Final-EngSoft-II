
import { supabase } from "@/integrations/supabase/client";
import { StockMovement } from "@/types";
import { cacheService } from "./cacheService";

/**
 * Serviço para operações relacionadas a movimentações de estoque
 */
export const StockMovementsService = {
  /**
   * Obter todos os movimentos de estoque
   */
  async getAllStockMovements(): Promise<StockMovement[]> {
    try {
      const cacheKey = 'all_stock_movements';
      const cachedMovements = cacheService.get<StockMovement[]>(cacheKey);
      
      if (cachedMovements) {
        console.log('Using cached stock movements');
        return cachedMovements;
      }

      console.log('Fetching stock movements from database');
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*');
      
      if (error) {
        console.error('Error fetching stock movements:', error);
        throw error;
      }

       const stockMovements = (data || []).map((movement) => ({
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

      console.log('Stock movements fetched:', stockMovements.length);
      
      // Cache por 5 minutos
      cacheService.set(cacheKey, stockMovements, 300);
      
      return stockMovements;
    } catch (error) {
      console.error("Erro ao buscar movimentos de estoque:", error);
      throw error;
    }
  },

  /**
   * Validar movimentação de estoque - PRIMEIRA LINHA DE DEFESA
   */
  async validateMovement(productId: string, quantity: number, type: 'in' | 'out'): Promise<{valid: boolean, message?: string}> {
    try {
      console.log(`Validação em tempo real: ${type} de ${quantity} unidades para produto ${productId}`);
      
      if (type === 'out') {
        // Buscar estoque atual diretamente do banco (não do cache)
        const { data: product, error } = await supabase
          .from('products')
          .select('quantity, name')
          .eq('id', productId)
          .single();
        
        if (error) {
          console.error('Erro ao buscar produto para validação:', error);
          return { valid: false, message: 'Produto não encontrado' };
        }
        
        console.log(`Estoque atual no banco: ${product.quantity} unidades`);
        
        // VALIDAÇÃO ABSOLUTA: Não permitir saída maior que estoque
        if (product.quantity === 0) {
          console.error(`BLOQUEIO: Produto sem estoque. Produto: ${product.name}`);
          return { 
            valid: false, 
            message: `ERRO: Produto "${product.name}" não possui estoque disponível` 
          };
        }
        
        if (product.quantity < quantity) {
          console.error(`BLOQUEIO: Saída de ${quantity} unidades quando há apenas ${product.quantity}. Produto: ${product.name}`);
          return { 
            valid: false, 
            message: `ERRO: Estoque insuficiente para "${product.name}". Disponível: ${product.quantity}, Solicitado: ${quantity}` 
          };
        }
        
        console.log(`Validação OK: Saída de ${quantity} unidades permitida. Estoque atual: ${product.quantity}`);
      }
      
      return { valid: true };
    } catch (error) {
      console.error("Erro crítico na validação:", error);
      return { valid: false, message: 'Erro na validação - operação bloqueada por segurança' };
    }
  }
};
