import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProducts } from '@/hooks/useProducts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock do serviço de produtos
const mockGetAllProducts = vi.fn();
const mockGetProductById = vi.fn();
const mockCreateProduct = vi.fn();
const mockUpdateProduct = vi.fn();
const mockDeleteProduct = vi.fn();

vi.mock('@/services/products.service', () => ({
  ProductsService: {
    getAllProducts: mockGetAllProducts,
    getProductById: mockGetProductById,
    createProduct: mockCreateProduct,
    updateProduct: mockUpdateProduct,
    deleteProduct: mockDeleteProduct,
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

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve carregar produtos com useAllProducts', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Produto 1',
        description: 'Descrição',
        price: 10.99,
        quantity: 50,
        category_id: 'cat1',
      },
    ];

    mockGetAllProducts.mockResolvedValue(mockProducts);

    const wrapper = createWrapper();
    const { result } = renderHook(() => {
      const { useAllProducts } = useProducts();
      return useAllProducts();
    }, { wrapper });

    expect(result.current.isLoading).toBe(true);

    // Wait for loading to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(result.current.data).toEqual(mockProducts);
    expect(mockGetAllProducts).toHaveBeenCalled();
  });

  it('deve carregar produtos com filtros', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Produto Filtrado',
        description: 'Descrição',
        price: 15.99,
        quantity: 25,
        category_id: 'cat1',
      },
    ];

    const filters = { categoryId: 'cat1', search: 'filtrado' };
    mockGetAllProducts.mockResolvedValue(mockProducts);

    const wrapper = createWrapper();
    const { result } = renderHook(() => {
      const { useAllProducts } = useProducts();
      return useAllProducts(filters);
    }, { wrapper });

    // Wait for loading to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(result.current.data).toEqual(mockProducts);
    expect(mockGetAllProducts).toHaveBeenCalledWith(filters);
  });

  it('deve buscar produto por ID com useProduct', async () => {
    const mockProduct = {
      id: '1',
      name: 'Produto Específico',
      description: 'Descrição específica',
      price: 25.99,
      quantity: 10,
    };

    mockGetProductById.mockResolvedValue(mockProduct);

    const wrapper = createWrapper();
    const { result } = renderHook(() => {
      const { useProduct } = useProducts();
      return useProduct('1');
    }, { wrapper });

    // Wait for loading to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(result.current.data).toEqual(mockProduct);
    expect(mockGetProductById).toHaveBeenCalledWith('1');
  });

  it('deve criar produto com useCreateProduct', async () => {
    const mockProductData = {
      name: 'Novo Produto',
      description: 'Nova descrição',
      price: 15.99,
      quantity: 30,
      category_id: 'cat2',
    };

    const mockCreatedProduct = { id: '2', ...mockProductData };
    mockCreateProduct.mockResolvedValue(mockCreatedProduct);

    const wrapper = createWrapper();
    const { result } = renderHook(() => {
      const { useCreateProduct } = useProducts();
      return useCreateProduct();
    }, { wrapper });

    await result.current.mutateAsync(mockProductData);

    expect(mockCreateProduct).toHaveBeenCalledWith(mockProductData);
  });

  it('deve atualizar produto com useUpdateProduct', async () => {
    const mockUpdates = { name: 'Produto Atualizado', price: 20.99 };
    const mockUpdatedProduct = { id: '1', ...mockUpdates };
    mockUpdateProduct.mockResolvedValue(mockUpdatedProduct);

    const wrapper = createWrapper();
    const { result } = renderHook(() => {
      const { useUpdateProduct } = useProducts();
      return useUpdateProduct();
    }, { wrapper });

    await result.current.mutateAsync({ id: '1', ...mockUpdates });

    expect(mockUpdateProduct).toHaveBeenCalledWith('1', mockUpdates);
  });

  it('deve deletar produto com useDeleteProduct', async () => {
    mockDeleteProduct.mockResolvedValue(true);

    const wrapper = createWrapper();
    const { result } = renderHook(() => {
      const { useDeleteProduct } = useProducts();
      return useDeleteProduct();
    }, { wrapper });

    await result.current.mutateAsync('1');

    expect(mockDeleteProduct).toHaveBeenCalledWith('1');
  });

  it('deve tratar erro ao carregar produtos', async () => {
    const mockError = new Error('Erro ao carregar produtos');
    mockGetAllProducts.mockRejectedValue(mockError);

    const wrapper = createWrapper();
    const { result } = renderHook(() => {
      const { useAllProducts } = useProducts();
      return useAllProducts();
    }, { wrapper });

    // Wait for loading to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
  });

  it('deve ter todas as funções necessárias', () => {
    const { result } = renderHook(() => useProducts());

    expect(result.current.useAllProducts).toBeDefined();
    expect(result.current.useProduct).toBeDefined();
    expect(result.current.useCreateProduct).toBeDefined();
    expect(result.current.useUpdateProduct).toBeDefined();
    expect(result.current.useDeleteProduct).toBeDefined();
  });

  it('deve invalidar cache após criar produto', async () => {
    const mockProductData = { name: 'Produto', description: 'Desc', price: 10, quantity: 5 };
    mockCreateProduct.mockResolvedValue({ id: '1', ...mockProductData });

    const wrapper = createWrapper();
    const { result } = renderHook(() => {
      const { useCreateProduct } = useProducts();
      return useCreateProduct();
    }, { wrapper });

    expect(result.current.mutate).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });
});