import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ProductCard } from '@/components/products/ProductCard';
import { BrowserRouter } from 'react-router-dom';
import { Product } from '@/types';

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

const ProductCardWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('ProductCard', () => {
  it('deve renderizar informações básicas do produto', () => {
    const { getByText } = render(
      <ProductCardWrapper>
        <ProductCard product={mockProduct} />
      </ProductCardWrapper>
    );

    expect(getByText('Produto Teste')).toBeInTheDocument();
    expect(getByText('Descrição do produto teste')).toBeInTheDocument();
  });

  it('deve mostrar informações de preço', () => {
    const { container } = render(
      <ProductCardWrapper>
        <ProductCard product={mockProduct} />
      </ProductCardWrapper>
    );

    expect(container.textContent).toContain('99.99');
  });

  it('deve mostrar informações de quantidade', () => {
    const { container } = render(
      <ProductCardWrapper>
        <ProductCard product={mockProduct} />
      </ProductCardWrapper>
    );

    expect(container.textContent).toContain('10');
  });

  it('deve renderizar produto com estoque baixo', () => {
    const lowStockProduct = {
      ...mockProduct,
      quantity: 3, // menor que minimumStock (5)
    };

    const { container } = render(
      <ProductCardWrapper>
        <ProductCard product={lowStockProduct} />
      </ProductCardWrapper>
    );

    expect(container.textContent).toContain('3');
  });

  it('deve renderizar produto sem estoque', () => {
    const outOfStockProduct = {
      ...mockProduct,
      quantity: 0,
    };

    const { container } = render(
      <ProductCardWrapper>
        <ProductCard product={outOfStockProduct} />
      </ProductCardWrapper>
    );

    expect(container.textContent).toContain('0');
  });

  it('deve renderizar imagem quando não há URL', () => {
    const { getByRole } = render(
      <ProductCardWrapper>
        <ProductCard product={mockProduct} />
      </ProductCardWrapper>
    );

    const image = getByRole('img');
    expect(image).toHaveAttribute('alt', 'Produto Teste');
  });

  it('deve renderizar com descrição longa', () => {
    const longDescriptionProduct = {
      ...mockProduct,
      description: 'Esta é uma descrição muito longa que deveria ser truncada quando exceder o limite de caracteres permitido no card do produto'
    };

    const { getByText } = render(
      <ProductCardWrapper>
        <ProductCard product={longDescriptionProduct} />
      </ProductCardWrapper>
    );

    expect(getByText(/Esta é uma descrição muito longa/)).toBeInTheDocument();
  });

  it('deve renderizar sem categoryId', () => {
    const productWithoutCategory = {
      ...mockProduct,
      categoryId: undefined,
    };

    const { getByText } = render(
      <ProductCardWrapper>
        <ProductCard product={productWithoutCategory} />
      </ProductCardWrapper>
    );

    expect(getByText('Produto Teste')).toBeInTheDocument();
  });
});