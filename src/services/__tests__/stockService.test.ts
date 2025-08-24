import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StockService } from '@/services/stockService';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client');

describe('StockService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentStock', () => {
    it('deve retornar estoque atual de um produto', async () => {
      const mockStock = 50;
      const mockResponse = { data: { current_stock: mockStock }, error: null };
      
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse)
          })
        })
      });

      const result = await StockService.getCurrentStock('product-123');
      expect(result).toBe(mockStock);
    });

    it('deve retornar 0 quando produto não encontrado', async () => {
      const mockResponse = { data: null, error: null };
      
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse)
          })
        })
      });

      const result = await StockService.getCurrentStock('invalid-id');
      expect(result).toBe(0);
    });

    it('deve lançar erro quando houver erro na consulta', async () => {
      const mockError = new Error('Database error');
      const mockResponse = { data: null, error: mockError };
      
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse)
          })
        })
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

      const mockResponse = { data: { id: 'movement-123' }, error: null };
      
      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue(mockResponse)
        })
      });

      const result = await StockService.createMovement(mockMovement);
      expect(result.success).toBe(true);
    });

    it('deve validar quantidade positiva', async () => {
      const mockMovement = {
        productId: 'product-123',
        quantity: -5,
        type: 'in' as const
      };

      const result = await StockService.createMovement(mockMovement);
      expect(result.success).toBe(false);
      expect(result.message).toContain('quantidade deve ser positiva');
    });

    it('deve validar se produto existe', async () => {
      const mockMovement = {
        productId: '',
        quantity: 10,
        type: 'in' as const
      };

      const result = await StockService.createMovement(mockMovement);
      expect(result.success).toBe(false);
      expect(result.message).toContain('produto é obrigatório');
    });
  });
});