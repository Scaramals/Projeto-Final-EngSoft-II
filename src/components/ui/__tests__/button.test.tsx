import { describe, it, expect } from '@jest/globals';
import { render } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('deve renderizar com texto correto', () => {
    const { getByText } = render(<Button>Clique aqui</Button>);
    expect(getByText('Clique aqui')).toBeDefined();
  });

  it('deve aceitar className customizada', () => {
    const { container } = render(<Button className="custom-class">Botão</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('custom-class');
  });

  it('deve estar desabilitado quando disabled=true', () => {
    const { container } = render(<Button disabled>Botão Desabilitado</Button>);
    const button = container.querySelector('button');
    expect(button?.disabled).toBe(true);
  });
});