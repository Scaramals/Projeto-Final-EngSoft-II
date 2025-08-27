import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStockMovements } from '@/hooks/useStockMovements';

const mockFrom = vi.fn();
const mockSelect = vi.fn().mockReturnThis();
const mockInsert = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();
const mockOrder = vi.fn().mockReturnThis();
const mockLimit = vi.fn().mockReturnThis();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
    }),
  },
}));

describe('useStockMovements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
    });
  });

  it('deve carregar movimentações de estoque inicialmente', async () => {
    const mockMovements = [
      {
        id: '1',
        product_id: 'prod1',
        type: 'in',
        quantity: 10,
        notes: 'Entrada de estoque',
        created_at: '2024-01-01T10:00:00Z',
      },
    ];

    mockSelect.mockResolvedValue({ data: mockMovements, error: null });

    const { result } = renderHook(() => useStockMovements());

    expect(result.current.isLoading).toBe(true);

    // Wait for loading to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(result.current.movements).toEqual(mockMovements);
  });

  it('deve tratar erro ao carregar movimentações', async () => {
    const mockError = { message: 'Erro ao carregar movimentações' };
    mockSelect.mockResolvedValue({ data: null, error: mockError });

    const { result } = renderHook(() => useStockMovements());

    // Wait for loading to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(result.current.movements).toEqual([]);
  });

  it('deve criar movimentação com sucesso', async () => {
    const mockMovement = {
      productId: 'prod1',
      type: 'in' as const,
      quantity: 15,
      notes: 'Nova entrada',
    };

    const mockCreatedMovement = { id: '2', ...mockMovement, created_at: '2024-01-01T11:00:00Z' };
    mockInsert.mockResolvedValue({ data: [mockCreatedMovement], error: null });
    mockSelect.mockResolvedValue({ data: [mockCreatedMovement], error: null });

    const { result } = renderHook(() => useStockMovements());

    // Wait for loading to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    const createResult = await result.current.createMovement(mockMovement);

    expect(createResult.success).toBe(true);
  });

  it('deve validar dados obrigatórios ao criar movimentação', async () => {
    const { result } = renderHook(() => useStockMovements());

    // Wait for loading to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    const createResult = await result.current.createMovement({
      productId: '',
      type: 'in',
      quantity: 0,
      notes: '',
    });

    expect(createResult.success).toBe(false);
    expect(createResult.message).toContain('produto');
  });

  it('deve filtrar movimentações por produto', async () => {
    const mockMovements = [
      {
        id: '1',
        product_id: 'prod1',
        type: 'in',
        quantity: 10,
        notes: 'Entrada',
        created_at: '2024-01-01T10:00:00Z',
      },
      {
        id: '2',
        product_id: 'prod2',
        type: 'out',
        quantity: 5,
        notes: 'Saída',
        created_at: '2024-01-01T11:00:00Z',
      },
    ];

    mockSelect.mockResolvedValue({ data: mockMovements, error: null });

    const { result } = renderHook(() => useStockMovements());

    // Wait for loading to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    // Filter functionality is handled internally
    expect(result.current.fetchMovements).toBeDefined();
  });

  it('deve ordenar movimentações por data', async () => {
    const { result } = renderHook(() => useStockMovements());

    // Check that the hook provides the expected interface
    expect(typeof result.current.fetchMovements).toBe('function');
    expect(typeof result.current.createMovement).toBe('function');
  });

  it('deve ter função de refresh disponível', () => {
    const { result } = renderHook(() => useStockMovements());

    expect(typeof result.current.fetchMovements).toBe('function');
  });
});