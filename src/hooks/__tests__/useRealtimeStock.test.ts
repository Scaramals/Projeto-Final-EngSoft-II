import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRealtimeStock } from '@/hooks/useRealtimeStock';
import { StockService } from '@/services/stockService';

vi.mock('@/services/stockService');

describe('useRealtimeStock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar estoque 0 e loading false para ID inválido', async () => {
    const { result } = renderHook(() => useRealtimeStock('new'));

    // Aguardar a resolução async
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.currentStock).toBe(0);
  });

  it('deve carregar estoque inicial para produto válido', async () => {
    const mockStock = 25;
    (StockService.getCurrentStock as any).mockResolvedValue(mockStock);

    const { result } = renderHook(() => useRealtimeStock('product-123'));

    expect(result.current.isLoading).toBe(true);

    // Aguardar a resolução async
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.currentStock).toBe(mockStock);
    expect(StockService.getCurrentStock).toHaveBeenCalledWith('product-123');
  });

  it('deve tratar erro ao buscar estoque', async () => {
    const mockError = new Error('Service error');
    (StockService.getCurrentStock as any).mockRejectedValue(mockError);

    const { result } = renderHook(() => useRealtimeStock('product-123'));

    // Aguardar a resolução async
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.currentStock).toBe(0);
  });

  it('deve ter função refreshStock disponível', () => {
    const { result } = renderHook(() => useRealtimeStock('product-123'));

    expect(typeof result.current.refreshStock).toBe('function');
  });

  it('deve atualizar estoque quando refreshStock é chamado', async () => {
    const initialStock = 10;
    const updatedStock = 15;
    
    (StockService.getCurrentStock as any)
      .mockResolvedValueOnce(initialStock)
      .mockResolvedValueOnce(updatedStock);

    const { result } = renderHook(() => useRealtimeStock('product-123'));

    // Aguardar primeira carga
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(result.current.currentStock).toBe(initialStock);

    await result.current.refreshStock();

    // Aguardar atualização
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(result.current.currentStock).toBe(updatedStock);
    expect(StockService.getCurrentStock).toHaveBeenCalledTimes(2);
  });
});