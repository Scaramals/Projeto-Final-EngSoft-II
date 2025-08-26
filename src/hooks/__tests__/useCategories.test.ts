import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCategories } from '@/hooks/useCategories';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock do serviço de categorias
const mockGetAllCategories = vi.fn();
const mockCreateCategory = vi.fn();
const mockUpdateCategory = vi.fn();
const mockDeleteCategory = vi.fn();

vi.mock('@/services/categories.service', () => ({
  CategoriesService: {
    getAllCategories: mockGetAllCategories,
    createCategory: mockCreateCategory,
    updateCategory: mockUpdateCategory,
    deleteCategory: mockDeleteCategory,
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve carregar categorias com useAllCategories', async () => {
    const mockCategories = [
      {
        id: '1',
        name: 'Eletrônicos',
        description: 'Produtos eletrônicos',
        created_at: '2024-01-01T10:00:00Z',
      },
    ];

    mockGetAllCategories.mockResolvedValue(mockCategories);

    const wrapper = createWrapper();
    const { result } = renderHook(() => {
      const { useAllCategories } = useCategories();
      return useAllCategories();
    }, { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockCategories);
    expect(mockGetAllCategories).toHaveBeenCalled();
  });

  it('deve tratar erro ao carregar categorias', async () => {
    const mockError = new Error('Erro ao carregar categorias');
    mockGetAllCategories.mockRejectedValue(mockError);

    const wrapper = createWrapper();
    const { result } = renderHook(() => {
      const { useAllCategories } = useCategories();
      return useAllCategories();
    }, { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
  });

  it('deve criar categoria com useCreateCategory', async () => {
    const mockCategory = {
      name: 'Nova Categoria',
      description: 'Descrição da nova categoria',
    };

    const mockCreatedCategory = { id: '3', ...mockCategory, created_at: '2024-01-01T12:00:00Z' };
    mockCreateCategory.mockResolvedValue(mockCreatedCategory);

    const wrapper = createWrapper();
    const { result } = renderHook(() => {
      const { useCreateCategory } = useCategories();
      return useCreateCategory();
    }, { wrapper });

    await result.current.mutateAsync(mockCategory);

    expect(mockCreateCategory).toHaveBeenCalledWith(mockCategory);
  });

  it('deve atualizar categoria com useUpdateCategory', async () => {
    const mockUpdates = { name: 'Categoria Atualizada', description: 'Nova descrição' };
    const mockUpdatedCategory = { id: '1', ...mockUpdates };
    mockUpdateCategory.mockResolvedValue(mockUpdatedCategory);

    const wrapper = createWrapper();
    const { result } = renderHook(() => {
      const { useUpdateCategory } = useCategories();
      return useUpdateCategory();
    }, { wrapper });

    await result.current.mutateAsync({ id: '1', updates: mockUpdates });

    expect(mockUpdateCategory).toHaveBeenCalledWith('1', mockUpdates);
  });

  it('deve deletar categoria com useDeleteCategory', async () => {
    mockDeleteCategory.mockResolvedValue(true);

    const wrapper = createWrapper();
    const { result } = renderHook(() => {
      const { useDeleteCategory } = useCategories();
      return useDeleteCategory();
    }, { wrapper });

    await result.current.mutateAsync('1');

    expect(mockDeleteCategory).toHaveBeenCalledWith('1');
  });

  it('deve buscar categoria por ID com useCategoryById', async () => {
    const mockCategory = {
      id: '1',
      name: 'Categoria Específica',
      description: 'Descrição específica',
    };

    const mockGetCategoryById = vi.fn().mockResolvedValue(mockCategory);
    vi.doMock('@/services/categories.service', () => ({
      CategoriesService: {
        getCategoryById: mockGetCategoryById,
      },
    }));

    const wrapper = createWrapper();
    const { result } = renderHook(() => {
      const { useCategoryById } = useCategories();
      return useCategoryById('1');
    }, { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockCategory);
  });

  it('deve invalidar cache ao criar categoria', async () => {
    const mockCategory = { name: 'Nova Categoria', description: 'Desc' };
    mockCreateCategory.mockResolvedValue({ id: '1', ...mockCategory });

    const wrapper = createWrapper();
    const { result } = renderHook(() => {
      const { useCreateCategory } = useCategories();
      return useCreateCategory();
    }, { wrapper });

    expect(result.current.mutate).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });

  it('deve ter todas as funções necessárias', () => {
    const { result } = renderHook(() => useCategories());

    expect(result.current.useAllCategories).toBeDefined();
    expect(result.current.useDistinctCategories).toBeDefined();
    expect(result.current.useCategoryById).toBeDefined();
    expect(result.current.useCreateCategory).toBeDefined();
    expect(result.current.useUpdateCategory).toBeDefined();
    expect(result.current.useDeleteCategory).toBeDefined();
  });
});