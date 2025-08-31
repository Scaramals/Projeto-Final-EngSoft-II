import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSuppliers } from '@/hooks/useSuppliers';

const mockSupabase = vi.hoisted(() => ({
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
  }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('useSuppliers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve carregar fornecedores inicialmente', async () => {
    const mockSuppliers = [
      {
        id: '1',
        name: 'Fornecedor 1',
        email: 'fornecedor1@test.com',
        phone: '(11) 99999-9999',
        address: 'Endereço 1',
      },
    ];

    mockSupabase.from().select.mockResolvedValue({ data: mockSuppliers, error: null });

    const { result } = renderHook(() => {
      const { useAllSuppliers } = useSuppliers();
      return useAllSuppliers();
    });

    expect(result.current.isLoading).toBe(true);

    // Wait for loading to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(result.current.data).toEqual(mockSuppliers);
  });

  it('deve tratar erro ao carregar fornecedores', async () => {
    const mockError = { message: 'Erro ao carregar fornecedores' };
    mockSupabase.from().select.mockResolvedValue({ data: null, error: mockError });

    const { result } = renderHook(() => {
      const { useAllSuppliers } = useSuppliers();
      return useAllSuppliers();
    });

    // Wait for loading to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(result.current.data).toEqual([]);
  });

  it('deve criar fornecedor com sucesso', async () => {
    const mockSupplier = {
      name: 'Novo Fornecedor',
      email: 'novo@fornecedor.com',
      phone: '(11) 88888-8888',
      address: 'Novo Endereço',
    };

    const mockCreatedSupplier = { id: '2', ...mockSupplier };
    mockSupabase.from().insert.mockResolvedValue({ data: [mockCreatedSupplier], error: null });
    mockSupabase.from().select.mockResolvedValue({ data: [mockCreatedSupplier], error: null });

    const { result } = renderHook(() => {
      const { useCreateSupplier } = useSuppliers();
      return useCreateSupplier();
    });

    // Wait for loading to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    const createdSupplier = await result.current.mutateAsync(mockSupplier);

    expect(createdSupplier).toBeDefined();
  });

  it('deve atualizar fornecedor com sucesso', async () => {
    const mockUpdates = { name: 'Fornecedor Atualizado', email: 'atualizado@test.com' };
    mockSupabase.from().update.mockResolvedValue({ data: [{ id: '1', ...mockUpdates }], error: null });
    mockSupabase.from().select.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(() => {
      const { useUpdateSupplier } = useSuppliers();
      return useUpdateSupplier();
    });

    // Wait for loading to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    const updatedSupplier = await result.current.mutateAsync({ id: '1', ...mockUpdates });

    expect(updatedSupplier).toBeDefined();
    expect(mockSupabase.from().update).toHaveBeenCalled();
    expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', '1');
  });

  it('deve deletar fornecedor com sucesso', async () => {
    mockSupabase.from().delete.mockResolvedValue({ data: null, error: null });
    mockSupabase.from().select.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(() => {
      const { useDeleteSupplier } = useSuppliers();
      return useDeleteSupplier();
    });

    // Wait for loading to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    const deletedId = await result.current.mutateAsync('1');

    expect(deletedId).toBe('1');
    expect(mockSupabase.from().delete).toHaveBeenCalled();
    expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', '1');
  });

  it('deve buscar fornecedor por ID', async () => {
    const mockSupplier = {
      id: '1',
      name: 'Fornecedor Específico',
      email: 'especifico@test.com',
    };

    mockSupabase.from().select.mockResolvedValue({ data: mockSupplier, error: null });

    const { result } = renderHook(() => {
      const { useSupplier } = useSuppliers();
      return useSupplier('1');
    });

    // Wait for loading to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(result.current.data).toEqual(mockSupplier);
    expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', '1');
  });
});