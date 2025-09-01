import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StockService } from '@/services/stockService';

// Mock com vi.hoisted
const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn()
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

describe('StockService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentStock', () => {
    it('deve retornar estoque atual de um produto', async () => {
      const mockStock = 50;
      mockSupabase.rpc.mockResolvedValueOnce({ 
        data: mockStock, 
        error: null 
      });

      const result = await StockService.getCurrentStock('product-123');
      expect(result).toBe(mockStock);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_current_stock', { product_id: 'product-123' });
    });

    it('deve retornar 0 quando produto não encontrado', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({ 
        data: null, 
        error: null 
      });

      const result = await StockService.getCurrentStock('invalid-id');
      expect(result).toBe(0);
    });

    it('deve lançar erro quando houver erro na consulta', async () => {
      const mockError = new Error('Database error');
      mockSupabase.rpc.mockResolvedValueOnce({ 
        data: null, 
        error: mockError 
      });

      await expect(StockService.getCurrentStock('product-123')).rejects.toThrow('Database error');
    });
  });

  describe('createMovement', () => {
    it('deve criar movimentação de entrada com sucesso', async () => {
      const mockMovement = {
        productId: 'product-123',
        quantity: 10,
        type: 'in' as const,
        notes: 'Entrada de estoque'
      };

      // Mock para buscar produto antes
      const mockSingle = vi.fn().mockResolvedValueOnce({
        data: { quantity: 20, name: 'Produto Teste' },
        error: null
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockSupabase.from.mockReturnValueOnce({ select: mockSelect });

      // Mock para inserir movimentação
      const mockSelectMovement = vi.fn().mockResolvedValueOnce({
        data: [{ id: 'movement-123' }],
        error: null
      });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelectMovement });
      mockSupabase.from.mockReturnValueOnce({ insert: mockInsert });

      // Mock para buscar produto depois
      const mockSingle2 = vi.fn().mockResolvedValueOnce({
        data: { quantity: 30, name: 'Produto Teste' },
        error: null
      });
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle2 });
      const mockSelect2 = vi.fn().mockReturnValue({ eq: mockEq2 });
      mockSupabase.from.mockReturnValueOnce({ select: mockSelect2 });

      const result = await StockService.createMovement(mockMovement);
      expect(result.success).toBe(true);
    });

    it('deve retornar erro quando produto não encontrado', async () => {
      const mockMovement = {
        productId: 'invalid-id',
        quantity: 10,
        type: 'in' as const
      };

      const mockSingle = vi.fn().mockResolvedValueOnce({
        data: null,
        error: { message: 'Product not found' }
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockSupabase.from.mockReturnValueOnce({ select: mockSelect });

      const result = await StockService.createMovement(mockMovement);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Produto não encontrado');
    });
  });
});