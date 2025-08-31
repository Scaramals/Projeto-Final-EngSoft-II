import { describe, it, expect } from 'vitest';
import { ProductCard } from '@/components/products/ProductCard';
import { Product } from '@/types';
import { renderWithProviders } from '@/test/utils';

const mockProduct: Product = {
  id: '1',
  name: 'Produto Teste',
  description: 'Descrição do produto teste',
  price: 99.99,
  quantity: 10,
  minimumStock: 5,
  categoryId: 'cat-1',
  imageUrl: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

describe('ProductCard', () => {
  it('deve renderizar informações básicas do produto', async () => {
    const { findByText } = renderWithProviders(<ProductCard product={mockProduct} />);

    expect(await findByText('Produto Teste')).toBeInTheDocument();
    expect(await findByText('Descrição do produto teste')).toBeInTheDocument();
  });

  it('deve mostrar informações de preço', () => {
    const { container } = renderWithProviders(<ProductCard product={mockProduct} />);

    expect(container.textContent).toContain('99.99');
  });

  it('deve mostrar informações de quantidade', () => {
    const { container } = renderWithProviders(<ProductCard product={mockProduct} />);

    expect(container.textContent).toContain('10');
  });

  it('deve renderizar produto com estoque baixo', () => {
    const lowStockProduct = {
      ...mockProduct,
      quantity: 3, // menor que minimumStock (5)
    };

    const { container } = renderWithProviders(<ProductCard product={lowStockProduct} />);

    expect(container.textContent).toContain('3');
  });

  it('deve renderizar produto sem estoque', () => {
    const outOfStockProduct = {
      ...mockProduct,
      quantity: 0,
    };

    const { container } = renderWithProviders(<ProductCard product={outOfStockProduct} />);

    expect(container.textContent).toContain('0');
  });

  it('deve renderizar imagem quando não há URL', async () => {
    const { findByRole } = renderWithProviders(<ProductCard product={mockProduct} />);

    const image = await findByRole('img');
    expect(image).toHaveAttribute('alt', 'Produto Teste');
  });

  it('deve renderizar com descrição longa', async () => {
    const longDescriptionProduct = {
      ...mockProduct,
      description: 'Esta é uma descrição muito longa que deveria ser truncada quando exceder o limite de caracteres permitido no card do produto'
    };

    const { findByText } = renderWithProviders(<ProductCard product={longDescriptionProduct} />);

    expect(await findByText(/Esta é uma descrição muito longa/)).toBeInTheDocument();
  });

  it('deve renderizar sem categoryId', async () => {
    const productWithoutCategory = {
      ...mockProduct,
      categoryId: undefined,
    };

    const { findByText } = renderWithProviders(<ProductCard product={productWithoutCategory} />);

    expect(await findByText('Produto Teste')).toBeInTheDocument();
  });
});